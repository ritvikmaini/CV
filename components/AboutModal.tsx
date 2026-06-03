"use client";
import { motion, AnimatePresence } from "framer-motion";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// TODO: fill in your real content
const BIO =
  "Software Engineer with experience building [describe your work here]. Passionate about [your interests].";

const EDUCATION = {
  degree: "B.S. Computer Science",
  school: "[Your University]",
  year: "[Graduation Year]",
};

const CONTACT = {
  email: "mainiritvik@gmail.com",
  location: "Darmstadt, Germany",
};

const LANGUAGES_SPOKEN = ["English (Native)", "Hindi (Native)"];

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
            className="fixed top-8 right-8 z-[101] text-white hover:text-white/70 transition-colors"
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

          <div className="min-h-screen px-8 py-24 md:px-16">
            <div className="max-w-6xl mx-auto">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-16"
              >
                <h2 className="font-black text-5xl md:text-7xl text-white mb-6 uppercase tracking-tighter">
                  ABOUT
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
                  <h3 className="font-black text-xl text-white mb-4 border-b border-white/20 pb-2 uppercase tracking-wider">
                    Education
                  </h3>
                  <div className="space-y-2">
                    <p className="text-white font-medium">{EDUCATION.degree}</p>
                    <p className="text-white/70">{EDUCATION.school}</p>
                    <p className="text-white/50 text-sm">{EDUCATION.year}</p>
                  </div>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="font-black text-xl text-white mb-4 border-b border-white/20 pb-2 uppercase tracking-wider">
                    Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="text-white hover:text-white/70 transition-colors link-underline"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                        Location
                      </p>
                      <p className="text-white/80">{CONTACT.location}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
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
