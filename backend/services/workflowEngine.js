import AuditLog from "../modules/audit/models/AuditLog.js";
import { emitToRole, emitNewAlert } from "../utils/socketServer.js";

const WORKFLOWS = {
  ENGAGEMENT_DROP: {
    id: "engagement_drop",
    trigger: { metric: "engagementTrend", condition: (v) => v < -30 },
    actions: [
      { type: "NOTIFY_ROLE", role: "hod", event: "workflow:alert", messageKey: "engagement_drop_hod" },
      { type: "CREATE_ALERT", severity: "warning", expiresInMs: 86400000 },
      { type: "LOG_AUDIT", action: "ENGAGEMENT_DROP_DETECTED" },
    ],
    escalation: {
      afterMs: 7200000,
      action: { type: "NOTIFY_ROLE", role: "dean", event: "workflow:alert", messageKey: "engagement_drop_dean" },
    },
  },
  APPROVAL_BACKLOG: {
    id: "approval_backlog",
    trigger: { metric: "totalPendingApprovals", condition: (v) => v > 10 },
    actions: [
      { type: "NOTIFY_ROLE", role: "principal", event: "workflow:alert", messageKey: "approval_backlog" },
      { type: "CREATE_ALERT", severity: "warning", expiresInMs: 86400000 },
      { type: "LOG_AUDIT", action: "APPROVAL_BACKLOG_DETECTED" },
    ],
  },
  DELIVERY_FAILURE: {
    id: "delivery_failure",
    trigger: { metric: "deliveryRate", condition: (v) => v < 70 },
    actions: [
      { type: "NOTIFY_ROLE", role: "admin", event: "workflow:alert", messageKey: "delivery_failure" },
      { type: "CREATE_ALERT", severity: "critical", expiresInMs: 86400000 },
      { type: "LOG_AUDIT", action: "DELIVERY_FAILURE_DETECTED" },
    ],
  },
  SUSPICIOUS_LOGINS: {
    id: "suspicious_logins",
    trigger: { metric: "failedLogins", condition: (v) => v > 10 },
    actions: [
      { type: "NOTIFY_ROLE", role: "admin", event: "workflow:security", messageKey: "suspicious_logins" },
      { type: "CREATE_ALERT", severity: "critical", expiresInMs: 43200000 },
      { type: "LOG_AUDIT", action: "SUSPICIOUS_LOGIN_SURGE" },
    ],
  },
};

const actionableAlerts = new Map();

export const getActionableAlerts = () => {
  const now = Date.now();
  const active = [];
  for (const [key, alert] of actionableAlerts) {
    if (alert.expiresAt > now) {
      active.push(alert);
    } else {
      actionableAlerts.delete(key);
    }
  }
  return active;
};

export async function evaluateWorkflows(metrics, trends) {
  const triggered = [];

  for (const [name, workflow] of Object.entries(WORKFLOWS)) {
    const metricValue = metrics?.[workflow.trigger.metric] ?? trends?.[workflow.trigger.metric];
    if (metricValue !== undefined && workflow.trigger.condition(metricValue)) {
      triggered.push({ name, workflow, metricValue });
    }
  }

  for (const { name, workflow, metricValue } of triggered) {
    await executeWorkflow(name, workflow, metricValue);
  }

  return triggered;
}

async function executeWorkflow(name, workflow, metricValue) {
  const alertKey = `${workflow.id}:${new Date().toDateString()}`;
  if (actionableAlerts.has(alertKey)) return;

  const expiresAt = Date.now() + (workflow.actions.find(a => a.type === "CREATE_ALERT")?.expiresInMs || 86400000);

  for (const action of workflow.actions) {
    switch (action.type) {
      case "NOTIFY_ROLE": {
        emitToRole(action.role, action.event, {
          workflowId: workflow.id,
          severity: workflow.actions.find(a => a.type === "CREATE_ALERT")?.severity || "info",
          message: getMessage(action.messageKey, metricValue),
          timestamp: Date.now(),
        });
        break;
      }
      case "CREATE_ALERT": {
        const alert = {
          id: alertKey,
          type: workflow.id,
          severity: action.severity,
          title: getTitle(workflow.id),
          message: getMessage(workflow.id + "_alert", metricValue),
          expiresAt,
        };
        actionableAlerts.set(alertKey, alert);
        emitNewAlert(alert);
        break;
      }
      case "LOG_AUDIT": {
        try {
          await AuditLog.create({
            adminId: null,
            action: action.action,
            targetId: null,
            targetType: "SYSTEM",
            description: `Workflow triggered: ${name} (value: ${metricValue})`,
            status: "SUCCESS",
          });
        } catch { /* ignore audit errors */ }
        break;
      }
    }
  }

  if (workflow.escalation) {
    setTimeout(async () => {
      const action = workflow.escalation.action;
      if (action.type === "NOTIFY_ROLE") {
        emitToRole(action.role, action.event, {
          workflowId: workflow.id,
          severity: "critical",
          message: getMessage(action.messageKey + "_escalated", metricValue),
          timestamp: Date.now(),
        });
      }
    }, workflow.escalation.afterMs);
  }
}

const MESSAGES = {
  engagement_drop_hod: (v) => `Engagement dropped ${Math.abs(v)}%. Review recent broadcasts in your department.`,
  engagement_drop_dean_escalated: (v) => `URGENT: Engagement still down ${Math.abs(v)}% after 2 hours. HODs have been notified.`,
  engagement_drop_alert: (v) => `Communication volume dropped ${Math.abs(v)}% compared to yesterday.`,
  approval_backlog: (v) => `${v} items pending approval. Review and process pending requests.`,
  approval_backlog_alert: (v) => `${v} approvals awaiting your decision.`,
  delivery_failure: (v) => `Delivery rate dropped to ${v}%. Investigate service disruption.`,
  delivery_failure_alert: (v) => `Notification delivery rate is ${v}%.`,
  suspicious_logins: (v) => `${v} failed login attempts detected. Possible brute force attack.`,
  suspicious_logins_alert: (v) => `${v} failed login attempts today.`,
};

function getTitle(key) {
  const titles = {
    engagement_drop: "Engagement Drop Detected",
    approval_backlog: "Approval Backlog",
    delivery_failure: "Delivery Rate Critical",
    suspicious_logins: "Suspicious Login Activity",
  };
  return titles[key] || "System Alert";
}

function getMessage(key, value) {
  const fn = MESSAGES[key];
  return fn ? fn(value) : key;
}
