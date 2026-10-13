"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Hash,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MessageSquareText,
  Phone,
  Save,
  Search,
  StickyNote,
  User,
  X,
} from "lucide-react";
import { adminSignOut, saveTicketUpdate, updateTicketStatus } from "@/app/actions";
import { CATEGORY_LABELS, CONTACT_LABELS, type ContactMethod, type TicketCategory } from "@/lib/validation";
import {
  formatDateShort,
  formatDateTime,
  isOpenStatus,
  STATUS_LABELS,
  STATUS_TONES,
  TICKET_STATUSES,
  type TicketStatus,
} from "@/lib/status";

export interface AdminTicket {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  accountId: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  preferredContact: string;
  status: TicketStatus;
  publicReply: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  repliedAt: string | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AdminDashboard({ initialTickets }: { initialTickets: AdminTicket[] }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "complaint" | "enquiry">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signingOut, startSignOut] = useTransition();

  const patchTicket = (id: string, patch: Partial<AdminTicket>) =>
    setTickets((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const stats = useMemo(() => {
    const open = tickets.filter((t) => isOpenStatus(t.status)).length;
    return {
      total: tickets.length,
      open,
      awaiting: tickets.filter((t) => t.status === "awaiting_customer").length,
      resolved: tickets.length - open,
    };
  }, [tickets]);

  const countsByStatus = useMemo(() => {
    const map = new Map<TicketStatus, number>();
    for (const t of tickets) map.set(t.status, (map.get(t.status) ?? 0) + 1);
    return map;
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (!q) return true;
      return [t.reference, t.name, t.email, t.subject, t.accountId]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tickets, query, statusFilter, typeFilter]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Support Console
            </h1>
            <span className="chip border border-brand-400/25 bg-brand-500/10 text-brand-200">
              Sample build
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            1xBet Nigeria · complaints &amp; enquiries — internal review workspace
          </p>
        </div>
        <button
          type="button"
          disabled={signingOut}
          onClick={() =>
            startSignOut(async () => {
              await adminSignOut();
              router.refresh();
            })
          }
          className="btn-ghost"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out
        </button>
      </header>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Inbox} label="All requests" value={stats.total} tone="text-brand-300" />
        <StatCard icon={Clock} label="Open" value={stats.open} tone="text-amber-300" />
        <StatCard
          icon={MessageSquareText}
          label="Awaiting customer"
          value={stats.awaiting}
          tone="text-orange-300"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved & closed"
          value={stats.resolved}
          tone="text-emerald-300"
        />
      </div>

      {/* filters */}
      <div className="glass mt-6 rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, name, email or subject…"
              className="input !py-2.5 pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                ["all", "All"],
                ["complaint", "Complaints"],
                ["enquiry", "Enquiries"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  typeFilter === value
                    ? "border-brand-400/50 bg-brand-500/15 text-brand-200"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="scroll-slim mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            active={statusFilter === "all"}
            label={`All (${tickets.length})`}
            onClick={() => setStatusFilter("all")}
          />
          {TICKET_STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              label={`${STATUS_LABELS[s]} (${countsByStatus.get(s) ?? 0})`}
              dot={STATUS_TONES[s].dot}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
      </div>

      {/* list */}
      <div className="glass top-sheen mt-6 overflow-hidden rounded-3xl">
        <div className="scroll-slim max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-ink-850/95 backdrop-blur">
              <tr className="text-[10px] tracking-[0.16em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-semibold">Reference</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Request</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Received</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="cursor-pointer border-t border-white/[0.05] transition hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold tracking-wider text-brand-300">
                      {t.reference}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{t.email}</p>
                  </td>
                  <td className="max-w-[16rem] px-5 py-4">
                    <p className="truncate text-slate-200">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t.type === "complaint" ? "Complaint" : "Enquiry"} ·{" "}
                      {CATEGORY_LABELS[t.category as TicketCategory] ?? t.category}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`chip ${STATUS_TONES[t.status].pill}`}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${STATUS_TONES[t.status].dot}`}
                      />
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs whitespace-nowrap text-slate-400">
                    {formatDateShort(t.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <Inbox className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">
                {tickets.length === 0
                  ? "No requests yet — submissions from the public form will appear here."
                  : "Nothing matches those filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-600">
        Tip: public responses you save here are shown to the customer on the{" "}
        <Link href="/track" className="text-brand-400 underline-offset-2 hover:underline">
          tracking page
        </Link>{" "}
        — keep internal notes strictly internal.
      </p>

      <AnimatePresence>
        {selected && (
          <TicketDrawer
            key={selected.id}
            ticket={selected}
            onClose={() => setSelectedId(null)}
            onPatch={patchTicket}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone}`} />
        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
          {label}
        </p>
      </div>
      <p className="font-display mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  label,
  dot,
  onClick,
}: {
  active: boolean;
  label: string;
  dot?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
        active
          ? "border-brand-400/50 bg-brand-500/15 text-brand-200"
          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
    </button>
  );
}

