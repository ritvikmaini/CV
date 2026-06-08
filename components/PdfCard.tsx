"use client";

// A document card for the detail overlays. Shows a thumbnail of a PDF's
// first page (auto-rendered client-side with pdf.js, with an optional
// manual `thumbnail` override and a graceful glyph fallback). The whole
// card is a link that opens the PDF in a new browser tab — where the
// reader can scroll it or use the browser's own save — so there is no
// forced/native download here.
//
// Self-contained and aesthetic-matched (dark overlay, chartreuse accent,
// mono labels). Reusable anywhere a PDF needs a preview — projects today,
// the résumé later. See `PdfDoc` in lib/content.ts for the data shape.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PdfDoc } from "@/lib/content";

// Every PDF card shares one shape regardless of the source page size, so a
// row of documents reads as a uniform set. 16:9 landscape (the thesis-
// defense deck) is the standard; taller pages (e.g. A4 portrait) are
// cropped to their top edge via `object-top` below.
const CARD_ASPECT = "16 / 9";
// Render width (CSS px × this) for a crisp thumbnail on HiDPI screens.
const RENDER_WIDTH = 560;

type State =
  | { kind: "loading" }
  | { kind: "ready"; src: string }
  | { kind: "error" };

export default function PdfCard({ doc, index = 0 }: { doc: PdfDoc; index?: number }) {
  // If a manual thumbnail is supplied, skip rendering entirely.
  const [state, setState] = useState<State>(
    doc.thumbnail ? { kind: "ready", src: doc.thumbnail } : { kind: "loading" }
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (doc.thumbnail) return; // override provided — nothing to render
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Bundled ESM worker — webpack/turbopack emits this asset and
        // rewrites the URL, so it works in the static export too.
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const task = pdfjs.getDocument(doc.file);
        cleanup = () => task.destroy();
        const pdf = await task.promise;
        const page = await pdf.getPage(1);

        const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (RENDER_WIDTH / base.width) * dpr });

        const canvas = canvasRef.current ?? document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
        setState({ kind: "ready", src: canvas.toDataURL("image/png") });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [doc.file, doc.thumbnail]);

  return (
    <motion.a
      href={doc.file}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
      className="group block w-[150px] sm:w-[170px] shrink-0"
      aria-label={`Open ${doc.label} (PDF) in a new tab`}
    >
      {/* Page preview */}
      <div
        className="relative overflow-hidden rounded-sm border border-white/12 bg-white/[0.03] transition-all duration-300 group-hover:border-[var(--accent)]/70 group-hover:-translate-y-1"
        style={{
          aspectRatio: CARD_ASPECT,
          boxShadow: "0 14px 40px -18px rgba(0,0,0,0.8)",
        }}
      >
        {state.kind === "ready" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.src}
            alt={`${doc.label} — first page`}
            className="absolute inset-0 h-full w-full object-cover object-top"
            draggable={false}
          />
        )}

        {state.kind === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
            <span className="mono-label text-white/35 text-[0.6rem] animate-pulse">rendering…</span>
          </div>
        )}

        {state.kind === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-white/[0.06] to-transparent">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.4" className="text-white/40">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span className="mono-label text-white/35 text-[0.55rem]">PDF</span>
          </div>
        )}

        {/* Hover scrim + open affordance */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="mono-label mb-3 flex items-center gap-1 text-[0.6rem] text-[var(--accent)]">
            open
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </div>

        {/* Persistent corner tag */}
        <span className="mono-label absolute right-1.5 top-1.5 rounded-sm bg-black/55 px-1.5 py-0.5 text-[0.5rem] text-white/70 backdrop-blur-sm">
          pdf
        </span>
      </div>

      {/* Caption */}
      <p className="mt-2.5 text-sm leading-snug text-white/75 transition-colors group-hover:text-white">
        {doc.label}
      </p>
    </motion.a>
  );
}
