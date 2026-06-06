"use client";
import { motion, AnimatePresence } from "framer-motion";
import { about, profile, education, sectionLabel } from "@/lib/content";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BIO = about.bio;

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
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-16"
              >
                <p className="mono-label text-[var(--accent)] text-xs mb-3">{`// ${profile.name}`}</p>
                <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-6 uppercase tracking-tighter leading-[0.9]">
                  {sectionLabel("about")}
                </h2>
                <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed">
                  {BIO}
                </p>
              </motion.div>

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
