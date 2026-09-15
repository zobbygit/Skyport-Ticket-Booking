import { useEffect } from "react";
import {
  X,
  Sparkles,
  Plane,
  ShieldCheck,
  CircleHelp,
  FileText,
  Accessibility,
  BriefcaseBusiness,
  Newspaper,
  Leaf,
  Map,
  Luggage,
  LayoutDashboard,
  ClipboardCheck,
  Mail,
} from "lucide-react";

export type FooterInfo = {
  title: string;
  icon: React.ElementType;
  description: string;
  details: string;
};

export const FOOTER_INFO: Record<string, FooterInfo> = {
  "About SkyPort": {
    title: "About SkyPort",
    icon: Plane,
    description:
      "An airport services platform built around one idea: travelers shouldn't have to guess.",
    details:
      "SkyPort brings flight booking, real-time flight updates, gate information, baggage tracking, check-in, boarding, and smart boarding pass generation into one connected airport experience. From the moment you search for a flight to the moment your bag reaches the carousel, important status changes are designed to reach you when they happen.",
  },

  Careers: {
    title: "Careers",
    icon: BriefcaseBusiness,
    description:
      "Build technology that makes the airport experience simpler and more predictable.",
    details:
      "SkyPort is designed around real-world airport operations, traveler convenience, and reliable real-time information. Future roles can span frontend engineering, backend systems, real-time infrastructure, product design, airport operations technology, and customer experience.",
  },

  Press: {
    title: "Press",
    icon: Newspaper,
    description:
      "Information about SkyPort, its technology, and the platform behind the experience.",
    details:
      "SkyPort is an airport services platform combining a React frontend with a Node/Express backend, real-time Socket.IO updates, booking workflows, baggage tracking, administrative tools, and smart boarding pass generation.",
  },

  Sustainability: {
    title: "Sustainability",
    icon: Leaf,
    description:
      "Technology can make airport journeys more efficient while reducing unnecessary friction.",
    details:
      "SkyPort focuses on digital-first airport experiences that reduce reliance on scattered information, unnecessary paperwork, and repeated manual updates. The platform is designed to make information available where and when travelers need it.",
  },

  Flights: {
    title: "Flights",
    icon: Plane,
    description:
      "Search, view, and manage flight information from one place.",
    details:
      "SkyPort's flight experience brings flight schedules, statuses, gates, terminals, boarding information, and booking into a single workflow. Real-time updates can be delivered through the platform as operational information changes.",
  },

  "Airport Map": {
    title: "Airport Map",
    icon: Map,
    description:
      "Navigate terminals and find important airport facilities with less guesswork.",
    details:
      "The airport map is designed to help travelers locate gates, terminals, lounges, restrooms, baggage areas, and other important facilities. Airport information can be organized terminal by terminal so travelers can understand where they need to go.",
  },

  "Baggage Tracking": {
    title: "Baggage Tracking",
    icon: Luggage,
    description:
      "Follow your baggage journey from check-in to the carousel.",
    details:
      "SkyPort's baggage experience connects baggage information with the passenger journey. Travelers can use their baggage reference to follow status information and report an issue when something goes wrong.",
  },

  Dashboard: {
    title: "Dashboard",
    icon: LayoutDashboard,
    description:
      "A central workspace for managing and monitoring the SkyPort experience.",
    details:
      "The dashboard provides a centralized view of relevant activity and information. Depending on the user's role, it can provide access to flight information, airport operations, booking activity, baggage information, and other platform functionality.",
  },

  "Help Center": {
    title: "Help Center",
    icon: CircleHelp,
    description:
      "Find answers to common questions about using SkyPort.",
    details:
      "The Help Center is intended to explain the platform's major workflows, including flight booking, check-in, boarding, baggage tracking, airport navigation, account usage, and other common traveler questions.",
  },

  "Baggage Policy": {
    title: "Baggage Policy",
    icon: Luggage,
    description:
      "Understand the baggage rules and information associated with your journey.",
    details:
      "Baggage policies can vary depending on the airline, route, fare, and other booking conditions. SkyPort provides the baggage information available through the platform while travelers should always verify airline-specific restrictions before traveling.",
  },

  "Check-in Guide": {
    title: "Check-in Guide",
    icon: ClipboardCheck,
    description:
      "Get through check-in and boarding with a clearer step-by-step experience.",
    details:
      "The SkyPort check-in workflow is designed to connect your booking with passenger information and boarding. After completing the required steps, travelers can receive a smart boarding pass containing the information needed for their airport journey.",
  },

  "Contact Us": {
    title: "Contact Us",
    icon: Mail,
    description:
      "Have a question, issue, or suggestion? Get in touch with SkyPort.",
    details:
      "For questions about bookings, airport information, baggage, account access, or the platform itself, use the available contact channel provided by SkyPort. Include your booking or relevant reference information when appropriate so the issue can be understood quickly.",
  },

  Privacy: {
    title: "Privacy",
    icon: ShieldCheck,
    description:
      "Your information should be handled responsibly and transparently.",
    details:
      "SkyPort uses account and operational information to provide platform functionality such as authentication, booking, check-in, flight updates, baggage tracking, and administrative operations. Personal information should only be accessed and processed for legitimate platform purposes and according to the applicable privacy requirements.",
  },

  Terms: {
    title: "Terms",
    icon: FileText,
    description:
      "The rules and conditions governing use of the SkyPort platform.",
    details:
      "By using SkyPort, users are expected to provide accurate information, protect their account credentials, and use the platform responsibly. Flight schedules, airport information, and operational statuses may change, so travelers should verify critical travel information with the relevant airline or airport when necessary.",
  },

  Accessibility: {
    title: "Accessibility",
    icon: Accessibility,
    description:
      "SkyPort should be usable and understandable for as many travelers as possible.",
    details:
      "The platform is designed with readable interfaces, clear navigation, responsive layouts, keyboard-friendly interactions, and accessible visual structure in mind. Accessibility remains an ongoing part of improving the traveler experience across desktop and mobile devices.",
  },
};

