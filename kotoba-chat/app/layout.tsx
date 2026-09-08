import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ojiisan Chat — Japonês em blocos",
  description: "Monte frases com o Método 100 Blocos. Verbos, palavras e partículas por função, explicações das mensagens e conversas em japonês.",
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
