"use client";
import { useState, useEffect, useRef } from "react";
import DotCanvas from "@/components/DotCanvas";
import ArcNav from "@/components/ArcNav";
import HeroName from "@/components/HeroName";
import SocialLinks from "@/components/SocialLinks";
import MobileLayout from "@/components/MobileLayout";
import AboutModal from "@/components/AboutModal";
import SectionPanel from "@/components/SectionPanel";
import { sections, experience, projects } from "@/lib/content";

// Two-level arc:
//  • "sections" (top / home)  → the five sections themselves
//  • "experience" / "projects" → that branch's entries (drilled in)
type ArcView = "sections" | "experience" | "projects";

// Top level: the five sections become arc items. slug = the section id,
// which is how a click is routed (leaf → page, branch → drill in).
const SECTIONS_ARC = sections.map((s) => ({
  label: s.label,
  slug: s.id,
}));

// Branch levels, derived from the content source.
// Experience shows the company as a subtitle; projects show the title alone.
const EXPERIENCE_ARC = experience.map((e) => ({
  label: e.label,
  subtitle: e.company,
  slug: e.slug,
}));

const PROJECTS_ARC = projects.map((p) => ({
  label: p.label,
  slug: p.slug,
}));

// Sections that drill into a sub-list rather than opening a page directly.
const BRANCHES = new Set(["experience", "projects"]);

