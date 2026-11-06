import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIQAP — Platform Kuis Realtime Interaktif",
  description:
    "Platform kuis interaktif multiplayer realtime. Host kuis kelas, pameran, atau event dengan kapasitas 100-300 pemain gratis, AI quiz generator, dan scoring otomatis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
