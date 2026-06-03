"use client";
import { motion } from "framer-motion";

interface HeroNameProps {
  onAbout: () => void;
  onNavigate: (section: string) => void;
  arcMode: "experience" | "projects";
}

const NAME     = "RITVIK MAINI";
const ROLE     = "AI Engineer";
const LOCATION = "Darmstadt, Germany";

const NAV = [
  { label: "about",      section: "about" },
  { label: "education",  section: "education" },
  { label: "experience", section: "experience" },
  { label: "projects",   section: "projects" },
  { label: "skills",     section: "skills" },
];

export default function HeroName({ onAbout, onNavigate, arcMode }: HeroNameProps) {
  return (
    <>
      {/* Big name — desktop only */}
      <section className="fixed inset-0 pointer-events-none z-10 hidden md:flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="pointer-events-auto"
          style={{
            paddingLeft: "clamp(1.5rem, 4vw, 3rem)",
            paddingBottom: "clamp(12rem, 26vh, 15rem)",
          }}
        >
          <h1
            className="font-black text-black leading-[0.85] tracking-tighter uppercase"
            style={{ fontSize: "clamp(4rem, 8vw, 7.5rem)" }}
          >
            {NAME.split(" ").map((word, i) => (
              <div key={i}>{word}</div>
            ))}
          </h1>
        </motion.div>
      </section>

      {/* Info + nav row — desktop only (≥768px) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed z-50 hidden md:block"
        style={{
          bottom: "clamp(1.5rem, 4vh, 3rem)",
          left: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <p
          className="text-black/60"
          style={{
            fontSize: "clamp(0.65rem, 1vw, 1.1rem)",
            marginBottom: "clamp(0.15rem, 0.3vh, 0.5rem)",
          }}
        >
          {ROLE}
        </p>
        <p
          className="text-black/60"
          style={{
            fontSize: "clamp(0.65rem, 1vw, 1.1rem)",
            marginBottom: "clamp(0.5rem, 1vh, 1rem)",
          }}
        >
          {LOCATION}
        </p>

        {/* Navigation links */}
        <div className="flex items-center flex-wrap" style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}>
          {NAV.map((item, i) => (
            <span key={item.section} className="flex items-center" style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}>
              {i > 0 && (
                <span className="text-black/30" style={{ fontSize: "clamp(0.65rem, 1vw, 1.1rem)" }}>
                  |
                </span>
              )}
              <button
                onClick={() => item.section === "about" ? onAbout() : onNavigate(item.section)}
                className={`transition-colors ${
                  item.section === arcMode
                    ? "text-black"
                    : "text-black/70 hover:text-black link-underline"
                }`}
                style={{
                  fontSize: "clamp(0.65rem, 1vw, 1.1rem)",
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
    </>
  );
}
