import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "MindForge AI — İnteraktif Üniversite Öğrenme Platformu",
  description: "Üniversite derslerini PDF'siz, interaktif yapay zekâ, akıllı simülasyonlar ve vize hazırlığıyla öğrenin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
