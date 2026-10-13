import Image from "next/image";
import Link from "next/link";
import { Headset } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/1xbet-logo.png"
            alt="1xBet Nigeria"
            width={120}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-300 sm:inline-flex">
            NIGERIA
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-400/40 hover:text-white"
          >
            <Headset className="h-4 w-4 text-brand-400" />
            <span className="hidden sm:inline">Submit a request</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
