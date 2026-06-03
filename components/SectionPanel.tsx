"use client";
import { motion, AnimatePresence } from "framer-motion";

// ── Fill in your content here ─────────────────────────────────────

const EDUCATION_ENTRIES = [
  {
    degree: "MSc. Informatik – Artificial Intelligence and Machine Learning",
    school: "Technical University of Darmstadt",
    period: "April 2025 – Present",
    focus:  "",
  },
  {
    degree: "BSc. Informatik",
    school: "Darmstadt University of Applied Sciences",
    period: "October 2020 – March 2025",
    focus:  "Thesis: Unsupervised Face Embedding Clustering for Model Identity Recognition (Nominee, H_DA Dissertation of the Year, 2025)",
  },
  {
    degree: "Foundation Year (Studienkolleg) – Informatik",
    school: "Karlsruhe Institute of Technology",
    period: "October 2018 – July 2020",
    focus:  "",
  },
  {
    degree: "Secondary High School",
    school: "Shri Ram School Aravali, New Delhi",
    period: "February 2004 – March 2018",
    focus:  "",
  },
];

const EXPERIENCE_ENTRIES = [
  {
    company:    "TODO: Company",
    role:       "TODO: Your Role",
    period:     "TODO: Month Year – Present",
    location:   "TODO: City, Country",
    highlights: [
      "TODO: First key achievement or responsibility.",
      "TODO: Second key achievement or responsibility.",
    ],
  },
];

const PROJECT_ENTRIES = [
  {
    name:        "TODO: Project Name",
    description: "TODO: What it does and why it matters.",
    stack:       ["TODO", "TODO", "TODO"],
    link:        "#",
  },
];

