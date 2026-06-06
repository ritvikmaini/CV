"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile, sections } from "@/lib/content";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR
// warning while still measuring before paint in the browser).
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ArcView = "sections" | "experience" | "projects";

interface ArcItem {
  label: string;
  subtitle?: string;
  slug?: string;
}

interface MobileLayoutProps {
  items: ArcItem[];
  activeIndex: number;
  arcView: ArcView;
  arcKey: string;
  showNav: boolean;
  onSelect: (i: number) => void;
  onHome: () => void;
  onAbout: () => void;
  onNavigate: (section: string) => void;
}

const NAME     = profile.name;
const ROLE     = profile.role;
const LOCATION = profile.location;

const LINKS = [
  { label: "Email",    href: `mailto:${profile.email}`, external: false },
  { label: "LinkedIn", href: profile.links.linkedin,    external: true  },
  { label: "GitHub",   href: profile.links.github,      external: true  },
  { label: "Resume",   href: profile.links.resume,      external: true  },
];

// Mobile favours a strong active item over a long cascade: the focused
// entry is display-sized, the rest collapse to one calm, legible menu size
// (entry titles can be long, so the non-active step is kept compact to stay
// readable and avoid edge-to-edge bleed on a narrow screen).
const FONT_SIZES = [
  "clamp(1.75rem, 8.5vw, 2.4rem)", // active
  "clamp(1.15rem, 5vw, 1.45rem)",
  "clamp(1.05rem, 4.5vw, 1.35rem)",
  "clamp(1rem, 4vw, 1.25rem)",
  "clamp(0.95rem, 3.8vw, 1.2rem)",
];

// Top-level sections are single words, so the active one can run larger.
const SECTION_FONT_SIZES = [
  "clamp(2.25rem, 11vw, 3rem)", // active
  "clamp(1.3rem, 6vw, 1.7rem)",
  "clamp(1.2rem, 5.2vw, 1.55rem)",
  "clamp(1.1rem, 4.6vw, 1.4rem)",
  "clamp(1.05rem, 4.2vw, 1.3rem)",
];

// Minimum breathing room (in vh) once height-aware spacing kicks in.
const GAP_VH = 1.5;

