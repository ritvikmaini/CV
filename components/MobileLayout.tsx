"use client";
import { motion, AnimatePresence } from "framer-motion";

type ArcMode = "experience" | "projects";

interface ArcItem {
  label: string;
  subtitle?: string;
  slug?: string;
}

interface MobileLayoutProps {
  items: ArcItem[];
  activeIndex: number;
  arcMode: ArcMode;
  arcKey: string;
  onSelect: (i: number) => void;
  onAbout: () => void;
  onNavigate: (section: string) => void;
}

const NAME     = "RITVIK MAINI";
const ROLE     = "AI Engineer";
const LOCATION = "Darmstadt, Germany";
const EMAIL    = "mainiritvik@gmail.com";
const LINKEDIN = "https://ritvikmaini.com/linkedin?ref=profile";
const GITHUB   = "http://ritvikmaini.com/github?ref=profile";
const RESUME   = "/resume.pdf";

const NAV = [
  { label: "about",      section: "about" },
  { label: "education",  section: "education" },
  { label: "experience", section: "experience" },
  { label: "projects",   section: "projects" },
  { label: "skills",     section: "skills" },
];

const FONT_SIZES = [
  "clamp(1.25rem, 6.5vw, 2.5rem)",
  "clamp(1rem, 5.5vw, 2rem)",
  "clamp(0.875rem, 4.5vw, 1.75rem)",
  "clamp(0.75rem, 3.5vw, 1.5rem)",
  "clamp(0.65rem, 3vw, 1.25rem)",
];

export default function MobileLayout({
  items, activeIndex, arcMode, arcKey,
  onSelect, onAbout, onNavigate,
}: MobileLayoutProps) {
  return (
    <div className="fixed inset-0 md:hidden flex flex-col z-20 overflow-hidden">

      {/* ── Top info section ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center text-center shrink-0"
        style={{
          // Respect notch / Dynamic Island on iOS
          paddingTop: "max(2.75rem, calc(env(safe-area-inset-top) + 1rem))",
          paddingLeft: "clamp(1.25rem, 6vw, 2rem)",
          paddingRight: "clamp(1.25rem, 6vw, 2rem)",
          paddingBottom: "1.25rem",
        }}
      >
        {/* ── Identity block: name · role · location (tight grouping) ── */}
        <h1
          className="font-black text-black leading-[0.85] tracking-tighter uppercase"
          style={{ fontSize: "clamp(2.5rem, 11vw, 3.75rem)" }}
        >
          {NAME.split(" ").map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </h1>

        {/* Role — belongs to name, small gap */}
        <p
          className="text-black/70"
          style={{
            fontSize: "clamp(0.75rem, 3.5vw, 1rem)",
            marginTop: "0.625rem",
          }}
        >
          {ROLE}
        </p>

        {/* Location — paired with role, minimal gap */}
        <p
          className="text-black/50"
          style={{
            fontSize: "clamp(0.65rem, 3vw, 0.85rem)",
            marginTop: "0.25rem",
          }}
        >
          {LOCATION}
        </p>

        {/* ── Links — clear break from identity block ── */}
        <div
          className="flex items-center flex-wrap justify-center"
          style={{ gap: "0.625rem", marginTop: "1.25rem" }}
        >
          {[
            { label: "Email",    href: `mailto:${EMAIL}`,  external: false },
            { label: "LinkedIn", href: LINKEDIN,            external: true  },
            { label: "GitHub",   href: GITHUB,              external: true  },
            { label: "Resume",   href: RESUME,              external: true  },
          ].map((link, i) => (
            <span key={link.label} className="flex items-center" style={{ gap: "0.625rem" }}>
              {i > 0 && (
                <span className="text-black/30" style={{ fontSize: "0.6rem" }}>·</span>
              )}
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-black/70 hover:text-black transition-colors"
                style={{ fontSize: "clamp(0.7rem, 3vw, 0.875rem)" }}
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>

        {/* ── Navigation — related to links but a distinct action group ── */}
        <div
          className="flex items-center flex-wrap justify-center"
          style={{ gap: "0.5rem", marginTop: "0.875rem" }}
        >
          {NAV.map((item, i) => (
            <span key={item.section} className="flex items-center" style={{ gap: "0.5rem" }}>
              {i > 0 && (
                <span className="text-black/25" style={{ fontSize: "0.6rem" }}>|</span>
              )}
              <button
                onClick={() => item.section === "about" ? onAbout() : onNavigate(item.section)}
                className="transition-colors"
                style={{
                  fontSize: "clamp(0.65rem, 2.8vw, 0.875rem)",
                  color: item.section === arcMode ? "rgb(0,0,0)" : "rgba(0,0,0,0.55)",
                  ...(item.section === arcMode && {
                    textDecoration: "underline",
                    textDecorationThickness: "1px",
                    textUnderlineOffset: "3px",
                  }),
                }}
              >
                {item.label}
              </button>
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Arc items ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={arcKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 relative overflow-hidden"
        >
          {items.map((item, i) => {
            const dist      = i - activeIndex;
            const absDist   = Math.abs(dist);
            const titleSize    = FONT_SIZES[Math.min(absDist, FONT_SIZES.length - 1)];
            const subtitleSize = FONT_SIZES[Math.min(absDist + 2, FONT_SIZES.length - 1)];
            const yOffset   = dist * 13; // vh per step
            const opacity   = absDist > 4 ? 0 : 1;
            const isActive  = i === activeIndex;

            return (
              <motion.button
                key={item.slug ?? item.label}
                className="absolute group text-center"
                style={{ top: "50%", left: "6vw", right: "6vw" }}
                initial={false}
                animate={{ opacity, y: `${yOffset}vh`, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                onClick={() => onSelect(i)}
              >
                <span
                  className={`font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 break-words ${
                    isActive ? "text-black" : "text-black/40 group-hover:text-black/70"
                  }`}
                  style={{ fontSize: titleSize }}
                >
                  {item.label}
                </span>
                {item.subtitle && (
                  <span
                    className={`font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 break-words ${
                      isActive ? "text-black/50" : "text-black/25"
                    }`}
                    style={{ fontSize: subtitleSize }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
