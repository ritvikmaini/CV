"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { about, profile, education, sectionLabel } from "@/lib/content";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BIO = about.bio;
const PORTRAIT = about.portrait;
const STATUS = about.status;
const FOCUS = about.focus ?? [];

// Most recent education entry — single source from the education section
const LATEST_EDUCATION = education[0];

const CONTACT = {
  email: profile.email,
  location: profile.location,
};

const LANGUAGES_SPOKEN = about.languages;

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] modal-overlay overflow-y-auto"
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={onClose}
            className="detail-close z-[101] text-white hover:text-[var(--accent)] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="min-h-screen detail-page">
            <div className="max-w-6xl mx-auto">
              {/* ── Hero: editorial split (text left, blended circular portrait right) ──
                  On mobile the portrait moves inline, between the title and the bio. */}
              <div className="md:flex md:flex-row md:items-center md:gap-14">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="md:flex-1"
                >
                  <p className="mono-label text-[var(--accent)] text-xs" style={{ marginBottom: "0.85rem" }}>
                    {`// ${profile.name}`}
                  </p>
                  <h2 className="font-display font-black text-6xl md:text-8xl text-white uppercase tracking-tighter leading-[0.85]">
                    {sectionLabel("about")}
                  </h2>

                  {/* Mobile: portrait sits between the title and the bio
                      (on desktop it lives in the right column instead). */}
                  {PORTRAIT && (
                    <div
                      className="flex justify-center md:hidden"
                      style={{ marginTop: "2.25rem", marginBottom: "0.5rem" }}
                    >
                      <Portrait />
                    </div>
                  )}

                  {STATUS && (
                    <div className="flex items-center gap-2.5" style={{ marginTop: "1.5rem" }}>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                      </span>
                      <p className="mono-label text-white/55 text-[0.7rem] leading-snug">{STATUS}</p>
                    </div>
                  )}

                  <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed" style={{ marginTop: "1.75rem" }}>
                    {BIO}
                  </p>
                </motion.div>

                {/* Desktop: portrait in the right column, vertically centred. */}
                {PORTRAIT && (
                  <div className="hidden shrink-0 md:block">
                    <Portrait />
                  </div>
                )}
              </div>

              {/* ── Focus band: numbered target domains ── */}
              {FOCUS.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  style={{ marginTop: "clamp(3.5rem, 8vh, 6rem)" }}
                >
                  <h3 className="mono-label text-white/40 text-xs" style={{ marginBottom: "1.5rem" }}>
                    What I work on
                  </h3>
                  <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
                    {FOCUS.map((f, i) => (
                      <div
                        key={f.label}
                        className="group/card relative bg-[#0b0a12] p-6 transition-colors duration-300 hover:bg-[#100e1a]"
                      >
                        <span className="font-mono text-xs text-[var(--accent)]/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="font-display font-black text-white text-lg uppercase tracking-tight leading-tight" style={{ marginTop: "0.9rem" }}>
                          {f.label}
                        </p>
                        <p className="text-white/55 text-sm leading-relaxed" style={{ marginTop: "0.5rem" }}>
                          {f.detail}
                        </p>
                        <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--accent)] transition-all duration-500 group-hover/card:w-full" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Meta grid: Education / Contact / Languages ── */}
              <div
                className="grid gap-12 md:grid-cols-2 lg:grid-cols-3"
                style={{ marginTop: "clamp(3.5rem, 8vh, 6rem)" }}
              >
                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="mono-label text-sm text-white/70 border-b border-white/20" style={{ marginBottom: "1rem", paddingBottom: "0.5rem" }}>
                    Education
                  </h3>
                  <div className="space-y-2">
                    <p className="text-white font-medium">{LATEST_EDUCATION.degree}</p>
                    <p className="text-white/70">{LATEST_EDUCATION.school}</p>
                    <p className="mono-label text-white/45 text-xs mt-1">{LATEST_EDUCATION.period}</p>
                  </div>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h3 className="mono-label text-sm text-white/70 border-b border-white/20" style={{ marginBottom: "1rem", paddingBottom: "0.5rem" }}>
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mono-label text-white/50 text-xs mb-1">Email</p>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="text-white hover:text-[var(--accent)] transition-colors link-underline"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                    <div>
                      <p className="mono-label text-white/50 text-xs mb-1">Location</p>
                      <p className="text-white/80">{CONTACT.location}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h3 className="mono-label text-sm text-white/70 border-b border-white/20" style={{ marginBottom: "1rem", paddingBottom: "0.5rem" }}>
                    Languages
                  </h3>
                  <div className="space-y-1">
                    {LANGUAGES_SPOKEN.map((l) => (
                      <p key={l} className="text-white/80 text-sm">
                        {l}
                      </p>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Portrait ──────────────────────────────────────────────────────
// Rendered in two places (inline on mobile, right column on desktop),
// mirroring the repo's "render twice" pattern for breakpoint layouts.
function Portrait() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Gentle continuous float gives the portrait life without pulling
          focus; disabled under prefers-reduced-motion. */}
      <motion.div
        className="group relative"
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={
          reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Soft halo, slowly breathing, so the near-black photo reads as
            emerging from the dark rather than sitting on it. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(199,242,77,0.13), rgba(72,1,255,0.13) 48%, transparent 74%)",
          }}
          animate={
            reduce
              ? { opacity: 0.7 }
              : { opacity: [0.55, 0.85, 0.55], scale: [1, 1.07, 1] }
          }
          transition={
            reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* Circular portrait. The radial only feathers the outer ring so the
            circle dissolves into the page (no hard ring) while the centred
            head/neck stay crisp; the bottom fade starts low (80%) so it keeps
            the full head, neck and shoulders and only dissolves the chest
            below. Size scales fluidly via clamp(). */}
        <div
          className="relative overflow-hidden rounded-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          style={{
            width: "clamp(14rem, 13rem + 6vw, 21rem)",
            height: "clamp(14rem, 13rem + 6vw, 21rem)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PORTRAIT}
            alt={profile.name}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: "50% 0%",
              filter: "contrast(1.05)",
              maskImage:
                "radial-gradient(closest-side, #000 74%, transparent 100%), linear-gradient(to bottom, #000 80%, transparent 99%)",
              WebkitMaskImage:
                "radial-gradient(closest-side, #000 74%, transparent 100%), linear-gradient(to bottom, #000 80%, transparent 99%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
