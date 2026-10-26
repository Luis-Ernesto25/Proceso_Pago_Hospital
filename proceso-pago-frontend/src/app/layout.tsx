import type { Metadata } from "next";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";

import LanguageSelector from '@/components/SelectorIdioma';

export const metadata: Metadata = {
  title: "My app",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="es" content="notranslate">
    <body className="bg-gray-300">
      <main>
        {children} 
      </main>
    </body>
  </html>
);
}