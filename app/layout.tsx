import type { Metadata, Viewport } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ── Type system ───────────────────────────────────────────────────
// Display: heavy editorial grotesque for the name + arc headlines.
// Body:    a calmer grotesque for reading copy in the overlays.
// Mono:    technical accent for metadata (dates, locations, tags, menus)
//          — reinforces the "engineer" identity. Each exposes a CSS var
//          consumed by the Tailwind v4 @theme mapping in globals.css.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ritvik Maini",
  description:
    "AI Engineer studying AI & ML at TU Darmstadt. Forecasting, machine learning, and data systems.",
  authors: [{ name: "Ritvik Maini" }],
  openGraph: {
    title: "Ritvik Maini — AI Engineer",
    description:
      "AI Engineer studying AI & ML at TU Darmstadt. Forecasting, machine learning, and data systems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4801FF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${hanken.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
