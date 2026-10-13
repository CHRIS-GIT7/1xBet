import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-var", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-var", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-var", display: "swap" });

export const metadata: Metadata = {
  title: "1xBet Nigeria — Customer Complaints & Enquiries",
  description:
    "Submit a complaint or enquiry to the 1xBet Nigeria support team, get a tracking ID instantly, and follow your request through to resolution.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-ink-950 font-sans text-slate-200 antialiased">
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-atmosphere" />
          <div className="aurora aurora-a" />
          <div className="aurora aurora-b" />
          <div className="absolute inset-0 noise" />
        </div>
        <div className="relative z-10 flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
