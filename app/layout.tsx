import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ritvik Maini",
  description: "Portfolio",
  authors: [{ name: "Ritvik Maini" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