function TicketDrawer({
  ticket,
  onClose,
  onPatch,
}: {
  ticket: AdminTicket;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<AdminTicket>) => void;
}) {
  const [reply, setReply] = useState(ticket.publicReply ?? "");
  const [note, setNote] = useState(ticket.adminNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const changeStatus = (status: TicketStatus) => {
    setError(null);
    start(async () => {
      const res = await updateTicketStatus(ticket.id, status);
      if (res.ok) onPatch(ticket.id, { status });
      else setError(res.error ?? "Couldn't update the status.");
    });
  };

  const saveText = () => {
    setError(null);
    setSavedAt(null);
    start(async () => {
      const res = await saveTicketUpdate(ticket.id, reply, note);
      if (res.ok) {
        const trimmed = reply.trim();
        onPatch(ticket.id, {
          publicReply: trimmed || null,
          adminNote: note.trim() || null,
          repliedAt: trimmed ? (res.updatedAt ?? new Date().toISOString()) : null,
          updatedAt: res.updatedAt ?? new Date().toISOString(),
        });
        setSavedAt(new Date().toISOString());
      } else {
        setError(res.error ?? "Couldn't save.");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close case"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-950/70 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="scroll-slim absolute top-0 right-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-ink-900 p-6 sm:p-8"
      >
        {/* drawer header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Case
            </p>
            <p className="font-mono text-xl font-semibold tracking-wider text-white">
              {ticket.reference}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Received {formatDateTime(ticket.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`chip ${STATUS_TONES[ticket.status].pill}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_TONES[ticket.status].dot}`} />
              {STATUS_LABELS[ticket.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* status control */}
        <div className="mt-7">
          <DrawerLabel>Set status</DrawerLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TICKET_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => changeStatus(s)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                  ticket.status === s
                    ? "border-brand-400/50 bg-brand-500/15 text-brand-200"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {ticket.status === s && <Check className="h-3.5 w-3.5" />}
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* customer */}
        <div className="mt-7">
          <DrawerLabel>Customer</DrawerLabel>
          <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <InfoRow icon={User} label="Name" value={ticket.name} />
            <InfoRow
              icon={Mail}
              label="Email"
              value={ticket.email}
              href={`mailto:${ticket.email}`}
            />
            {ticket.phone && (
              <InfoRow icon={Phone} label="Phone" value={ticket.phone} href={`tel:${ticket.phone}`} />
            )}
            {ticket.accountId && (
              <InfoRow icon={Hash} label="Account ID" value={ticket.accountId} mono />
            )}
            <div className="pt-1">
              <span className="chip border border-white/10 bg-white/[0.04] text-slate-300">
                Prefers {CONTACT_LABELS[ticket.preferredContact as ContactMethod] ?? ticket.preferredContact}
              </span>
            </div>
          </div>
        </div>

        {/* request */}
        <div className="mt-7">
          <DrawerLabel>Request</DrawerLabel>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex flex-wrap gap-2">
              <span className="chip border border-white/10 bg-white/[0.04] text-slate-300">
                {ticket.type === "complaint" ? "Complaint" : "Enquiry"}
              </span>
              <span className="chip border border-brand-400/25 bg-brand-500/10 text-brand-200">
                {CATEGORY_LABELS[ticket.category as TicketCategory] ?? ticket.category}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{ticket.subject}</p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {ticket.message}
            </p>
          </div>
        </div>

        {/* public response */}
        <div className="mt-7">
          <DrawerLabel>Public response — visible to the customer</DrawerLabel>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="Write the reply the customer will see on the tracking page…"
            className="input scroll-slim resize-y"
          />
        </div>

        {/* internal note */}
        <div className="mt-5">
          <DrawerLabel>
            <span className="inline-flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" /> Internal note — team only
            </span>
          </DrawerLabel>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="Private context for the team (never shown to the customer)…"
            className="input scroll-slim resize-y"
          />
        </div>

        {error && (
          <p className="field-error mt-4">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={saveText}
            className="btn-primary flex-1 !py-3"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save response &amp; note
              </>
            )}
          </button>
        </div>
        {savedAt && !error && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" /> Saved {formatDateShort(savedAt)}
          </p>
        )}
      </motion.aside>
    </motion.div>
  );
}

function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
      {children}
    </p>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  mono,
}: {
  icon: typeof User;
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const inner = (
    <span className={`text-sm text-slate-200 ${mono ? "font-mono" : ""} ${href ? "text-brand-300 hover:underline" : ""}`}>
      {value}
    </span>
  );
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <span className="w-20 shrink-0 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
        {label}
      </span>
      {href ? (
        <a href={href} className="truncate">
          {inner}
        </a>
      ) : (
        <span className="truncate">{inner}</span>
      )}
    </div>
  );
}
