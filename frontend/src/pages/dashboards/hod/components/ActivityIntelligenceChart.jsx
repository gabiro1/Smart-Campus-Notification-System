import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Calendar,
  BarChart3,
  Activity,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import GlassCard from "@/components/shared/cards/GlassCard";

const METRICS = [
  { key: "announcements", label: "Announcements", icon: MessageSquare, color: "#3B82F6" },
  { key: "approvals", label: "Approvals", icon: BarChart3, color: "#8B5CF6" },
  { key: "engagement", label: "Engagement", icon: Activity, color: "#10B981" },
];

const RANGES = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "semester", label: "Semester" },
];

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;

  const metricLabel = METRICS.find(m => m.key === metric)?.label || "Value";

  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span className="font-medium text-foreground">
            {entry.value} {metricLabel.toLowerCase()}
          </span>
          {entry.payload?.anomaly && (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
              <AlertTriangle size={10} />
              Anomaly
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ActivityIntelligenceChart({ data, loading }) {
  const [selectedMetric, setSelectedMetric] = useState("announcements");
  const [selectedRange, setSelectedRange] = useState("7d");
  const [showComparison, setShowComparison] = useState(true);

  const chartData = useMemo(() => {
    if (!data?.announcements) return [];

    const announcements = data.announcements || [];
    const pending = data.pending || [];
    const days = selectedRange === "7d" ? 7 : selectedRange === "30d" ? 30 : 90;

    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      const dayAnnouncements = announcements.filter(a => {
        const aDate = new Date(a.createdAt).toISOString().split("T")[0];
        return aDate === dayStr;
      });

      const dayApprovals = pending.filter(p => {
        const pDate = new Date(p.createdAt).toISOString().split("T")[0];
        return pDate === dayStr;
      });

      const totalViews = dayAnnouncements.reduce((s, a) => s + (a.viewedBy?.length || 0), 0);

      let value = 0;
      if (selectedMetric === "announcements") value = dayAnnouncements.length;
      else if (selectedMetric === "approvals") value = dayApprovals.length;
      else if (selectedMetric === "engagement") value = totalViews;

      const prevDate = new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
      const prevDayStr = prevDate.toISOString().split("T")[0];

      const prevAnnouncements = announcements.filter(a => {
        const aDate = new Date(a.createdAt).toISOString().split("T")[0];
        return aDate === prevDayStr;
      });
      const prevValue = selectedMetric === "announcements" ? prevAnnouncements.length
        : selectedMetric === "approvals" ? 0
        : prevAnnouncements.reduce((s, a) => s + (a.viewedBy?.length || 0), 0);

      const mean = days > 0 ? result.reduce((s, r) => s + (r.value || 0), 0) / Math.max(result.length, 1) : 0;
      const isAnomaly = value > 0 && mean > 0 && value > mean * 2.5;

      result.push({
        name: dayName,
        value,
        previous: prevValue,
        anomaly: isAnomaly,
      });
    }

    return result;
  }, [data, selectedMetric, selectedRange]);

  const metricConfig = METRICS.find(m => m.key === selectedMetric) || METRICS[0];

  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-accent rounded-lg w-24" />)}
          </div>
          <div className="h-64 bg-accent rounded-xl" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <Activity size={16} className="text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Activity Intelligence</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric selector */}
          <div className="flex bg-accent/50 rounded-lg p-0.5 border border-border">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedMetric === m.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <m.icon size={12} />
                {m.label}
              </button>
            ))}
          </div>

          {/* Range selector */}
          <div className="flex bg-accent/50 rounded-lg p-0.5 border border-border">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setSelectedRange(r.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedRange === r.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Comparison toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showComparison
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                : "bg-accent/50 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Calendar size={12} />
            Compare
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7280" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

              <XAxis
                dataKey="name"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip metric={selectedMetric} />} />

              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#comparisonGradient)"
                  name="Previous Period"
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke={metricConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
                name={metricConfig.label}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload?.anomaly && cx && cy) {
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={6} fill="rgba(244, 63, 94, 0.15)" stroke="none" />
                        <circle cx={cx} cy={cy} r={4} fill="#F43F5E" stroke="#F43F5E" strokeWidth={1} />
                      </g>
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 5, fill: metricConfig.color, stroke: "#1F2937", strokeWidth: 2 }}
              />

              {chartData.filter(d => d.anomaly).map((entry, idx) => {
                return (
                  <ReferenceLine
                    key={`anomaly-${idx}`}
                    x={entry.name}
                    stroke="#F43F5E"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.4}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No activity data for this period</p>
            </div>
          </div>
        )}
      </div>

      {chartData.some(d => d.anomaly) && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
          <AlertTriangle size={14} className="text-rose-400 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="text-rose-400 font-medium">Anomaly detected:</span>{" "}
            {chartData.filter(d => d.anomaly).length} day{chartData.filter(d => d.anomaly).length > 1 ? "s" : ""} with significantly
            higher {selectedMetric} activity than the average
          </p>
        </div>
      )}
    </GlassCard>
  );
}
