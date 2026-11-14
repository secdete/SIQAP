import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body className="bg-siqap-sand text-siqap-dark min-h-screen antialiased selection:bg-siqap-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}
