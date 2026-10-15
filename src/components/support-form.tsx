"use client";

import {
  cloneElement,
  useActionState,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Hash,
  Headset,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { submitTicket, type SubmitState } from "@/app/actions";
import {
  CATEGORY_LABELS,
  CONTACT_LABELS,
  CONTACT_METHODS,
  TICKET_CATEGORIES,
} from "@/lib/validation";

const initial: SubmitState = { ok: false };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function SupportForm() {
  const [reference, setReference] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <AnimatePresence mode="wait">
      {reference ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <SuccessPanel
            reference={reference}
            onAnother={() => {
              setReference(null);
              setFormKey((k) => k + 1);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key={`form-${formKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <FormCore onSuccess={setReference} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormCore({ onSuccess }: { onSuccess: (reference: string) => void }) {
  const [state, formAction, pending] = useActionState(submitTicket, initial);
  const fired = useRef(false);

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    accountId: "",
    subject: "",
    message: "",
  });
  const [type, setType] = useState<"complaint" | "enquiry">("complaint");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("email");
  const [consent, setConsent] = useState(false);

  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));

  useEffect(() => {
    if (state.ok && state.reference && !fired.current) {
      fired.current = true;
      onSuccess(state.reference);
    }
  }, [state, onSuccess]);

  const err = state.errors ?? {};

  return (
    <form
      action={formAction}
      noValidate
      className="support-panel top-sheen relative overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Submit a complaint or enquiry
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Takes about two minutes. Fields marked * are required.
          </p>
        </div>
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-400/25 bg-brand-500/10 sm:flex">
          <Headset className="h-5 w-5 text-brand-300" />
        </div>
      </div>

      {/* honeypot — hidden from humans */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-9">
        <Section index="01" title="Tell us who you are" subtitle="So we can locate your account and contact you">
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell label="Full name" htmlFor="name" error={err.name}>
              <IconInput icon={User}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Adaeze Okonkwo"
                  required
                  className={`input ${err.name ? "input-error" : ""}`}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </IconInput>
            </FieldShell>
            <FieldShell label="Email address" htmlFor="email" error={err.email}>
              <IconInput icon={Mail}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className={`input ${err.email ? "input-error" : ""}`}
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </IconInput>
            </FieldShell>
            <FieldShell label="Phone number" htmlFor="phone" error={err.phone}>
              <IconInput icon={Phone}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+234 801 234 5678"
                  className={`input ${err.phone ? "input-error" : ""}`}
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </IconInput>
            </FieldShell>
            <FieldShell
              label="1xBet account ID"
              htmlFor="accountId"
              error={err.accountId}
              hint="Numbers only — find it in your profile. Never your password."
            >
              <IconInput icon={Hash}>
                <input
                  id="accountId"
                  name="accountId"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 254667891"
                  className={`input ${err.accountId ? "input-error" : ""}`}
                  value={values.accountId}
                  onChange={(e) => set("accountId", e.target.value)}
                />
              </IconInput>
            </FieldShell>
          </div>
        </Section>

        <Section index="02" title="What happened?" subtitle="The more specific you are, the faster we can fix it">
          <div className="space-y-5">
            <div>
              <span className="label">Request type</span>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Request type">
                <label className={`seg ${type === "complaint" ? "seg-active" : ""}`}>
                  <input
                    type="radio"
                    name="type"
                    value="complaint"
                    checked={type === "complaint"}
                    onChange={() => setType("complaint")}
                  />
                  <AlertTriangle className="h-4 w-4" />
                  <span>I want to make a complaint</span>
                </label>
                <label className={`seg ${type === "enquiry" ? "seg-active" : ""}`}>
                  <input
                    type="radio"
                    name="type"
                    value="enquiry"
                    checked={type === "enquiry"}
                    onChange={() => setType("enquiry")}
                  />
                  <HelpCircle className="h-4 w-4" />
                  <span>I have a question</span>
                </label>
              </div>
            </div>

            <FieldShell label="Category" htmlFor="category" error={err.category}>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  id="category"
                  name="category"
                  required
                  className={`input cursor-pointer pr-10 ${err.category ? "input-error" : ""} ${
                    category ? "" : "text-slate-500"
                  }`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    e.target.classList.remove("text-slate-500");
                  }}
                >
                  <option value="" disabled>
                    Choose the closest match
                  </option>
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
            </FieldShell>

            <FieldShell
              label="Subject"
              htmlFor="subject"
              error={err.subject}
              hint={
                values.subject.length > 0 ? `${values.subject.length}/130` : undefined
              }
            >
              <input
                id="subject"
                name="subject"
                type="text"
                maxLength={130}
                placeholder="e.g. Withdrawal of ₦45,000 pending for 3 days"
                required
                className={`input ${err.subject ? "input-error" : ""}`}
                value={values.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </FieldShell>

            <FieldShell
              label="Describe your complaint or enquiry"
              htmlFor="message"
              error={err.message}
              hint={
                values.message.length > 0
                  ? `${values.message.length}/2,000 — dates, amounts and bet slip numbers help us act faster`
                  : "Dates, amounts and bet slip numbers help us act faster. Never include your password, PIN or OTP."
              }
            >
              <textarea
                id="message"
                name="message"
                rows={6}
                maxLength={2000}
                placeholder="Tell us exactly what happened…"
                required
                className={`input scroll-slim resize-y ${err.message ? "input-error" : ""}`}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </FieldShell>

            <div>
              <span className="label">How should we reach you?</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Preferred contact">
                {CONTACT_METHODS.map((m) => (
                  <label key={m} className={`seg ${contact === m ? "seg-active" : ""}`}>
                    <input
                      type="radio"
                      name="preferredContact"
                      value={m}
                      checked={contact === m}
                      onChange={() => setContact(m)}
                    />
                    <span>{CONTACT_LABELS[m]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section index="03" title="Consent & send">
          <div className="space-y-4">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                err.consent
                  ? "border-rose-400/40 bg-rose-400/[0.04]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                name="consent"
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className="text-xs leading-relaxed text-slate-400">
                I agree that 1xBet Nigeria may store these details and contact me about this
                request, in line with the Nigeria Data Protection Act and the{" "}
                <a
                  href="https://1xbet.ng/en/information/rules/privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
                >
                  Privacy Policy
                </a>
                . I confirm that I am 18 or older.
              </span>
            </label>
            {err.consent && (
              <p className="field-error">
                <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                {err.consent}
              </p>
            )}

            {state.formError && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-400/[0.07] px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                <p className="text-sm text-rose-200">{state.formError}</p>
              </div>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending your request…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to 1xBet support
                </>
              )}
            </button>

            <div className="flex items-start gap-2.5 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-xs leading-relaxed text-emerald-100/70">
                <span className="font-semibold text-emerald-200">Your security comes first.</span>{" "}
                This form and our support team will never ask for your password, PIN, OTP or
                full card details. Anyone who does is not 1xBet.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <a
          href="https://1xbet.ng/en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-800 transition hover:text-sky-600"
        >
          Official 1xBet Nigeria website
        </a>
      </div>
    </form>
  );
}

function SuccessPanel({ reference, onAnother }: { reference: string; onAnother: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the ID is still visible on screen
    }
  };

  return (
    <div className="support-panel top-sheen relative overflow-hidden rounded-3xl p-6 text-center sm:p-10">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 56 56" className="h-20 w-20" aria-hidden>
          <defs>
            <linearGradient id="okgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#2e8bff" />
            </linearGradient>
          </defs>
          <circle
            className="draw-circle"
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="url(#okgrad)"
            strokeWidth="2.5"
          />
          <path
            className="draw-check"
            d="M17 29.5l7.5 7.5L39.5 22"
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h2 className="font-display mt-5 text-3xl font-bold text-white">We&apos;ve got it.</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
          Your request has been logged and queued for the 1xBet Nigeria support team. Save your
          tracking ID you&apos;ll need it, with your email, to check progress.
        </p>

        <div className="mt-7 flex w-full max-w-sm flex-col items-stretch gap-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-400/25 bg-brand-500/[0.08] px-5 py-4">
            <div className="text-left">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
                Tracking ID
              </p>
              <p className="font-mono text-xl font-semibold tracking-wider text-white sm:text-2xl">
                {reference}
              </p>
            </div>
            <button
              type="button"
              onClick={copy}
              className="btn-ghost !px-3 !py-2"
              aria-label="Copy tracking ID"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Screenshot or write this ID down somewhere safe.
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Link href="/track" className="btn-primary flex-1 !py-3 text-sm">
            <MessageSquareText className="h-4 w-4" />
            Track this request
          </Link>
          <button type="button" onClick={onAnother} className="btn-ghost flex-1 !py-3 text-sm">
            Submit another
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-medium text-brand-400">{index}</span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      </div>
      {children}
    </section>
  );
}

function FieldShell({
  label,
  htmlFor,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        <span>
          {label} {!optional && <span className="text-brand-400">*</span>}
        </span>
        {optional && (
          <span className="text-[10px] font-medium normal-case tracking-normal text-slate-600">
            Optional
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="field-error">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function IconInput({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: ReactElement<{ style?: CSSProperties }>;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
      {cloneElement(children, {
        style: { ...children.props.style, paddingInlineStart: "2.75rem" },
      })}
    </div>
  );
}