export default function Home() {
  const [arcView,      setArcView]      = useState<ArcView>("sections");
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [openSection,  setOpenSection]  = useState<string | null>(null);
  const [aboutOpen,    setAboutOpen]    = useState(false);

  const currentItems =
    arcView === "experience" ? EXPERIENCE_ARC
    : arcView === "projects" ? PROJECTS_ARC
    : SECTIONS_ARC;
  const isAnyOpen = openSection !== null || aboutOpen;

  // Remembered so that clicking the name (→ home) re-highlights the section
  // you drilled in from, rather than snapping back to the first item.
  const drilledFromIndex = useRef(0);

  // Open one of the section ids: about → modal, education/skills → panel,
  // experience/projects → drill the arc into that branch.
  const openSectionId = (id: string, fromIndex?: number) => {
    if (id === "about") { setAboutOpen(true); return; }
    if (BRANCHES.has(id)) {
      if (typeof fromIndex === "number") drilledFromIndex.current = fromIndex;
      setArcView(id as ArcView);
      setActiveIndex(0);
      setOpenSection(null);
      return;
    }
    setOpenSection(id); // education, skills
  };

  // Arc item click. At the top level the slug is a section id; inside a
  // branch it's an entry slug whose detail page we open.
  const handleArcClick = (i: number) => {
    if (arcView === "sections") {
      openSectionId(currentItems[i].slug, i);
      return;
    }
    setActiveIndex(i);
    setOpenSection(currentItems[i].slug);
  };

  // Under-name nav (only visible when drilled in). Mirrors arc routing but
  // jumps from a section id, re-deriving the home-return highlight.
  const handleNavigate = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    openSectionId(id, idx >= 0 ? idx : undefined);
  };

  // Clicking the name returns to the top level (home).
  const handleHome = () => {
    setArcView("sections");
    setActiveIndex(drilledFromIndex.current);
    setOpenSection(null);
    setAboutOpen(false);
  };

  // Live ref so the keyboard listener always calls the latest router
  // (Enter activates the focused item) without re-binding on every render.
  const handleArcClickRef = useRef(handleArcClick);
  useEffect(() => { handleArcClickRef.current = handleArcClick; });

  // Scroll-state refs persist across re-renders (never reset by setActiveIndex).
  // The touch refs are load-bearing for live dragging: the scroll effect
  // re-runs on every step (activeIndex change), so any per-gesture state kept
  // in a local/useState would reset mid-drag and the next move would jump.
  const wheelAccum  = useRef(0); // delta accumulated toward the next step (carries over)
  const lastStepAt  = useRef(0); // timestamp of the last committed step
  const lastWheelAt = useRef(0); // timestamp of the last wheel event (idle detection)
  const touchAccum  = useRef(0); // finger travel accumulated toward the next step
  const touchLastY  = useRef(0); // last touch Y, for per-move deltas (live dragging)

  // The arc is the primary interaction — tuned for a smooth, playful scroll:
  // a gentle nudge advances one item, a hard flick carries through several.
  // The leftover delta is NOT zeroed on a step (only the consumed amount is
  // subtracted), so total travel ≈ scroll distance ÷ STEP_DISTANCE.
  const STEP_DISTANCE = 90;  // px of wheel delta per step (↑ = heavier / fewer)
  const IDLE_RESET    = 130; // ms of silence → fresh gesture (drop leftover momentum)
  const STEP_INTERVAL = 55;  // ms min between commits — paces a fast burst into a glide
  const MAX_PER_EVENT = 2;   // most steps a single input event may fire (rest come next)
  const TOUCH_STEP    = 120; // px of finger travel per step — stepped LIVE during a drag,
                             // so a normal swipe ≈ one item and you see each step happen

  // Scroll / swipe / keyboard cycles the arc without opening panels
  useEffect(() => {
    const len = currentItems.length;
    const clamp = (i: number) => Math.max(0, Math.min(len - 1, i));

    // Advance `count` items in `dir` (±1) in a single render — the spring
    // then glides (and bounces) straight to the destination.
    const stepBy = (count: number, dir: number) => {
      if (count <= 0) return;
      setActiveIndex((prev) => clamp(prev + dir * count));
      lastStepAt.current = Date.now();
    };

    const handleWheel = (e: WheelEvent) => {
      if (isAnyOpen) return;
      const now = Date.now();

      // Normalize delta units (Firefox can report lines/pages instead of pixels)
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;

      // A pause since the last event starts a fresh gesture; reversing
      // direction is intentional. Either way, drop the leftover momentum.
      if (now - lastWheelAt.current > IDLE_RESET) wheelAccum.current = 0;
      if (wheelAccum.current !== 0 && Math.sign(dy) !== Math.sign(wheelAccum.current))
        wheelAccum.current = 0;
      lastWheelAt.current = now;
      wheelAccum.current += dy;

      if (now - lastStepAt.current < STEP_INTERVAL) return; // pace bursts into a glide

      // Consume the accumulator in STEP_DISTANCE chunks (carry the remainder),
      // so a gentle nudge yields one step and a hard flick yields several.
      const dir = Math.sign(wheelAccum.current);
      let n = 0;
      while (Math.abs(wheelAccum.current) >= STEP_DISTANCE && n < MAX_PER_EVENT) {
        wheelAccum.current -= dir * STEP_DISTANCE;
        n++;
      }
      if (n > 0) stepBy(n, dir);
    };

    const handleKey = (e: KeyboardEvent) => {
      // Escape: close an open panel, or step back out of a branch to home.
      if (e.key === "Escape") {
        if (isAnyOpen) { setOpenSection(null); setAboutOpen(false); }
        else if (arcView !== "sections") handleHome();
        return;
      }
      if (isAnyOpen) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight")
        setActiveIndex((prev) => Math.min(prev + 1, len - 1));
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      else if (e.key === "Enter" || e.key === " ")
        handleArcClickRef.current(activeIndex);
    };

    // Mobile: step LIVE as the finger moves (not at lift), so the arc tracks
    // the drag. Each TOUCH_STEP of travel commits one step and carries the
    // remainder — a normal swipe advances one item, a long drag several, with
    // each step visible mid-drag so it never overshoots by surprise.
    const handleTouchStart = (e: TouchEvent) => {
      touchLastY.current = e.touches[0].clientY;
      touchAccum.current = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isAnyOpen) return;
      const y = e.touches[0].clientY;
      const dy = touchLastY.current - y; // finger up → positive → advance forward
      touchLastY.current = y;
      // Reversing direction is intentional → reset for an instant flip.
      if (touchAccum.current !== 0 && Math.sign(dy) !== Math.sign(touchAccum.current))
        touchAccum.current = 0;
      touchAccum.current += dy;

      const dir = Math.sign(touchAccum.current);
      let n = 0;
      while (Math.abs(touchAccum.current) >= TOUCH_STEP && n < MAX_PER_EVENT) {
        touchAccum.current -= dir * TOUCH_STEP;
        n++;
      }
      if (n > 0) stepBy(n, dir);
    };
    const handleTouchEnd = () => { touchAccum.current = 0; };

    window.addEventListener("wheel",      handleWheel,      { passive: true });
    window.addEventListener("keydown",    handleKey);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
    window.addEventListener("touchend",   handleTouchEnd);
    return () => {
      window.removeEventListener("wheel",      handleWheel);
      window.removeEventListener("keydown",    handleKey);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove",  handleTouchMove);
      window.removeEventListener("touchend",   handleTouchEnd);
    };
  }, [isAnyOpen, activeIndex, currentItems, arcView]);

  return (
    <div className="min-h-screen app-bg">
      <DotCanvas />
      <div className="grain" aria-hidden />

      <ArcNav
        items={currentItems}
        activeIndex={activeIndex}
        onSelect={handleArcClick}
        arcKey={arcView}
        variant={arcView === "experience" ? "experience" : arcView === "projects" ? "project" : "section"}
      />

      <HeroName
        onHome={handleHome}
        onAbout={() => setAboutOpen(true)}
        onNavigate={handleNavigate}
        arcView={arcView}
        showNav={arcView !== "sections"}
      />

      <SocialLinks />

      <MobileLayout
        items={currentItems}
        activeIndex={activeIndex}
        arcView={arcView}
        arcKey={arcView}
        showNav={arcView !== "sections"}
        onSelect={handleArcClick}
        onHome={handleHome}
        onAbout={() => setAboutOpen(true)}
        onNavigate={handleNavigate}
      />

      <AboutModal    isOpen={aboutOpen}       onClose={() => setAboutOpen(false)} />
      <SectionPanel  section={openSection}    onClose={() => setOpenSection(null)} />
    </div>
  );
}
