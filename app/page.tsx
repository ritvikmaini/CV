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

  // Scroll-state refs persist across re-renders (never reset by setActiveIndex)
  const wheelAccum  = useRef(0);    // accumulated scroll distance toward the next step
  const lastStepAt  = useRef(0);    // timestamp of the last committed step
  const lastWheelAt = useRef(0);    // timestamp of the last wheel event (idle detection)
  const wheelArmed  = useRef(true); // ready to commit a step? (false = swallowing a gesture's tail)

  // Tuning — the arc is the primary interaction, so this is built around one
  // intentional gesture = one step, with these levers:
  const STEP_THRESHOLD = 64;  // px of accumulated delta to commit one step (↓ = lighter)
  const STEP_COOLDOWN  = 240; // ms floor between steps — anti-jitter + touch cadence
  const IDLE_RESET     = 130; // ms of silence → a fresh gesture (re-arm, drop momentum)
  const QUIET_DELTA    = 5;   // |delta| at/below this = the gesture is easing off → re-arm
  const HOLD_REPEAT    = 500; // ms; a *held* continuous scroll re-steps at this cadence
                              // so a long drag isn't stuck on one item

  // Scroll / swipe / keyboard cycles the arc without opening panels
  useEffect(() => {
    const len = currentItems.length;

    const step = (dir: number) => {
      setActiveIndex((prev) =>
        dir > 0 ? Math.min(prev + 1, len - 1) : Math.max(prev - 1, 0)
      );
      lastStepAt.current = Date.now();
      wheelAccum.current = 0;      // restart accumulation after each step
      wheelArmed.current = false;  // swallow the rest of this gesture until it eases
    };

    const handleWheel = (e: WheelEvent) => {
      if (isAnyOpen) return;
      const now = Date.now();

      // Normalize delta units (Firefox can report lines/pages instead of pixels)
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;

      // A pause since the last event starts a fresh gesture: drop any leftover
      // momentum and re-arm so the next push commits immediately.
      if (now - lastWheelAt.current > IDLE_RESET) {
        wheelAccum.current = 0;
        wheelArmed.current = true;
      }
      // Reversing direction is intentional → reset and re-arm instantly.
      if (wheelAccum.current !== 0 && Math.sign(dy) !== Math.sign(wheelAccum.current)) {
        wheelAccum.current = 0;
        wheelArmed.current = true;
      }
      lastWheelAt.current = now;

      // After a committed step we're disarmed, swallowing the gesture's tail.
      // Re-arm when that tail eases off (inertia decays below the quiet floor)
      // or when a genuinely *held* scroll has run past the repeat cadence —
      // this is what stops one trackpad flick from skipping several items while
      // still letting a sustained drag keep moving.
      if (!wheelArmed.current) {
        if (Math.abs(dy) <= QUIET_DELTA || now - lastStepAt.current >= HOLD_REPEAT) {
          wheelArmed.current = true;
          wheelAccum.current = 0;
        } else {
          return; // still mid-gesture inertia — ignore
        }
      }

      wheelAccum.current += dy;

      if (now - lastStepAt.current < STEP_COOLDOWN) return; // anti-jitter floor
      if (Math.abs(wheelAccum.current) >= STEP_THRESHOLD) step(wheelAccum.current);
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

    // Mobile: one deliberate swipe = one step (measured at lift)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnyOpen) return;
      const now = Date.now();
      if (now - lastStepAt.current < STEP_COOLDOWN) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 35) return; // ignore taps / tiny drags
      step(delta);
    };

    window.addEventListener("wheel",      handleWheel,      { passive: true });
    window.addEventListener("keydown",    handleKey);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend",   handleTouchEnd);
    return () => {
      window.removeEventListener("wheel",      handleWheel);
      window.removeEventListener("keydown",    handleKey);
      window.removeEventListener("touchstart", handleTouchStart);
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
