export const TICKET_STATUSES = [
  "new",
  "in_review",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "New",
  in_review: "In review",
  in_progress: "In progress",
  awaiting_customer: "Awaiting customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_TONES: Record<TicketStatus, { dot: string; pill: string }> = {
  new: { dot: "bg-sky-400", pill: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/25" },
  in_review: { dot: "bg-amber-400", pill: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25" },
  in_progress: { dot: "bg-violet-400", pill: "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/25" },
  awaiting_customer: {
    dot: "bg-orange-400",
    pill: "bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/25",
  },
  resolved: { dot: "bg-emerald-400", pill: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/25" },
  closed: { dot: "bg-slate-400", pill: "bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/25" },
};

export const TRACK_STEPS = ["Submitted", "In review", "In progress", "Resolved"] as const;

/** 0 = submitted, 1 = review, 2 = progress, 3 = resolved */
export function stageIndex(status: TicketStatus): number {
  switch (status) {
    case "new":
      return 0;
    case "in_review":
      return 1;
    case "in_progress":
    case "awaiting_customer":
      return 2;
    case "resolved":
    case "closed":
      return 3;
  }
}

export function isOpenStatus(status: TicketStatus): boolean {
  return status !== "resolved" && status !== "closed";
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}
