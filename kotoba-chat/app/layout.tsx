import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ojiisan Chat — Japonês em cenas",
  description: "Converse em japonês com imagens na ordem da frase, cenas animadas e 300 palavras com flexões.",
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