export default function MobileLayout({
  items, activeIndex, arcView, arcKey, showNav,
  onSelect, onHome, onAbout, onNavigate,
}: MobileLayoutProps) {
  const isSections = arcView === "sections";
  const scale      = isSections ? SECTION_FONT_SIZES : FONT_SIZES;
  // Tighter than before: with the non-active items now compact, a smaller
  // base step packs them into a cohesive menu block instead of stranding
  // them across the whole zone. The active item's height still expands its
  // own local spacing via the height-aware walk below.
  const baseStepVh = isSections ? 10 : 8.5;

  // Measure each item so the cascade spaces by real rendered height
  // (multi-line title + company) instead of a fixed step, preventing overlap.
  const zoneRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [heights, setHeights] = useState<number[]>([]);
  const [zoneH, setZoneH] = useState(0);

  // Read every item's rendered height (multi-line title + company) and the
  // zone height. State only changes when a value actually changes, so this
  // is safe to call on every render without looping.
  const measure = useCallback(() => {
    const next = itemRefs.current.map((el) => el?.offsetHeight ?? 0);
    setHeights((prev) =>
      prev.length === next.length && prev.every((h, i) => h === next[i]) ? prev : next
    );
    const z = zoneRef.current?.clientHeight ?? 0;
    setZoneH((prev) => (prev === z ? prev : z));
  }, []);

  // Re-measure *before paint* whenever the active item changes — every item's
  // font size (and therefore height) changes with it, so the overlap walk
  // below always runs on current heights. This is what guarantees no item
  // ever overlaps its neighbour, at any title length, line count, or zoom.
  useIsoLayout(() => { measure(); }, [measure, activeIndex, arcKey, items.length]);

  // Track external size changes: viewport resize, browser zoom, late font load.
  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    itemRefs.current.forEach((el) => el && ro.observe(el));
    if (zoneRef.current) ro.observe(zoneRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, arcKey]);

  // Variable anchor: active item's top edge drifts from near the top of the
  // zone (first item) to near the bottom (last), keeping the zone filled.
  const n = items.length;
  const denom = Math.max(n - 1, 1);
  const anchorVh = -25 + 35 * (activeIndex / denom);
  const heightVh = (i: number) => (zoneH > 0 ? ((heights[i] ?? 0) / zoneH) * 100 : 0);

  // Expand the step only where a neighbour is tall enough to overlap.
  const topEdges = new Array<number>(n);
  topEdges[activeIndex] = anchorVh;
  for (let i = activeIndex + 1; i < n; i++) {
    topEdges[i] = topEdges[i - 1] + Math.max(baseStepVh, heightVh(i - 1) + GAP_VH);
  }
  for (let i = activeIndex - 1; i >= 0; i--) {
    topEdges[i] = topEdges[i + 1] - Math.max(baseStepVh, heightVh(i) + GAP_VH);
  }

  return (
    <div
      className="fixed inset-0 md:hidden flex flex-col z-20 overflow-hidden"
      // Let our touchmove handler fully own the gesture (no browser
      // pan/overscroll fighting the live drag); taps still fire.
      style={{ touchAction: "none" }}
    >

      {/* ── Top info section ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center text-center shrink-0"
        style={{
          // Respect notch / Dynamic Island on iOS
          paddingTop: "max(2.75rem, calc(env(safe-area-inset-top) + 1rem))",
          paddingLeft: "clamp(1.25rem, 6vw, 2rem)",
          paddingRight: "clamp(1.25rem, 6vw, 2rem)",
          paddingBottom: "1.25rem",
        }}
      >
        {/* ── Identity block: name · role · location (tight grouping) ── */}
        <h1
          onClick={onHome}
          className="font-display font-black text-black leading-[0.85] tracking-tighter uppercase cursor-pointer active:opacity-80 transition-opacity"
          style={{ fontSize: "clamp(2.5rem, 11vw, 3.75rem)" }}
        >
          {NAME.split(" ").map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </h1>

        {/* Role — belongs to name, small gap */}
        <p
          className="text-black/70"
          style={{
            fontSize: "clamp(0.75rem, 3.5vw, 1rem)",
            marginTop: "0.625rem",
          }}
        >
          {ROLE}
        </p>

        {/* Location — paired with role, minimal gap */}
        <p
          className="mono-label text-black/50"
          style={{
            fontSize: "clamp(0.6rem, 2.6vw, 0.78rem)",
            marginTop: "0.35rem",
          }}
        >
          {LOCATION}
        </p>

        {/* ── Navigation — only while drilled into a branch ── */}
        {showNav && (
          <div
            className="flex items-center flex-wrap justify-center"
            style={{ gap: "0.5rem", marginTop: "1.25rem" }}
          >
            {sections.map((item, i) => (
              <span key={item.id} className="flex items-center" style={{ gap: "0.5rem" }}>
                {i > 0 && (
                  <span className="text-black/25" style={{ fontSize: "0.6rem" }}>|</span>
                )}
                <button
                  onClick={() => item.id === "about" ? onAbout() : onNavigate(item.id)}
                  className="font-mono uppercase tracking-wider transition-colors"
                  style={{
                    fontSize: "clamp(0.6rem, 2.6vw, 0.8rem)",
                    color: item.id === arcView ? "rgb(0,0,0)" : "rgba(0,0,0,0.55)",
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

      {/* ── Arc items ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={arcKey}
          ref={zoneRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 relative overflow-hidden"
          style={{
            // Soft fade at the top/bottom so items entering & leaving the zone
            // read as intentional rather than abruptly clipped.
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
          }}
        >
          {items.map((item, i) => {
            const dist      = i - activeIndex;
            const absDist   = Math.abs(dist);
            const titleSize    = scale[Math.min(absDist, scale.length - 1)];
            const subtitleSize = scale[Math.min(absDist + 2, scale.length - 1)];
            const yOffset   = topEdges[i];
            const opacity   = absDist > 4 ? 0 : 1;
            const isActive  = i === activeIndex;

            return (
              <motion.button
                key={item.slug ?? item.label}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="absolute group text-center"
                style={{ top: "50%", left: "6vw", right: "6vw", paddingTop: "0.45rem", paddingBottom: "0.45rem" }}
                initial={false}
                animate={{ opacity, y: `${yOffset}vh`, x: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, mass: 1 }}
                onClick={() => onSelect(i)}
              >
                <span
                  className={`font-display font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 break-words ${
                    isActive ? "text-black" : "text-black/55"
                  }`}
                  style={{ fontSize: titleSize }}
                >
                  {item.label}
                </span>
                {/* Company line — always shown, slightly lighter than the
                    title. Its height is measured, so the overlap-prevention
                    walk below accounts for it on every item. */}
                {item.subtitle && (
                  <span
                    className={`font-display font-black uppercase italic tracking-tighter leading-[0.85] block break-words ${
                      isActive ? "text-black/50" : "text-black/35"
                    }`}
                    style={{ fontSize: subtitleSize, marginTop: "0.1rem" }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Links bar — pinned to the bottom, divided from the arc ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="shrink-0 flex items-center flex-wrap justify-center border-t border-black/10"
        style={{
          gap: "0.625rem",
          paddingTop: "1rem",
          paddingLeft: "clamp(1.25rem, 6vw, 2rem)",
          paddingRight: "clamp(1.25rem, 6vw, 2rem)",
          // Respect the iOS home indicator
          paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
        }}
      >
        {LINKS.map((link, i) => (
          <span key={link.label} className="flex items-center" style={{ gap: "0.625rem" }}>
            {i > 0 && (
              <span className="text-black/30" style={{ fontSize: "0.6rem" }}>·</span>
            )}
            <a
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-mono uppercase tracking-wider text-black/70 hover:text-black transition-colors"
              style={{ fontSize: "clamp(0.62rem, 2.7vw, 0.8rem)" }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
