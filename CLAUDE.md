# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above is load-bearing: **Next.js 16 in this repo has breaking changes vs. training data.** Read `node_modules/next/dist/docs/` before writing Next.js code.

## Commands

```bash
npm run dev     # local dev server (Turbopack) — http://localhost:3000
npm run build   # static export → ./out  (this is what CI deploys)
npm run lint    # eslint (flat config, eslint-config-next)
```

There is no test suite. `npm start` is unused — the site is a **static export**, not a running server.

Tailwind v4 quirk: newly added spacing/utility classes sometimes don't take effect until the dev server is restarted. The codebase works around this by using **inline `style={{ ... }}`** for spacing that needs to be reliable (see `SectionPanel.tsx`, `HeroName.tsx`). Follow that pattern rather than fighting the class cache.

## Architecture

Single-page portfolio modelled on anshulchahar.com. Everything renders from one route (`app/page.tsx`) — there is no routing; "pages" are full-screen overlay modals. Stack: Next 16 App Router + React 19 + Tailwind v4 + Framer Motion + a hand-rolled canvas animation + pdf.js (`pdfjs-dist`) for PDF thumbnails.

### Component map

- `app/page.tsx` — sole state orchestrator + the scroll/keyboard/touch engine (see below).
- `app/layout.tsx` — loads the three `next/font` faces; `globals.css` maps them to Tailwind `font-*` utilities and defines the shared overlay/atmosphere classes.
- `components/ArcNav.tsx` / `components/MobileLayout.tsx` — the arc, rendered twice (desktop / mobile); keep them in sync.
- `components/HeroName.tsx` — the name block; **is the home button**.
- `components/SectionPanel.tsx` — detail overlay for `education` / `skills` and every `exp-*` / `proj-*` entry (renders project `highlights`, `stack`, `pdfs`, `entries`).
- `components/AboutModal.tsx` — the About overlay, incl. the circular portrait.
- `components/PdfCard.tsx` — reusable PDF preview card (first-page thumbnail → opens in a new tab). Used by `SectionPanel`; generic enough for a future résumé viewer.
- `components/DotCanvas.tsx` — background constellation. `components/SocialLinks.tsx` — the under-name links.
- `lib/content.ts` — the typed loader for `content.json` (the only data source).
- `public/` — static assets served at the site root **and committed to git** (deployed via Pages): PDFs (`thesis.pdf`, …), `portrait.jpg`, `CNAME`, `.nojekyll`, `resume.pdf` (when added).

### Content is data-driven (single source of truth)

**All editable copy lives in `content.json` at the repo root** — identity, social links, section labels, education, skills, experience, projects, about. That's the only file to touch for content changes. `lib/content.ts` is a thin typed loader that imports the JSON, attaches derived arc `slug`s (`exp-0`, `proj-0`, …) by list position, exposes `sectionLabel(id)`, and is what every component imports from. Components hold layout/animation only — no hard-coded copy. Section behaviour is keyed off the structural `id` (`about`/`education`/`experience`/`projects`/`skills`); the `label` is display-only and renaming it updates both the nav link and that section's panel heading. Don't re-introduce content constants into components.

**How to update content (`content.json`):**