const SKILL_CATEGORIES = [
  {
    label: "Forecasting & ML",
    items: [
      "LightGBM", "PyTorch", "TensorFlow", "Scikit-learn",
      "Time-Series Forecasting", "Foundation Models",
      "Ensemble & Statistical Methods", "Exploratory Data Analysis",
      "LLMs & RAG", "OpenCV",
    ],
  },
  {
    label: "Data & Infrastructure",
    items: [
      "Apache Airflow", "PostgreSQL",
      "AWS (Lambda, S3, DynamoDB)",
      "GCP (BigQuery, Cloud Functions, Cloud Storage, Vertex AI)",
      "Docker", "Data Pipeline & ETL Design",
    ],
  },
  {
    label: "Languages & Tools",
    items: [
      "Python", "SQL", "C++", "Git", "REST APIs",
      "Pandas", "Pydantic", "Playwright", "Agile (Scrum)",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: string | null;
  onClose: () => void;
  entryTitle?: string;
}

export default function SectionPanel({ section, onClose, entryTitle }: SectionPanelProps) {
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
            className="fixed top-8 right-8 z-[101] text-white hover:text-white/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="min-h-screen px-8 py-24 md:px-16">
            <div className="max-w-6xl mx-auto">
              {section === "education"          && <EducationContent />}
              {section === "skills"             && <SkillsContent />}
              {section?.startsWith("exp-")      && <ExperienceEntryContent title={entryTitle ?? ""} />}
              {section?.startsWith("proj-")     && <ProjectEntryContent    title={entryTitle ?? ""} />}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Shared heading ────────────────────────────────────────────────

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="font-black text-5xl md:text-7xl text-white mb-12 uppercase tracking-tighter"
    >
      {children}
    </motion.h2>
  );
}

// ── Education ─────────────────────────────────────────────────────

function EducationContent() {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-black text-5xl md:text-7xl text-white uppercase tracking-tighter"
        style={{ marginBottom: "1rem" }}
      >
        Education
      </motion.h2>
      <div>
        {EDUCATION_ENTRIES.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            style={{ marginTop: i === 0 ? 0 : "1rem" }}
          >
            <p className="text-white font-black text-2xl md:text-3xl">{e.degree}</p>
            <p className="text-white/70 text-xl mt-1">{e.school}</p>
            <p className="text-white/40 text-sm mt-1">{e.period}</p>
            {e.focus && (
              <p className="text-white/60 text-base leading-relaxed max-w-2xl mt-2">{e.focus}</p>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Experience ────────────────────────────────────────────────────

function ExperienceContent() {
  return (
    <>
      <Heading>Experience</Heading>
      <div className="space-y-16">
        {EXPERIENCE_ENTRIES.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
          >
            <p className="font-black text-2xl md:text-4xl text-white">{e.company}</p>
            <p className="text-white/80 text-lg md:text-xl mt-2">{e.role}</p>
            <div className="flex flex-wrap gap-3 text-sm text-white/40 mt-2 mb-8">
              <span>{e.period}</span>
              <span>·</span>
              <span>{e.location}</span>
            </div>
            <div className="space-y-4 max-w-3xl">
              {e.highlights.map((h, j) => (
                <div key={j} className="flex items-start gap-4 text-white/75">
                  <span className="text-white/30 mt-1 shrink-0">→</span>
                  <span className="text-lg leading-relaxed">{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Projects ──────────────────────────────────────────────────────

function ProjectsContent() {
  return (
    <>
      <Heading>Projects</Heading>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECT_ENTRIES.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            className="border border-white/15 rounded-2xl p-6 flex flex-col gap-4"
          >
            <p className="font-black text-xl md:text-2xl text-white">{p.name}</p>
            <p className="text-white/65 text-base leading-relaxed flex-1">{p.description}</p>
            <div className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <span key={s} className="text-xs px-3 py-1 bg-white/10 text-white/75 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            {p.link !== "#" && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 text-sm hover:text-white transition-colors link-underline self-start"
              >
                View project →
              </a>
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
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-black text-5xl md:text-7xl text-white uppercase tracking-tighter"
        style={{ marginBottom: "1rem" }}
      >
        Skills
      </motion.h2>
      <div>
        {SKILL_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            style={{ marginTop: i === 0 ? 0 : "1rem" }}
          >
            <h3 className="text-white/40 text-xs uppercase tracking-widest mb-4">
              {cat.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 text-sm bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
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

function ExperienceEntryContent({ title }: { title: string }) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-black text-5xl md:text-7xl text-white uppercase tracking-tighter"
        style={{ marginBottom: "1rem" }}
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-white/70 text-xl">TODO: Role</p>
        <p className="text-white/40 text-sm" style={{ marginTop: "1rem" }}>TODO: Period</p>
        <p className="text-white/40 text-sm" style={{ marginTop: "1rem" }}>TODO: Location</p>
        <div style={{ marginTop: "1rem" }} className="space-y-3 max-w-3xl">
          {["TODO: Key achievement or responsibility.", "TODO: Key achievement or responsibility."].map((h, i) => (
            <div key={i} className="flex items-start gap-4 text-white/70">
              <span className="text-white/30 mt-1 shrink-0">→</span>
              <span className="text-lg leading-relaxed">{h}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ── Project entry detail ──────────────────────────────────────────

function ProjectEntryContent({ title }: { title: string }) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-black text-5xl md:text-7xl text-white uppercase tracking-tighter"
        style={{ marginBottom: "1rem" }}
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-white/70 text-lg leading-relaxed max-w-3xl">
          TODO: Description — what it does and why it matters.
        </p>
        <p className="text-white/40 text-sm" style={{ marginTop: "1rem" }}>TODO: Period</p>
        <div style={{ marginTop: "1rem" }} className="flex flex-wrap gap-2">
          {["TODO", "TODO", "TODO"].map((s, i) => (
            <span key={i} className="px-4 py-2 text-sm bg-white/10 text-white rounded-full">{s}</span>
          ))}
        </div>
        <p className="text-white/40 text-sm" style={{ marginTop: "1rem" }}>TODO: Link</p>
      </motion.div>
    </>
  );
}
