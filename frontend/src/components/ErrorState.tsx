import { RefreshCw, TriangleAlert } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Something went wrong loading this page.", onRetry }: ErrorStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
        <TriangleAlert size={22} />
      </span>
      <p className="text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          <RefreshCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}