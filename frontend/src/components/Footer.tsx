import { Link } from "react-router-dom";
import {
  Github,
  Instagram,
  Linkedin,
  Plane,
  ShieldCheck,
  Twitter,
} from "lucide-react";

import { useState } from "react";
import FooterInfoModal, {
  FOOTER_INFO,
  type FooterInfo,
} from "./FooterInfoModal";

import { useAuthStore } from "../store/authStore";

const COMPANY_LINKS = [
  { label: "About SkyPort", to: "/#about" },
  { label: "Careers", to: "/#faq" },
  { label: "Press", to: "/#faq" },
  { label: "Sustainability", to: "/#why" },
];

const PLATFORM_LINKS = [
  { label: "Flights", to: "/flights" },
  { label: "Airport Map", to: "/airport-map" },
  { label: "Baggage Tracking", to: "/baggage" },
  { label: "Dashboard", to: "/dashboard" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", to: "/#faq" },
  { label: "Baggage Policy", to: "/baggage" },
  { label: "Check-in Guide", to: "/#faq" },
  { label: "Contact Us", to: "/#faq" },
];

const SOCIALS = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/zohaib-aslam-245a40253" },
  { icon: Github, href: "https://github.com/zobbygit" },
];

export default function Footer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeInfo, setActiveInfo] = useState<FooterInfo | null>(null);

  
  return (
    <footer
      className="relative mt-20 overflow-hidden border-t"
      style={{
        borderColor: "rgb(var(--border))",
        background:
          "linear-gradient(180deg, rgba(var(--card), 0.45) 0%, rgba(var(--card), 0.9) 100%)",
      }}
    >
      {/* Subtle decorative glow */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "rgb(var(--brand))" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-5 lg:gap-x-12 lg:gap-y-0">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="group inline-flex items-center gap-3"
            >
           <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <Plane size={18} />
              <span className="absolute inset-0 -z-10 rounded-xl bg-brand-500 opacity-0 blur-md transition group-hover:opacity-60" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">    SkyPort</span>
        
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Real-time flight tracking, live gate updates, and effortless
              booking — built to make every trip through the airport calmer.
            </p>

            {!isAuthenticated && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  to="/login"
                  className="btn-secondary text-sm transition duration-200 hover:-translate-y-0.5"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="btn-primary text-sm transition duration-200 hover:-translate-y-0.5"
                >
                  Sign up
                </Link>

                <Link
                  to="/admin/login"
                  className="group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: "rgba(239, 68, 68, 0.35)",
                    color: "rgb(248 113 113)",
                    background: "rgba(239, 68, 68, 0.06)",
                  }}
                >
                  <ShieldCheck
                    size={16}
                    className="transition group-hover:scale-105"
                  />
                  Admin login
                </Link>
              </div>
            )}

            <div className="mt-7 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-full border text-slate-400 transition duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-500"
                  style={{ borderColor: "rgb(var(--border))" }}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile: Company + Platform side by side */}
          <div className="col-span-1">
         <FooterColumn
  title="Company"
  links={COMPANY_LINKS}
  onInfoClick={(label) => setActiveInfo(FOOTER_INFO[label])}
/>
          </div>

          <div className="col-span-1">
            <FooterColumn
  title="Platform"
  links={PLATFORM_LINKS}
  onInfoClick={(label) => setActiveInfo(FOOTER_INFO[label])}
/>
          </div>

          {/* Mobile: Support below Company + Platform */}
          <div className="col-span-2 lg:col-span-1">
           <FooterColumn
  title="Support"
  links={SUPPORT_LINKS}
  onInfoClick={(label) => setActiveInfo(FOOTER_INFO[label])}
/>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col gap-5 border-t pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:mt-14"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <p className="leading-5">
            © {new Date().getFullYear()} SkyPort Airport Services.
            <span className="hidden sm:inline"> </span>
            <span className="sm:hidden block" />
            Built for a smoother journey.
          </p>

          <div className="flex items-center gap-5">
  {["Privacy", "Terms", "Accessibility"].map((label) => (
    <button
      key={label}
      type="button"
      onClick={() => setActiveInfo(FOOTER_INFO[label])}
      className="transition-colors hover:text-brand-500"
    >
      {label}
    </button>
  ))}
</div>
        </div>
      </div>
      <FooterInfoModal
  item={activeInfo}
  onClose={() => setActiveInfo(null)}
/>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  onInfoClick,
}: {
  title: string;
  links: { label: string; to: string }[];
  onInfoClick: (label: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-tight">{title}</p>

      <ul className="mt-4 space-y-3 text-sm text-slate-400">
        {links.map((l) => (
          <li key={l.label}>
            <button
              type="button"
              onClick={() => onInfoClick(l.label)}
              className="group inline-flex items-center text-left transition-colors duration-200 hover:text-brand-500"
            >
              <span>{l.label}</span>

              <span className="ml-1.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}