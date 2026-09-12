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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="footer-info-title"
  className="relative w-full max-w-xl overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-2xl shadow-black/20 dark:bg-slate-950 dark:text-white dark:shadow-black/40"
  style={{ borderColor: "rgb(var(--border))" }}
>
        {/* Top accent */}
        <div className="h-1 bg-brand-600" />

        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
     className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-lg border text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-900 dark:hover:text-white"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <X size={18} />
          </button>

          <div className="pr-12">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600 ring-1 ring-brand-500/15 dark:text-brand-500">
              <Icon size={22} />
            </div>

       <h2
  id="footer-info-title"
  className="text-2xl font-bold tracking-tight  text-center text-slate-900 dark:text-white"
>
  {item.title}
</h2>

         <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
<div
  className="my-6 h-px"
  style={{ background: "rgb(var(--border))" }}
/>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              {item.details}
            </p>
          </div>

          <div className="mt-7 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}