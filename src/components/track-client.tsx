"use client";

import { Fragment, useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  MessageSquareText,
  Search,
  Ticket,
} from "lucide-react";
import { trackTicket, type TrackState } from "@/app/actions";
import { CATEGORY_LABELS, type TicketCategory } from "@/lib/validation";
import {
  formatDateTime,
  stageIndex,
  STATUS_LABELS,
  STATUS_TONES,
  TRACK_STEPS,
  type TicketStatus,
} from "@/lib/status";

const initial: TrackState = { ok: false };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function TrackClient() {
  const [state, formAction, pending] = useActionState(trackTicket, initial);
  const ticket = state.ok ? state.ticket : null;

  return (
    <div>
      <form
        action={formAction}
        noValidate
        className="glass top-sheen rounded-3xl p-6 sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reference" className="label">
              <span>
                Tracking ID <span className="text-brand-400">*</span>
              </span>
            </label>
            <div className="relative">
              <Ticket className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reference"
                name="reference"
                type="text"
                placeholder="1XB-2F8K-DM4Z"
                autoComplete="off"
                spellCheck={false}
                required
                className="input pl-10 font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="label">
              <span>
                Email on the request <span className="text-brand-400">*</span>
              </span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {state.error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-400/[0.07] px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <p className="text-sm text-rose-200">{state.error}</p>
          </div>
        )}

        <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Check status
            </>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
          Lost your tracking ID? It was shown on screen right after you submitted. If it&apos;s
          gone, submit a new enquiry and mention your previous issue.
        </p>
      </form>

      <AnimatePresence mode="wait">
        {ticket && (
          <motion.div
            key={ticket.reference}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="glass top-sheen mt-6 rounded-3xl p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Tracking ID
                </p>
                <p className="font-mono text-lg font-semibold tracking-wider text-white">
                  {ticket.reference}
                </p>
              </div>
              <span className={`chip ${STATUS_TONES[ticket.status].pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_TONES[ticket.status].dot}`} />
                {STATUS_LABELS[ticket.status]}
              </span>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:grid-cols-2">
              <Meta label="Subject" value={ticket.subject} className="sm:col-span-2" />
              <Meta
                label="Type"
                value={ticket.type === "complaint" ? "Complaint" : "Enquiry"}
              />
              <Meta
                label="Category"
                value={CATEGORY_LABELS[ticket.category as TicketCategory] ?? ticket.category}
              />
              <Meta label="Submitted" value={formatDateTime(ticket.createdAt)} />
              <Meta label="Logged for" value={ticket.name.split(" ")[0]} />
            </div>

            <Timeline status={ticket.status} />

            {ticket.status === "awaiting_customer" && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-400/25 bg-orange-400/[0.07] px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                <p className="text-sm leading-relaxed text-orange-200">
                  Our team may need a little more information from you — please read the response
                  below.
                </p>
              </div>
            )}

            {ticket.publicReply && (
              <div className="mt-6 rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-5">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-brand-300" />
                  <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">
                    Response from support
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                  {ticket.publicReply}
                </p>
                {ticket.repliedAt && (
                  <p className="mt-3 text-[11px] text-slate-500">
                    Sent {formatDateTime(ticket.repliedAt)}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Meta({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function Timeline({ status }: { status: TicketStatus }) {
  const idx = stageIndex(status);
  const done = status === "resolved" || status === "closed";

  return (
    <div className="mt-8">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Progress</p>
      <div className="mt-4 flex items-start">
        {TRACK_STEPS.map((label, i) => {
          const reached = i < idx || (done && i === idx);
          const current = i === idx;
          return (
            <Fragment key={label}>
              {i > 0 && (
                <div
                  className={`mt-4 h-0.5 flex-1 rounded-full transition ${
                    i <= idx ? "bg-brand-400/70" : "bg-white/10"
                  }`}
                />
              )}
              <div className="flex w-12 flex-col items-center gap-2 px-1 sm:w-16">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold transition ${
                    reached
                      ? "border-brand-400/50 bg-brand-500/20 text-brand-200"
                      : current
                        ? "border-brand-300 bg-brand-500 text-white shadow-[0_0_24px_rgba(46,139,255,0.5)]"
                        : "border-white/10 bg-white/[0.03] text-slate-600"
                  }`}
                >
                  {reached ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`hidden text-center text-[10px] leading-tight sm:block ${
                    i <= idx ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Currently: <span className="font-medium text-slate-300">{TRACK_STEPS[idx]}</span>
      </p>
    </div>
  );
}
