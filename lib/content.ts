// Single source of truth for everything shown on the site lives in
// `content.json` at the repo root. Edit that file — not this one.
//
// This module just imports the JSON, gives it types, and derives the
// stable arc `slug`s from list position so you never hand-manage them.

import data from "@/content.json";

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  links: { linkedin: string; github: string; resume: string };
}

export interface Section {
  /** Structural key — drives routing/behaviour. Do NOT rename. */
  id: string;
  /** Display text — rename freely; updates the nav link and panel heading. */
  label: string;
}

export interface EducationEntry {
  degree: string;
  school: string;
  period: string;
  focus: string;
}

export interface SkillCategory {
  label: string;
  items: string[];
}

export interface About {
  bio: string;
  languages: string[];
}

export interface ExperienceEntry {
  slug: string;
  label: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

/** A sub-item within a project (e.g. one Kaggle challenge). */
export interface ProjectChallenge {
  name: string;
  /** Shown in the small "period" font — use it for accuracy/score. */
  accuracy?: string;
  description?: string;
  links?: ProjectLink[];
}

export interface ProjectEntry {
  slug: string;
  label: string;
  // All optional: a project is either a single write-up (description/stack/
  // link) or a list of sub-entries (`entries`), or any mix of the two.
  description?: string;
  period?: string;
  stack?: string[];
  link?: string;
  entries?: ProjectChallenge[];
}

export const profile   = data.profile   as Profile;
export const sections  = data.sections  as Section[];
export const about     = data.about     as About;
export const education = data.education  as EducationEntry[];
export const skills    = data.skills     as SkillCategory[];

// Attach a stable slug derived from position: exp-0, exp-1, …
export const experience: ExperienceEntry[] = data.experience.map((e, i) => ({
  slug: `exp-${i}`,
  ...e,
}));

export const projects: ProjectEntry[] = (
  data.projects as unknown as Omit<ProjectEntry, "slug">[]
).map((p, i) => ({ slug: `proj-${i}`, ...p }));

/** Resolve a section's editable display label from its structural id. */
export function sectionLabel(id: string): string {
  return sections.find((s) => s.id === id)?.label ?? id;
}
