"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  education,
  skills,
  experience,
  projects,
  sectionLabel,
} from "@/lib/content";
import PdfCard from "./PdfCard";

interface SectionPanelProps {
  section: string | null;
  onClose: () => void;
}

export default function SectionPanel({ section, onClose }: SectionPanelProps) {
  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key={section}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] modal-overlay overflow-y-auto"
        >
          {/* Close */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={onClose}
            className="detail-close z-[101] text-white hover:text-[var(--accent)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="min-h-screen detail-page">
            <div className="max-w-6xl mx-auto">
              {section === "education"      && <EducationContent />}
              {section === "skills"         && <SkillsContent />}
              {section?.startsWith("exp-")  && <ExperienceEntryContent slug={section} />}
              {section?.startsWith("proj-") && <ProjectEntryContent    slug={section} />}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Shared heading ────────────────────────────────────────────────

function Heading({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{ marginBottom: "1rem" }}
    >
      {eyebrow && (
        <p className="mono-label text-[var(--accent)] text-xs" style={{ marginBottom: "0.75rem" }}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tighter leading-[0.9]">
        {children}
      </h2>
    </motion.div>
  );
}

// ── Education ─────────────────────────────────────────────────────

function EducationContent() {
  return (
    <>
      <Heading>{sectionLabel("education")}</Heading>
      <div>
        {education.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            style={{ marginTop: i === 0 ? 0 : "1rem" }}
          >
            <p className="font-display text-white font-black text-2xl md:text-3xl tracking-tight">{e.degree}</p>
            <p className="text-white/70 text-xl mt-1">{e.school}</p>
            <p className="mono-label text-white/40 text-xs mt-2">{e.period}</p>
            {e.focus && (
              <p className="text-white/60 text-base leading-relaxed max-w-2xl mt-2">{e.focus}</p>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Skills ────────────────────────────────────────────────────────

function SkillsContent() {
  return (
    <>
      <Heading>{sectionLabel("skills")}</Heading>
      <div>
        {skills.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            style={{ marginTop: i === 0 ? 0 : "1rem" }}
          >
            <h3 className="mono-label text-white/40 text-xs mb-4">
              {cat.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="font-mono px-4 py-2 text-sm text-white/90 border border-white/15 rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Experience entry detail ───────────────────────────────────────

function ExperienceEntryContent({ slug }: { slug: string }) {
  const entry = experience.find((e) => e.slug === slug);
  if (!entry) return null;

  return (
    <>
      <Heading eyebrow={`// ${sectionLabel("experience")}`}>{entry.label}</Heading>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-white/70 text-xl">{entry.company}</p>
        <p className="mono-label text-white/40 text-xs" style={{ marginTop: "1rem" }}>{entry.period}</p>
        <p className="mono-label text-white/40 text-xs" style={{ marginTop: "0.4rem" }}>{entry.location}</p>
        {entry.highlights.length > 0 && (
          <div style={{ marginTop: "1rem" }} className="max-w-3xl">
            {entry.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 text-white/70"
                style={{ marginTop: i === 0 ? 0 : "0.5rem" }}
              >
                <span className="text-[var(--accent)] mt-1 shrink-0">→</span>
                <span className="text-lg leading-relaxed">{h}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}

// ── Project entry detail ──────────────────────────────────────────

function ProjectEntryContent({ slug }: { slug: string }) {
  const entry = projects.find((p) => p.slug === slug);
  if (!entry) return null;

  return (
    <>
      <Heading eyebrow={`// ${sectionLabel("projects")}`}>{entry.label}</Heading>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {entry.description && (
          <p className="text-white/70 text-lg leading-relaxed max-w-3xl">{entry.description}</p>
        )}
        {entry.highlights && entry.highlights.length > 0 && (
          <div style={{ marginTop: entry.description ? "1rem" : 0 }} className="max-w-3xl">
            {entry.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 text-white/70"
                style={{ marginTop: i === 0 ? 0 : "0.5rem" }}
              >
                <span className="text-[var(--accent)] mt-1 shrink-0">→</span>
                <span className="text-lg leading-relaxed">{h}</span>
              </div>
            ))}
          </div>
        )}
        {entry.period && (
          <p className="mono-label text-white/40 text-xs" style={{ marginTop: "1rem" }}>{entry.period}</p>
        )}
        {entry.stack && entry.stack.length > 0 && (
          <div style={{ marginTop: "1rem" }} className="flex flex-wrap gap-2">
            {entry.stack.map((s, i) => (
              <span key={i} className="font-mono px-4 py-2 text-sm text-white/90 border border-white/15 rounded-full">{s}</span>
            ))}
          </div>
        )}
        {entry.link && (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white/50 text-sm hover:text-[var(--accent)] transition-colors link-underline"
            style={{ marginTop: "1rem" }}
          >
            View project →
          </a>
        )}

        {/* Attached PDFs — preview cards that open in a new tab */}
        {entry.pdfs && entry.pdfs.length > 0 && (
          <div style={{ marginTop: "1.75rem" }}>
            <p className="mono-label text-white/40 text-xs" style={{ marginBottom: "0.9rem" }}>
              Documents
            </p>
            <div className="flex flex-wrap" style={{ gap: "1.25rem" }}>
              {entry.pdfs.slice(0, 2).map((d, i) => (
                <PdfCard key={d.file} doc={d} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Sub-entries (e.g. individual Kaggle challenges) */}
        {entry.entries && entry.entries.length > 0 && (
          <div style={{ marginTop: entry.description ? "1.5rem" : 0 }}>
            {entry.entries.map((c, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 0 : "1.5rem" }}>
                <p className="font-display text-white font-black text-xl md:text-2xl tracking-tight">{c.name}</p>
                {/* Accuracy — reuses the small "period" font */}
                {c.accuracy && (
                  <p className="font-mono text-white/45 text-xs uppercase tracking-wider" style={{ marginTop: "0.5rem" }}>{c.accuracy}</p>
                )}
                {c.description && (
                  <p className="text-white/70 text-base leading-relaxed max-w-3xl" style={{ marginTop: "0.5rem" }}>
                    {c.description}
                  </p>
                )}
                {c.links && c.links.length > 0 && (
                  <div className="flex flex-wrap items-center" style={{ gap: "0.75rem", marginTop: "0.5rem" }}>
                    {c.links.map((l, j) => (
                      <span key={j} className="flex items-center" style={{ gap: "0.75rem" }}>
                        {j > 0 && <span className="text-white/25 text-sm">·</span>}
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/50 text-sm hover:text-[var(--accent)] transition-colors link-underline"
                        >
                          {l.label}
                        </a>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
