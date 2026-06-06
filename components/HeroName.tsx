"use client";
import { motion } from "framer-motion";
import { profile, sections } from "@/lib/content";

interface HeroNameProps {
  onHome: () => void;
  onAbout: () => void;
  onNavigate: (section: string) => void;
  arcView: "sections" | "experience" | "projects";
  showNav: boolean;
}

const NAME     = profile.name;
const ROLE     = profile.role;
const LOCATION = profile.location;

export default function HeroName({ onHome, onAbout, onNavigate, arcView, showNav }: HeroNameProps) {
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
            onClick={onHome}
            className="font-display font-black text-black leading-[0.85] tracking-tighter uppercase cursor-pointer hover:opacity-80 transition-opacity"
            style={{ fontSize: "clamp(4rem, 8vw, 7.5rem)" }}
            title="Back to top"
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
          className="mono-label text-black/55"
          style={{
            fontSize: "clamp(0.6rem, 0.85vw, 0.9rem)",
            marginBottom: "clamp(0.5rem, 1vh, 1rem)",
          }}
        >
          {LOCATION}
        </p>

        {/* Navigation links — only while drilled into a branch */}
        {showNav && (
          <div className="flex items-center flex-wrap" style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}>
            {sections.map((item, i) => (
              <span key={item.id} className="flex items-center" style={{ gap: "clamp(0.5rem, 1vw, 1rem)" }}>
                {i > 0 && (
                  <span className="text-black/30" style={{ fontSize: "clamp(0.65rem, 1vw, 1.1rem)" }}>
                    |
                  </span>
                )}
                <button
                  onClick={() => item.id === "about" ? onAbout() : onNavigate(item.id)}
                  className={`font-mono uppercase tracking-wider transition-colors ${
                    item.id === arcView
                      ? "text-black"
                      : "text-black/60 hover:text-black link-underline"
                  }`}
                  style={{
                    fontSize: "clamp(0.6rem, 0.85vw, 0.9rem)",
                    ...(item.id === arcView && {
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
        )}
      </motion.div>
    </>
  );
}
