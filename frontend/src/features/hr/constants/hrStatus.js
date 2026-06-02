export const HR_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ACTIVATED: "ACTIVATED",
});

export const HR_STATUS_FLOW = Object.freeze([
  HR_STATUS.DRAFT,
  HR_STATUS.PENDING,
  HR_STATUS.APPROVED,
  HR_STATUS.ACTIVATED,
]);

export const HR_STATUS_LABELS = Object.freeze({
  [HR_STATUS.DRAFT]: "Draft",
  [HR_STATUS.PENDING]: "Pending",
  [HR_STATUS.APPROVED]: "Approved",
  [HR_STATUS.REJECTED]: "Rejected",
  [HR_STATUS.ACTIVATED]: "Activated",
});

export const HR_TERMINAL_STATUSES = Object.freeze([
  HR_STATUS.REJECTED,
  HR_STATUS.ACTIVATED,
]);

export const HR_EDITABLE_STATUSES = Object.freeze([
  HR_STATUS.DRAFT,
]);

export const TARGET_ROLES = Object.freeze({
  lecturer: "Lecturer",
  hod: "Head of Department",
  dean: "Dean",
  principal: "Principal",
  registrar: "Registrar",
});

export const TARGET_ROLE_LIST = Object.freeze(
  Object.entries(TARGET_ROLES).map(([value, label]) => ({ value, label }))
);
