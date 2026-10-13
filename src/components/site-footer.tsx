import { ShieldCheck } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-ink-950/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="brand-badge text-xs">1xBET</span>
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">NIGERIA</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Playing can be addictive. Please play responsibly — strictly 18+. Submissions on this
              page are processed in line with the Nigeria Data Protection Act and used only to
              resolve your request.
            </p>
          </div>

          <div className="max-w-sm">
            <div className="glass flex items-start gap-3 rounded-2xl p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-xs leading-relaxed text-slate-400">
                <span className="font-semibold text-slate-200">Sample build for client review.</span>{" "}
                This flow is shared for approval ahead of deployment on the official 1xBet Nigeria
                Instagram page. We will never ask for your password, PIN or OTP.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11px] text-slate-600 sm:flex-row sm:items-center">
          <p>© 2026 1xBet Nigeria. All rights reserved.</p>
          <p>
            Complaints? Track them{" "}
            <a href="/track" className="text-brand-400 underline-offset-2 hover:underline">
              with your tracking ID
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
