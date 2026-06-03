"use client";
import { useState, useEffect, useRef } from "react";
import DotCanvas from "@/components/DotCanvas";
import ArcNav from "@/components/ArcNav";
import HeroName from "@/components/HeroName";
import SocialLinks from "@/components/SocialLinks";
import MobileLayout from "@/components/MobileLayout";
import AboutModal from "@/components/AboutModal";
import SectionPanel from "@/components/SectionPanel";

type ArcMode = "experience" | "projects";

const EXPERIENCE_ARC = [
  { label: "AI Engineer",                              subtitle: "Bavest",                                slug: "exp-0" },
  { label: "Working Student AI, Automation & E-Commerce", subtitle: "TB International GmbH",             slug: "exp-1" },
  { label: "Industry Project",                         subtitle: "TB International GmbH",                slug: "exp-2" },
  { label: "Tutor",                                    subtitle: "Darmstadt University of Applied Sciences", slug: "exp-3" },
  { label: "Intern",                                   subtitle: "Studierendenwerk",                     slug: "exp-4" },
  { label: "Web Development Intern",                   subtitle: "Maruti Suzuki India Limited",          slug: "exp-5" },
  { label: "Intern",                                   subtitle: "Webmentix GmbH",                       slug: "exp-6" },
  { label: "Intern",                                   subtitle: "E-Meditek Global Pvt Ltd",             slug: "exp-7" },
];

const PROJECTS_ARC = [
  { label: "Photo Studio Cropping Tool",                slug: "proj-0" },
  { label: "Identity Resolution via Face Recognition",  slug: "proj-1" },
  { label: "AI Apparel Image Generation",               slug: "proj-2" },
  { label: "LLM Product Description Generator",         slug: "proj-3" },
  { label: "Touch-recognition",                         slug: "proj-4" },
  { label: "Kaggle Challenges",                         slug: "proj-5" },
];

export default function Home() {
  const [arcMode,      setArcMode]      = useState<ArcMode>("projects");
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [openSection,  setOpenSection]  = useState<string | null>(null);
  const [aboutOpen,    setAboutOpen]    = useState(false);

  const currentItems = arcMode === "experience" ? EXPERIENCE_ARC : PROJECTS_ARC;
  const isAnyOpen    = openSection !== null || aboutOpen;

  const handleSetMode = (mode: ArcMode) => {
    if (mode === arcMode) return;
    setArcMode(mode);
    setActiveIndex(0);
    setOpenSection(null);
  };

  // Arc sub-item click → centre + open detail panel
  const handleArcClick = (i: number) => {
    setActiveIndex(i);
    setOpenSection(currentItems[i].slug);
  };

  // Bottom-left nav
  const handleNavigate = (section: string) => {
    if (section === "about") { setAboutOpen(true); return; }
    if (section === "experience" || section === "projects") {
      handleSetMode(section as ArcMode); return;
    }
    // education, skills → open section panel directly
    setOpenSection(section);
  };

  // Scroll-state refs persist across re-renders (never reset by setActiveIndex)
  const wheelAccum  = useRef(0); // accumulated scroll distance toward the next step
  const lastStepAt  = useRef(0); // timestamp of the last committed step
  const lastWheelAt = useRef(0); // timestamp of the last wheel event (idle detection)

  // Tuning — deliberate but responsive
  const STEP_THRESHOLD = 80;  // px of accumulated delta to advance one item
  const STEP_COOLDOWN  = 260; // ms minimum between steps (≈ spring settle time)
  const IDLE_RESET     = 160; // ms of silence → treat next wheel as a fresh gesture

  // Scroll / swipe / keyboard cycles the arc without opening panels
  useEffect(() => {
    const len = currentItems.length;

    const step = (dir: number) => {
      setActiveIndex((prev) =>
        dir > 0 ? Math.min(prev + 1, len - 1) : Math.max(prev - 1, 0)
      );
      lastStepAt.current = Date.now();
      wheelAccum.current = 0; // restart accumulation after each step (deliberate feel)
    };

    const handleWheel = (e: WheelEvent) => {
      if (isAnyOpen) return;
      const now = Date.now();

      // Normalize delta units (Firefox can report lines/pages instead of pixels)
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;

      // Fresh gesture after a pause, or a direction flip → discard stale momentum
      if (now - lastWheelAt.current > IDLE_RESET) wheelAccum.current = 0;
      if (wheelAccum.current !== 0 && Math.sign(dy) !== Math.sign(wheelAccum.current))
        wheelAccum.current = 0;
      lastWheelAt.current = now;

      wheelAccum.current += dy;

      if (now - lastStepAt.current < STEP_COOLDOWN) return; // one step per cooldown
      if (Math.abs(wheelAccum.current) >= STEP_THRESHOLD) step(wheelAccum.current);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (isAnyOpen) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight")
        setActiveIndex((prev) => Math.min(prev + 1, len - 1));
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      else if (e.key === "Enter" || e.key === " ")
        setOpenSection(currentItems[activeIndex].slug);
      else if (e.key === "Escape") { setOpenSection(null); setAboutOpen(false); }
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
  }, [isAnyOpen, activeIndex, currentItems]);

  // Resolve the title to show in the entry detail panel heading
  const entryTitle = (() => {
    if (!openSection) return undefined;
    if (openSection.startsWith("exp-"))  return EXPERIENCE_ARC[parseInt(openSection.split("-")[1])]?.label;
    if (openSection.startsWith("proj-")) return PROJECTS_ARC[parseInt(openSection.split("-")[1])]?.label;
    return undefined;
  })();

  return (
    <div className="min-h-screen bg-[#4801FF]">
      <DotCanvas />

      <ArcNav
        items={currentItems}
        activeIndex={activeIndex}
        onSelect={handleArcClick}
        arcKey={arcMode}
        variant={arcMode === "projects" ? "project" : "experience"}
      />

      <HeroName
        onAbout={() => setAboutOpen(true)}
        onNavigate={handleNavigate}
        arcMode={arcMode}
      />

      <SocialLinks />

      <MobileLayout
        items={currentItems}
        activeIndex={activeIndex}
        arcMode={arcMode}
        arcKey={arcMode}
        onSelect={handleArcClick}
        onAbout={() => setAboutOpen(true)}
        onNavigate={handleNavigate}
      />

      <AboutModal    isOpen={aboutOpen}       onClose={() => setAboutOpen(false)} />
      <SectionPanel  section={openSection}    onClose={() => setOpenSection(null)} entryTitle={entryTitle} />
    </div>
  );
}
