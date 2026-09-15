import { Link } from "react-router-dom";
import { ArrowRight, Compass, PlaneTakeoff, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="nf-fade relative flex max-w-md flex-col items-center text-center">
        {/* Icon tile */}
        <span className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl shadow-brand-600/30 ring-1 ring-brand-500/20">
          <PlaneTakeoff
            size={34}
            className="nf-float"
            style={{ transformOrigin: "center" }}
          />
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-brand-500 opacity-40 blur-xl" />
          <span className="nf-pulse absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
        </span>

        {/* 404 chip */}
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.15em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <Compass size={11} />
          404 · OFF ROUTE
        </span>

        {/* Title */}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Page{" "}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            not found
          </span>
        </h1>

        <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Looks like this route took off without you.
        </p>

        <p className="mt-1 max-w-sm text-xs text-slate-400 dark:text-slate-500">
          Check the URL, or head back to familiar skies.
        </p>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/"
            className="btn-primary nf-sheen group relative inline-flex items-center gap-2 overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/30"
          >
            Back home
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/flights"
            className="btn-secondary inline-flex items-center gap-2 transition hover:-translate-y-0.5"
          >
            <Search size={15} />
            Search flights
          </Link>
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes nf-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(3deg); }
        }
        @keyframes nf-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.55); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        @keyframes nf-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
        @keyframes nf-fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nf-float { animation: nf-float 4s ease-in-out infinite; }
        .nf-pulse { animation: nf-pulse 2s ease-out infinite; }
        .nf-fade { animation: nf-fade .45s ease-out both; }

        .nf-sheen::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,.35) 45%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,.35) 55%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
        }
        .nf-sheen:hover::after {
          animation: nf-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-float, .nf-pulse, .nf-fade, .nf-sheen::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}