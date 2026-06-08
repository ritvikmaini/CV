"use client";
import { motion, AnimatePresence } from "framer-motion";
import { about, profile, education, sectionLabel } from "@/lib/content";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BIO = about.bio;
const PORTRAIT = about.portrait;

// Most recent education entry — single source from the education section
const LATEST_EDUCATION = education[0];

const CONTACT = {
  email: profile.email,
  location: profile.location,
};

const LANGUAGES_SPOKEN = about.languages;

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] modal-overlay overflow-y-auto"
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={onClose}
            className="detail-close z-[101] text-white hover:text-[var(--accent)] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="min-h-screen detail-page">
            <div className="max-w-6xl mx-auto">
              {/* Heading + portrait */}
              <div className="mb-16 flex flex-col-reverse gap-10 md:flex-row md:items-center md:gap-14">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="md:flex-1"
                >
                  <p className="mono-label text-[var(--accent)] text-xs mb-3">{`// ${profile.name}`}</p>
                  <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-6 uppercase tracking-tighter leading-[0.9]">
                    {sectionLabel("about")}
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                    {BIO}
                  </p>
                </motion.div>

                {PORTRAIT && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative shrink-0 self-center md:self-auto"
                  >
                    {/* Soft atmospheric halo — keeps the near-black photo from
                        dissolving into the equally dark overlay. */}
                    <div
                      className="pointer-events-none absolute -inset-4 rounded-full opacity-70 blur-2xl"
                      style={{
                        background:
                          "radial-gradient(closest-side, rgba(199,242,77,0.12), rgba(72,1,255,0.10), transparent 72%)",
                      }}
                    />
                    <div
                      className="relative h-40 w-40 overflow-hidden rounded-full ring-1 ring-white/15 transition-all duration-500 group-hover:ring-2 group-hover:ring-[var(--accent)]/60 sm:h-48 sm:w-48 md:h-56 md:w-56"
                      style={{ boxShadow: "0 22px 60px -22px rgba(0,0,0,0.95)", backgroundColor: "#0a0910" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={PORTRAIT}
                        alt={profile.name}
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        style={{
                          // Sit the face high so there's dark headroom above it,
                          objectPosition: "50% 4%",
                          // …then feather the chest/torso down into the circle's
                          // dark fill, so the lower half reads as negative space.
                          maskImage: "linear-gradient(to bottom, #000 52%, transparent 86%)",
                          WebkitMaskImage: "linear-gradient(to bottom, #000 52%, transparent 86%)",
                        }}
                      />
                      {/* Inset hairline for a crisp edge against the dark photo */}
                      <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="mono-label text-sm text-white/70 mb-4 border-b border-white/20 pb-2">
                    Education
                  </h3>
                  <div className="space-y-2">
                    <p className="text-white font-medium">{LATEST_EDUCATION.degree}</p>
                    <p className="text-white/70">{LATEST_EDUCATION.school}</p>
                    <p className="mono-label text-white/45 text-xs mt-1">{LATEST_EDUCATION.period}</p>
                  </div>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="mono-label text-sm text-white/70 mb-4 border-b border-white/20 pb-2">
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mono-label text-white/50 text-xs mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="text-white hover:text-[var(--accent)] transition-colors link-underline"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                    <div>
                      <p className="mono-label text-white/50 text-xs mb-1">
                        Location
                      </p>
                      <p className="text-white/80">{CONTACT.location}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="mono-label text-white/50 text-xs mb-2">
                        Languages
                      </p>
                      <div className="space-y-1">
                        {LANGUAGES_SPOKEN.map((l) => (
                          <p key={l} className="text-white/80 text-sm">
                            {l}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