- It's strict JSON: double-quote every key/string, comma between items, **no trailing comma** on the last item, no comments. A mistake surfaces as a build/dev-overlay error, not silently. `npm run dev` hot-reloads on save (usually a full refresh, which resets the view to the top level — expected).
- **Add / remove / reorder** experience or project entries by editing those arrays; slugs (`exp-N`/`proj-N`) renumber automatically, and the arc, scrolling, and detail page all follow.
- **Rename a section:** change its `label` in `sections` (leave `id` — it's structural). Updates the nav link *and* that section's panel heading.
- **About portrait:** `about.portrait` is a path under `public/` (e.g. `/portrait.jpg`) shown as a circular avatar in the About header (`AboutModal`); omit/empty to hide it. Drop the new image in `public/` first. The crop/framing (face position + the bottom mask that fades the torso into negative space) lives in `AboutModal.tsx` — tune `objectPosition` and the mask stops there, not in content. `about.bio` and `about.languages` complete that section.
- **Skills** is a list of `{ label, items[] }` categories rendered in order, each a row of pills — reorder the array (and items) to reflect importance. Labels are free text.
- **Optional fields are hidden when absent/empty:** experience `highlights`, project `description`/`highlights`/`period`/`stack`/`link`/`pdfs`. Delete the line to omit it.
- **Project bodies: `description` (one paragraph) OR `highlights` (multiple paragraphs).** Like an experience entry, a project's `highlights` is an array of strings rendered as **arrow (→) bullets** — one per paragraph; use it when a project needs more than a single line. `description` and `highlights` can coexist (description reads as a lead-in above the bullets). See the Identity Resolution project for the shape.
- **A project can attach 1–2 PDFs** via a `pdfs` array (PDFs only on projects). Each is `{ file, label, thumbnail? }`: `file` is a path under `public/` (e.g. `/thesis.pdf`); the card auto-renders the PDF's **first page** as the thumbnail (client-side, via pdf.js) — supply `thumbnail` (an image path under `public/`) only to override that. Clicking opens the PDF in a **new tab** (browser viewer / save), never a forced download. Until the `file` exists in `public/`, the card shows a clean document-glyph fallback. The card (`components/PdfCard.tsx`) is generic and reusable — e.g. for a future résumé viewer.
- **A project can be a single write-up OR a sub-entry list.** For a list (e.g. Kaggle), give the project an `entries` array; each entry is `{ name, accuracy?, description?, links? }` where `accuracy` renders in the small "period"-style font (use it for a score/metric, not a date) and `links` are named: `{ label, href }`. A project with `entries` typically omits `period`/`stack`/`link`. See the Kaggle Challenges project for the shape.

### State + the two-level arc (`page.tsx`)

`app/page.tsx` is the sole orchestrator and owns all state:

- `arcView` (`"sections"` | `"experience"` | `"projects"`) — what the arc lists. **Defaults to `sections`** (the home/top level).
- `activeIndex` — the centred/highlighted arc item.
- `openSection` / `aboutOpen` — which overlay (if any) is open.

The arc is a **two-level hierarchy**, not a flat list:

- **Top level (`arcView === "sections"`):** the arc lists the five sections themselves (`SECTIONS_ARC`, derived from `sections` in content; each item's `slug` is the section `id`).
- **Leaf sections** — `about` (→ `AboutModal`), `education` / `skills` (→ `SectionPanel`) — clicking opens their page directly.
- **Branch sections** — `experience` / `projects` (the `BRANCHES` set) — clicking *drills* the arc into that branch's entries (`EXPERIENCE_ARC` / `PROJECTS_ARC`, derived from content; `slug`s are `exp-N` / `proj-N`). Clicking an entry then opens its detail page.

Routing helpers: `openSectionId(id)` is the single dispatcher (modal vs page vs drill-in); `handleArcClick` interprets a click by current level; `handleNavigate` is the under-name nav (only shown when drilled in); `handleHome` returns to `sections` and restores `drilledFromIndex` (the section you drilled from) so home doesn't snap to the first item. **The name (`HeroName`/`MobileLayout`) is the home button** — clicking it calls `handleHome`; `Escape` does the same from a branch.

### The arc is rendered twice

The same `currentItems` + `activeIndex` drive two presentational components that are mutually exclusive by breakpoint:

- `components/ArcNav.tsx` — desktop, `hidden md:flex`, right-aligned big titles.
- `components/MobileLayout.tsx` — `md:hidden`, centred, includes the name/nav/links inline.

Two shared layout tricks — **if you touch one component, mirror it in the other:**

- **Variable anchor:** the active item's vertical anchor drifts from above-centre (first item) to below-centre (last item) as a function of `activeIndex / (items.length - 1)`, so the cascade always fills the viewport instead of stranding half of it empty.
- **Height-aware spacing (overlap prevention):** items are absolutely positioned, but the step between them is **not fixed**. Each item is measured (refs + `ResizeObserver`, stored in `heights`/`vh`|`zoneH` state), and the gap to a neighbour is `max(baseStepVh, neighbourHeightVh + GAP_VH)`. So normal single-line items keep the generous base step, but a tall item (multi-line title + a `subtitle`/company line) expands *only its local* spacing — guaranteeing no overlap at any font size or line count. Positions (`topEdges[]`) are computed by walking outward from the active item. First render (heights unmeasured) falls back to the base step, so SSR/first paint matches the old uniform look; the refinement is a client-only update (no hydration mismatch).

`ArcNav`'s full-screen container is `pointer-events-none` with `pointer-events-auto` re-enabled on each arc button — otherwise it sits above the name (`z-30` vs `z-10`) and silently swallows clicks meant for the home button.

### Scrolling: structure & smoothness (`page.tsx` useEffect)

This is the heart of the site's feel. **There is no native page scroll** (`body { overflow: hidden }`); a gentle scroll advances one arc item, a hard flick carries through several. Read this before touching anything scroll-related.

**Model — a carry-over delta accumulator (velocity-proportional).** Wheel `deltaY` accumulates into `wheelAccum` (a `useRef`); each whole `STEP_DISTANCE` chunk it contains commits one step, and only the *consumed* amount is subtracted (the remainder carries forward — it is **not** zeroed on a step). So total travel ≈ scroll distance ÷ `STEP_DISTANCE`: a nudge moves one item, a hard flick moves many. Steps are applied via `stepBy(count, dir)` in a single render so the spring glides straight to the destination.

**State must be refs, not state/locals.** `wheelAccum`, `lastStepAt`, `lastWheelAt` are all `useRef`. This is load-bearing: the listener effect re-runs whenever `activeIndex` (and `arcView`) changes, so any throttle kept in a local/`useState` would be reset on every step — the original bug where one scroll shot to the end. Keep them refs.

**Feel levers (all in `page.tsx`, documented inline):**
- `STEP_DISTANCE` (px, 90) — delta consumed per single step. ↑ = heavier / fewer steps, ↓ = lighter / more steps. This is the main "how many items per flick" dial.
- `STEP_INTERVAL` (ms, 55) — minimum time between commits; paces a fast burst into a visible glide instead of an instant teleport. (Also the touch tap-cooldown.)
- `MAX_PER_EVENT` (2) — most steps a single wheel event may fire; the rest come from following events, keeping even a huge single delta controlled.
- `IDLE_RESET` (ms, 130) — silence longer than this drops the leftover accumulator, so a fresh gesture doesn't inherit stale momentum.
- A **direction flip** (sign of `deltaY` vs `wheelAccum`) also zeroes the accumulator, so reversing is instant.
- `deltaMode` is normalized (Firefox reports lines/pages, not px → `×16` / `×innerHeight`).
- The glide + **bounce** between positions is the **Framer spring** on each arc item (`stiffness: 220, damping: 18, mass: 1` — slightly underdamped for a playful overshoot, mirrored in both arc components). Keep the overshoot moderate: a wilder bounce (much lower damping) can transiently shrink the gap between neighbours enough to overlap — the height-aware spacing only guarantees the *steady-state* gap.

**Touch is stepped LIVE during the drag** (in `touchmove`, not at `touchend`), so the arc tracks the finger as it moves. Each `TOUCH_STEP` (px, 120) of travel commits one step and carries the remainder — a normal swipe ≈ one item, a long drag several. `touchAccum`/`touchLastY` **must be refs** (the effect re-runs on every step; a local would reset mid-drag → next move jumps). The mobile container sets `touch-action: none` so the browser's pan/overscroll doesn't fight the drag (taps still fire). **Keyboard:** arrows step one; `Enter`/`Space` activate via a live `handleArcClickRef`; `Escape` closes/exits. All inputs bail early when an overlay is open (`isAnyOpen`).

### Overlays

`AboutModal.tsx` and `SectionPanel.tsx` are full-screen `modal-overlay` (dark, blurred) layers. `AboutModal` shows the bio, the circular `about.portrait`, education, contact and languages. `SectionPanel` is a router-by-string: `education`/`skills` render their own content components; `exp-*`/`proj-*` slugs render `ExperienceEntryContent`/`ProjectEntryContent`, which look the entry up by `slug` in the content arrays. `ProjectEntryContent` renders, in order: `description` lead-in, `highlights` arrow-bullets, `period`, `stack` pills, `link`, `pdfs` cards (`PdfCard`), then `entries` sub-items. All their data comes from `content.json` via `lib/content.ts` (see "Content is data-driven" above). Both overlays share the `.detail-page` (top/left/right/bottom buffer) and `.detail-close` (X parked inside the top buffer) classes from `globals.css`, so long, wrapping titles never collide with the close button — reuse those classes for any new detail page.

**PDF thumbnails (`PdfCard.tsx`).** Client-only: dynamically imports `pdfjs-dist`, renders page 1 to a canvas → data-URL, displayed in a uniform 16:9 circle-free card (portrait pages crop to their top). The pdf.js **worker** is referenced via `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`, which the bundler emits into the static export (`out/_next/static/media/…`) — so it works on Pages with no extra config. A `thumbnail` field overrides the auto-render; a missing file falls back to a document glyph.

### Background animation (`DotCanvas.tsx`)

Self-contained canvas constellation, `pointer-events-none z-0`. Nodes have a permanent slow **drift** (flips on wall bounce) plus a temporary **repel** force from the cursor that decays each frame (`REPEL_DECAY`). ~1/3 are larger "hub" nodes. Connection lines drawn between nearby nodes with quadratic alpha falloff. Pure refs/rAF, no React state — don't convert it.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds the static export and publishes to GitHub Pages. Custom domain `ritvikmaini.com` is preserved via `public/CNAME` (+ `public/.nojekyll`). Pages is configured for **workflow** build type (not the legacy branch source) — don't revert it. `next.config.ts` must keep `output: "export"`, `trailingSlash: true`, `images.unoptimized: true` for the export to work.

## Known placeholders

All fixable by editing `content.json` (or dropping a file in `public/`):

- `public/resume.pdf` does not exist yet (`profile.links.resume` points to it). When you add it, the `PdfCard` component is ready to preview it if you want a thumbnail instead of the raw link.
- `about.bio` is short placeholder text.
- Remaining `TODO` bodies: the TB International experience entry, and the `accuracy`/`description` on most Kaggle challenge entries (their names + repo links are real). The project write-ups and the Bavest experience are filled in. Empty optional fields are hidden in the UI.
- Nav links `ritvikmaini.com/linkedin` and `/github` are external redirect paths — they 404 if hit on the static site itself.
