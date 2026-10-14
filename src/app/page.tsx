import Image from "next/image";
import { BellRing, Fingerprint, FileSearch, PenLine, ShieldCheck } from "lucide-react";
import SupportForm from "@/components/support-form";

const STEPS = [
  {
    icon: PenLine,
    title: "Tell us what happened",
    text: "A short, structured form about two minutes of your time.",
  },
  {
    icon: FileSearch,
    title: "We log and assign your case",
    text: "You get a unique tracking ID on the spot, and an agent picks it up.",
  },
  {
    icon: BellRing,
    title: "Track progress anytime",
    text: "Check updates with your tracking ID no chasing through DMs.",
  },
];

const ASSURANCES = ["Instant tracking ID", "Every case reviewed by an agent", "Handled under the NDPA"];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-6 py-10 lg:gap-8 lg:py-16">
        {/* Brand column */}
        <section
          className="brand-glass top-sheen relative overflow-hidden rounded-3xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(30, 57, 83, 0.88), rgba(16, 36, 59, 0.84))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="relative flex h-full flex-col gap-10 p-7 sm:p-10">
            <div>
              {/* <span className="chip border border-white/10 bg-white/[0.06] text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>               
              </span> */}

              <span className="brand-badge text-sm">1xBET</span>

              <h1 className="font-display mt-6 text-4xl leading-[1.04] font-extrabold tracking-tight text-white sm:text-5xl xl:text-[3rem]">
                Get help. Get answers.{" "} Get back in the game.
                
              </h1>

              <p className="mt-5 text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                This is the safest way to
                reach 1xBet Nigeria support. Follow it through to resolution, no sensitive details in DMs.
              </p>
            </div>

            <ol className="space-y-4">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-500/10">
                    <step.icon className="h-4.5 w-4.5 text-brand-300" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-white">
                      <span className="font-mono mr-2 text-xs text-brand-400">
                        0{i + 1}
                      </span>
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-auto space-y-5">
              <div className="flex items-start gap-3 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-xs leading-relaxed text-emerald-100/75">
                   We will never ask for your account password, PIN, OTP or full card details here, on
                  Instagram, or anywhere else.
                </p>
              </div>
              {/* <div className="flex flex-wrap gap-2">
                {ASSURANCES.map((a) => (
                  <span key={a} className="chip border border-white/10 bg-white/[0.05] text-slate-300">
                    <Fingerprint className="h-3 w-3 text-brand-400" />
                    {a}
                  </span>
                ))}
              </div> */}
            </div>
          </div>
        </section>

        {/* Form column */}
        <section>
          <SupportForm />
        </section>
      </div>
    </div>
  );
}
