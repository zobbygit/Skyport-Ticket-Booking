import clsx from "clsx";

const STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  SCHEDULED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  CHECK_IN_OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  BOARDING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  GATE_CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DELAYED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  DEPARTED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  LANDED: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CHECKED_IN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", STYLES[status] || STYLES.SCHEDULED)}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
