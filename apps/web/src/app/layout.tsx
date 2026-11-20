import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font: no render-blocking request to fonts.googleapis.com
// and no layout shift (DESIGN.md §Font).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIQAP • Sistem Informasi Akademik Pelajar",
  description:
    "Platform kuis interaktif multiplayer realtime. Host kuis kelas, pameran, atau event dengan kapasitas 100-300 pemain gratis, AI quiz generator, dan scoring otomatis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${montserrat.variable}`}
    >
      <body className="bg-siqap-sand text-siqap-navy-dark min-h-screen antialiased selection:bg-siqap-orange selection:text-siqap-navy">
        {children}
      </body>
    </html>
  );
}
