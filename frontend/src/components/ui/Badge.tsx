import { cn } from "../../lib/utils";
import { FlightStatus } from "../../types";

const statusStyles: Record<FlightStatus, string> = {
  SCHEDULED: "bg-surfaceAlt text-textMuted",
  CHECK_IN_OPEN: "bg-brandMuted text-brand",
  BOARDING: "bg-brandMuted text-brand",
  GATE_CHANGED: "bg-warning/15 text-warning",
  DELAYED: "bg-warning/15 text-warning",
  DEPARTED: "bg-success/15 text-success",
  LANDED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/15 text-danger",
};

const statusLabels: Record<FlightStatus, string> = {
  SCHEDULED: "Scheduled",
  CHECK_IN_OPEN: "Check-in Open",
  BOARDING: "Boarding",
  GATE_CHANGED: "Gate Changed",
  DELAYED: "Delayed",
  DEPARTED: "Departed",
  LANDED: "Landed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: FlightStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", statusStyles[status])}>
      {statusLabels[status]}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surfaceAlt text-textMuted", className)}>
      {children}
    </span>
  );
}
