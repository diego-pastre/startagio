import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Mona_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

// Texto: Mona Sans, a fonte de produto que o GitHub criou e liberou (OFL).
const mona = Mona_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Títulos e números grandes: Bricolage Grotesque, grotesca com personalidade e tamanho óptico (opsz).
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Startagio", template: "%s | Startagio" },
  description: "O mural de estágios da faculdade: vagas, prova online e resultado no mesmo lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${mona.variable} ${bricolage.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
