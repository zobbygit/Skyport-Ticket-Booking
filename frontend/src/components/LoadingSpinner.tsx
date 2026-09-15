import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden py-20 text-slate-500 dark:text-slate-400">
      {/* Aurora glows */}
      <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />

      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-3">
        {/* Loader tile */}
        <div className="relative grid h-16 w-16 place-items-center">
          {/* Outer track ring */}
          <span className="absolute inset-0 rounded-2xl border border-slate-200/70 dark:border-slate-800/70" />

          {/* Pulsing halo */}
          <span className="ls-pulse absolute inset-0 rounded-2xl" />

          {/* Icon tile */}
          <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 ring-1 ring-brand-500/20">
            <Loader2 className="animate-spin" size={22} />
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-brand-500 opacity-40 blur-md" />
          </span>
        </div>

        {(label || true) && (
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
              Please wait
            </p>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {label || "Loading…"}
              <span className="ml-1.5 inline-flex">
                <span className="ls-dot h-1 w-1 rounded-full bg-brand-500" />
                <span className="ls-dot ml-1 h-1 w-1 rounded-full bg-brand-500" />
                <span className="ls-dot ml-1 h-1 w-1 rounded-full bg-brand-500" />
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Motion */}
      <style>{`
        @keyframes ls-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.30); }
          50% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        @keyframes ls-dot {
          0%, 80%, 100% { opacity: .25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .ls-pulse { animation: ls-pulse 2.4s ease-out infinite; }

        .ls-dot:nth-child(1) { animation: ls-dot 1.2s ease-in-out infinite; animation-delay: 0s; }
        .ls-dot:nth-child(2) { animation: ls-dot 1.2s ease-in-out infinite; animation-delay: .15s; }
        .ls-dot:nth-child(3) { animation: ls-dot 1.2s ease-in-out infinite; animation-delay: .3s; }

        @media (prefers-reduced-motion: reduce) {
          .ls-pulse, .ls-dot { animation: none !important; }
        }
      `}</style>
    </div>
  );
}