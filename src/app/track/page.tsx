import type { Metadata } from "next";
import TrackClient from "@/components/track-client";

export const metadata: Metadata = {
  title: "Track your request — 1xBet Nigeria Support",
  description: "Check the status of your complaint or enquiry with your tracking ID and email.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <span className="chip mx-auto border border-white/10 bg-white/[0.06] text-slate-300">
          Request status
        </span>
        <h1 className="font-display mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Track your <span className="text-gradient">request</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
          Enter the tracking ID you received after submitting, plus the email address you used on
          the form.
        </p>
      </header>

      <div className="mt-10">
        <TrackClient />
      </div>
    </div>
  );
}
