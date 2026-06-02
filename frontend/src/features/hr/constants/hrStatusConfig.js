import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";
import { HR_STATUS } from "./hrStatus";

export const HR_STATUS_CONFIG = Object.freeze({
  [HR_STATUS.DRAFT]: {
    icon: FileText,
    color: "text-muted-foreground",
    bg: "bg-muted",
    dotColor: "bg-muted-foreground",
  },
  [HR_STATUS.PENDING]: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    dotColor: "bg-amber-500",
  },
  [HR_STATUS.APPROVED]: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    dotColor: "bg-emerald-500",
  },
  [HR_STATUS.REJECTED]: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    dotColor: "bg-red-500",
  },
  [HR_STATUS.ACTIVATED]: {
    icon: UserCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    dotColor: "bg-blue-500",
  },
});