type FooterInfoModalProps = {
  item: FooterInfo | null;
  onClose: () => void;
};

/** Small helper — categorizes a footer link for the header chip. */
function categoryOf(title: string): string {
  const t = title.toLowerCase();
  if (
    ["about skypoart", "about skyport", "careers", "press", "sustainability"].some(
      (k) => t === k
    )
  )
    return "Company";
  if (
    ["flights", "airport map", "baggage tracking", "dashboard"].some(
      (k) => t === k
    )
  )
    return "Platform";
  if (
    ["help center", "baggage policy", "check-in guide", "contact us"].some(
      (k) => t === k
    )
  )
    return "Support";
  return "Legal";
}

export default function FooterInfoModal({
  item,
  onClose,
}: FooterInfoModalProps) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const Icon = item.icon;
  const category = categoryOf(item.title);

  return (
    <div
      className="fm-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-md backdrop-saturate-150 dark:bg-black/70"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Aurora glow behind the modal */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="footer-info-title"
        className="fm-in relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 text-slate-900 shadow-2xl shadow-black/30 ring-1 ring-slate-200/40 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-white dark:shadow-black/50 dark:ring-slate-800/40"
      >
        {/* Aurora top strip */}
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-950">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-indigo-400/25 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 35%, transparent 78%)",
            }}
          />
          <Plane className="pointer-events-none absolute -bottom-6 right-6 h-24 w-24 rotate-12 text-white/10" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-white/90 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Floating icon */}
        <div className="relative -mt-10 px-6 sm:px-8">
          <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-xl ring-1 ring-slate-200/60 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-800/60">
            <Icon size={26} />
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-brand-500 opacity-25 blur-lg" />
          </span>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <Sparkles size={10} className="text-brand-600 dark:text-brand-400" />
              {category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              SkyPort info
            </span>
          </div>

          <h2
            id="footer-info-title"
            className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
          >
            {item.title}
          </h2>
        </div>

        {/* Body */}
        <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">
          <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
            {item.description}
          </p>

          {/* Hairline gradient divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            {item.details}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5 dark:border-slate-800/70">
            <span className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold dark:border-slate-800">
                Esc
              </span>
              to close
            </span>

            <button
              type="button"
              onClick={onClose}
              className="fm-sheen group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/40"
            >
              Close
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Motion */}
      <style>{`
        @keyframes fm-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fm-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fm-sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }

        .fm-fade { animation: fm-fade .2s ease-out both; }
        .fm-in { animation: fm-in .3s cubic-bezier(.2,.8,.2,1) both; }

        .fm-sheen::after {
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
        .fm-sheen:hover::after {
          animation: fm-sheen .9s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .fm-fade, .fm-in, .fm-sheen::after { animation: none !important; }
        }
      `}</style>
    </div>
  );
}