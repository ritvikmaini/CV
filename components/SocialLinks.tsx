"use client";
import { motion } from "framer-motion";

const EMAIL    = "mainiritvik@gmail.com";
const LINKEDIN = "https://ritvikmaini.com/linkedin?ref=profile";
const GITHUB   = "http://ritvikmaini.com/github?ref=profile";
const RESUME   = "/resume.pdf";

const LINKS = [
  { label: "Email",    href: `mailto:${EMAIL}`,  external: false },
  { label: "LinkedIn", href: LINKEDIN,            external: true  },
  { label: "GitHub",   href: GITHUB,              external: true  },
  { label: "Resume",   href: RESUME,              external: true  },
];

export default function SocialLinks() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="fixed z-50 hidden md:flex items-center"
      style={{
        bottom: "clamp(1.5rem, 4vh, 3rem)",
        right:  "clamp(1.5rem, 4vw, 3rem)",
        gap:    "clamp(0.75rem, 1.5vw, 1.5rem)",
      }}
    >
      {LINKS.map((link, i) => (
        <span key={link.label} className="flex items-center" style={{ gap: "clamp(0.75rem, 1.5vw, 1.5rem)" }}>
          {i > 0 && (
            <span className="text-black/30" style={{ fontSize: "clamp(0.65rem, 1vw, 1.1rem)" }}>
              |
            </span>
          )}
          <a
            href={link.href}
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-black/80 hover:text-black transition-colors link-underline"
            style={{ fontSize: "clamp(0.75rem, 1.2vw, 1.25rem)" }}
          >
            {link.label}
          </a>
        </span>
      ))}
    </motion.div>
  );
}
