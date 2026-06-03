"use client";
import { motion, AnimatePresence } from "framer-motion";

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
  variant: "project" | "experience";
}

// Projects — larger; titles are 2–6 words, no subtitle
const PROJECT_FONT_SIZES = [
  "clamp(1.75rem, 4vw, 5rem)",
  "clamp(1.5rem, 3.5vw, 4rem)",
  "clamp(1.25rem, 2.75vw, 3.5rem)",
  "clamp(1rem, 2vw, 3rem)",
  "clamp(0.875rem, 1.5vw, 2.5rem)",
];

export default function ArcNav({ items, activeIndex, onSelect, arcKey, variant }: ArcNavProps) {
  const sizes = PROJECT_FONT_SIZES; // same scale for both modes
  const yStep = variant === "project" ? 24 : 26;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed inset-0 z-30 hidden md:flex items-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={arcKey}
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
            const yOffset      = dist * yStep;
            const opacity      = absDist > 5 ? 0 : 1;
            const isActive     = i === activeIndex;

            return (
              <motion.button
                key={item.slug ?? item.label}
                className="arc-item group absolute text-right"
                style={{
                  right: "clamp(2.5rem, 5vw, 8rem)",
                  top: "50%",
                  transformOrigin: "right center",
                  maxWidth: "62vw",
                }}
                initial={false}
                animate={{ opacity, y: `${yOffset}vh`, x: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                onClick={() => onSelect(i)}
              >
                {/* Title / role */}
                <span
                  className={`font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 pr-[0.15em] break-words ${
                    isActive ? "text-black" : "text-black/40 group-hover:text-black/70"
                  }`}
                  style={{ fontSize: titleSize }}
                >
                  {item.label}
                </span>

                {/* Company / subtitle */}
                {item.subtitle && (
                  <span
                    className={`font-black uppercase italic tracking-tighter leading-[0.85] block transition-colors duration-300 pr-[0.15em] break-words ${
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
