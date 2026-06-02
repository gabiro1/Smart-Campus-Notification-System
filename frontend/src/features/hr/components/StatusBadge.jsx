import { memo } from "react";
import { HR_STATUS_CONFIG } from "../constants/hrStatusConfig";
import { HR_STATUS_LABELS } from "../constants/hrStatus";

function StatusBadge({ status, size = "sm" }) {
  const config = HR_STATUS_CONFIG[status] || HR_STATUS_CONFIG.DRAFT;
  const Icon = config.icon;
  const label = HR_STATUS_LABELS[status] || status;

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-1",
    md: "text-sm gap-1.5 px-2.5 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.bg} ${config.color}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      {label}
    </span>
  );
}

export default memo(StatusBadge);
