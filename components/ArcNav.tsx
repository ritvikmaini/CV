"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR
// warning while still measuring before paint in the browser).
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface ArcItem {
  label: string;
  subtitle?: string;
  slug?: string;
}

interface ArcNavProps {
  items: ArcItem[];
  activeIndex: number;
  onSelect: (i: number) => void;
  arcKey: string;
  variant: "section" | "project" | "experience";
}

// Projects — larger; titles are 2–6 words, no subtitle
const PROJECT_FONT_SIZES = [
  "clamp(1.75rem, 4vw, 5rem)",
  "clamp(1.5rem, 3.5vw, 4rem)",
  "clamp(1.25rem, 2.75vw, 3.5rem)",
  "clamp(1rem, 2vw, 3rem)",
  "clamp(0.875rem, 1.5vw, 2.5rem)",
];

// Top-level sections — single short words, so the headline can run bigger
// than the entry lists for a stronger "home" feel.
const SECTION_FONT_SIZES = [
  "clamp(2.25rem, 5vw, 6rem)",
  "clamp(1.75rem, 4vw, 4.75rem)",
  "clamp(1.5rem, 3vw, 3.75rem)",
  "clamp(1.25rem, 2.25vw, 3.25rem)",
  "clamp(1rem, 1.75vw, 2.75rem)",
];

// Minimum breathing room (in vh) kept between an item's edge and its
// neighbour once height-aware spacing kicks in.
const GAP_VH = 2;

export default function ArcNav({ items, activeIndex, onSelect, arcKey, variant }: ArcNavProps) {
  const sizes = variant === "section" ? SECTION_FONT_SIZES : PROJECT_FONT_SIZES;
  const baseStepVh = variant === "project" ? 24 : 26;

  // Measure each item so the cascade can space by real rendered height
  // (multi-line titles + a company line) instead of a fixed step — that's
  // what stops a tall item from overlapping the one below it.
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [heights, setHeights] = useState<number[]>([]);
  const [vh, setVh] = useState(0);

  // Read every item's rendered height (multi-line title + subtitle) and the
  // container height. State only changes when a value actually changes, so
  // this is safe to call on every render without looping.
  const measure = useCallback(() => {
    const next = itemRefs.current.map((el) => el?.offsetHeight ?? 0);
    setHeights((prev) =>
      prev.length === next.length && prev.every((h, i) => h === next[i]) ? prev : next
    );
    const v = containerRef.current?.clientHeight ?? window.innerHeight;
    setVh((prev) => (prev === v ? prev : v));
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
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, arcKey]);

  // Variable anchor: the active item's top edge drifts from above-centre
  // (first item) to below-centre (last), so the cascade always fills the
  // viewport instead of leaving one half empty at the ends.
  const n = items.length;
  const denom = Math.max(n - 1, 1);
  const anchorVh = -15 + 30 * (activeIndex / denom);
  const heightVh = (i: number) => (vh > 0 ? ((heights[i] ?? 0) / vh) * 100 : 0);

  // Walk outward from the active item, expanding the step only where a
  // neighbour is tall enough that the base step would overlap it.
  const topEdges = new Array<number>(n);
  topEdges[activeIndex] = anchorVh;
  for (let i = activeIndex + 1; i < n; i++) {
    topEdges[i] = topEdges[i - 1] + Math.max(baseStepVh, heightVh(i - 1) + GAP_VH);
  }
  for (let i = activeIndex - 1; i >= 0; i--) {
    topEdges[i] = topEdges[i + 1] - Math.max(baseStepVh, heightVh(i) + GAP_VH);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed inset-0 z-30 hidden md:flex items-center overflow-hidden pointer-events-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={arcKey}
          ref={containerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative w-full h-full overflow-hidden"
        >
          {items.map((item, i) => {
            const dist         = i - activeIndex;
            const absDist      = Math.abs(dist);
            const titleSize    = sizes[Math.min(absDist, sizes.length - 1)];
            const subtitleSize = sizes[Math.min(absDist + 2, sizes.length - 1)];
            const yOffset      = topEdges[i];
            const opacity      = absDist > 5 ? 0 : 1;
            const isActive     = i === activeIndex;

            return (
              <motion.button
                key={item.slug ?? item.label}
                ref={(el) => { itemRefs.current[i] = el; }}
                className="arc-item group absolute text-right pointer-events-auto"
                style={{
                  right: "clamp(2.5rem, 5vw, 8rem)",
                  top: "50%",
                  transformOrigin: "right center",
                  maxWidth: "62vw",
                }}
                initial={false}
                animate={{ opacity, y: `${yOffset}vh`, x: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, mass: 1 }}
                onClick={() => onSelect(i)}
              >
                {/* Title / role */}
                <span
                  className={`font-display font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 pr-[0.15em] break-words ${
                    isActive ? "text-black" : "text-black/40 group-hover:text-black/70"
                  }`}
                  style={{ fontSize: titleSize }}
                >
                  {item.label}
                </span>

                {/* Company / subtitle */}
                {item.subtitle && (
                  <span
                    className={`font-display font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 pr-[0.15em] break-words ${
                      isActive ? "text-black/50" : "text-black/25 group-hover:text-black/40"
                    }`}
                    style={{ fontSize: subtitleSize }}
                  >
                    {item.subtitle}
                  </span>
                )}

                <motion.div
                  className="h-[3px] bg-black mt-1 origin-right"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
