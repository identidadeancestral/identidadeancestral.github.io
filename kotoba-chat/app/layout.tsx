import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kotoba — Japonês em imagens",
  description: "Converse com pessoas, descubra o japonês por imagens e aprenda uma palavra de cada vez.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
