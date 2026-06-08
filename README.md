# ritvikmaini.com

Personal portfolio — a single-page site with a two-level "arc" navigation, full-screen overlay
detail pages, a canvas constellation background, and PDF previews. All copy is data-driven from one
JSON file.

**Stack:** Next.js 16 (App Router, static export) · React 19 · Tailwind v4 · Framer Motion ·
pdf.js (`pdfjs-dist`). Deployed as a static export to GitHub Pages.

> **For agents / deep architecture:** read [`CLAUDE.md`](./CLAUDE.md). It documents the state model,
> the scroll engine, the arc components, and every `content.json` field. [`AGENTS.md`](./AGENTS.md)
> notes that this repo runs **Next.js 16**, which has breaking changes vs. older docs — consult
> `node_modules/next/dist/docs/` before writing Next.js code.

## Commands

```bash
npm install
npm run dev     # dev server (Turbopack) → http://localhost:3000
npm run build   # static export → ./out  (what CI deploys)
npm run lint    # eslint (flat config)
```

There is no test suite, and `npm start` is unused — the site is a static export, not a server.

## Editing content

**Everything you see is edited in [`content.json`](./content.json)** (repo root) — identity, social
links, section names, education, skills, experience, projects, and the About section. Components hold
only layout/animation; don't hard-code copy into them. `lib/content.ts` is the typed loader that adds
the arc `slug`s and is what components import.

It's strict JSON (double-quoted keys/strings, commas between items, **no trailing comma**, no
comments) — a mistake shows up as a build/dev-overlay error. `npm run dev` hot-reloads on save.

Common edits:

- **Add / reorder experience or projects** — edit those arrays; the arc, scrolling, slugs
  (`exp-N` / `proj-N`), and detail pages all follow automatically.
- **Rename a section** — change its `label` in `sections` (leave the `id`). Updates the nav link and
  the section heading.
- **Project body** — use `description` (one paragraph) and/or `highlights` (an array of paragraphs
  rendered as `→` bullets, like an experience entry).
- **Attach PDFs to a project** — drop the file in `public/`, then add a `pdfs` entry
  (`{ "file": "/thesis.pdf", "label": "Bachelor Thesis" }`, 1–2 max). The card auto-renders the
  first page as a thumbnail and opens the PDF in a new tab. Add an optional `thumbnail` image path to
  override the auto-render.
- **About portrait** — drop an image in `public/` and set `about.portrait` (e.g. `/portrait.jpg`);
  it renders as a circular avatar. Fine-tune the crop in `components/AboutModal.tsx`.
- **Skills** — a list of `{ label, items[] }` categories, rendered in order; reorder to reflect
  importance.

Optional fields (`description`, `highlights`, `period`, `stack`, `link`, `pdfs`, portrait, …) are
hidden when empty — delete the line to omit.

## Assets

`public/` is served at the site root and **committed to git** (it ships with the export): PDFs,
`portrait.jpg`, `CNAME` (custom domain), and `.nojekyll`.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds the static export and publishes to GitHub
Pages at `ritvikmaini.com`. Keep `next.config.ts` set to `output: "export"`, `trailingSlash: true`,
`images.unoptimized: true` for the export to work, and leave Pages on the **workflow** build type.
