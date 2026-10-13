"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { ticketSchema, toFieldErrors } from "@/lib/validation";
import { generateReference, REFERENCE_PATTERN } from "@/lib/reference";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import {
  ADMIN_COOKIE,
  adminSessionValue,
  isAdminAuthed,
  isValidAccessCode,
  SESSION_MAX_AGE,
} from "@/lib/admin";
import { TICKET_STATUSES, type TicketStatus } from "@/lib/status";

const TEN_MIN = 10 * 60 * 1000;

export type SubmitState = {
  ok: boolean;
  reference?: string;
  formError?: string;
  errors?: Record<string, string>;
};

export async function submitTicket(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const headerList = await headers();
  const ip = clientKey(headerList.get("x-forwarded-for"));

  // Honeypot — pretend success to bots, store nothing.
  if ((formData.get("website")?.toString() ?? "") !== "") {
    return { ok: true, reference: generateReference() };
  }

  if (!rateLimit(`submit:${ip}`, 6, TEN_MIN)) {
    return {
      ok: false,
      formError: "You've submitted a few times already. Please wait some minutes and try again.",
    };
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString().trim() ?? "",
    accountId: formData.get("accountId")?.toString().trim() ?? "",
    type: formData.get("type")?.toString() ?? "complaint",
    category: formData.get("category")?.toString() ?? "",
    subject: formData.get("subject")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    preferredContact: formData.get("preferredContact")?.toString() ?? "email",
    consent: formData.get("consent")?.toString() ?? "",
  };

  const parsed = ticketSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  const data = parsed.data;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference();
    try {
      await db.insert(tickets).values({
        reference,
        name: data.name,
        email: data.email,
        phone: data.phone,
        accountId: data.accountId,
        type: data.type,
        category: data.category,
        subject: data.subject,
        message: data.message,
        preferredContact: data.preferredContact,
      });
      return { ok: true, reference };
    } catch (err) {
      if ((err as { code?: string } | null)?.code === "23505") {
        lastError = err;
        continue; // reference collision — retry with a new one
      }
      lastError = err;
      break;
    }
  }

  console.error("Failed to save ticket", lastError);
  return {
    ok: false,
    formError: "We couldn't save your request right now. Please try again in a moment.",
  };
}

export type TrackState = {
  ok: boolean;
  error?: string;
  ticket?: {
    reference: string;
    name: string;
    subject: string;
    category: string;
    type: string;
    status: TicketStatus;
    createdAt: string;
    publicReply: string | null;
    repliedAt: string | null;
  };
};

export async function trackTicket(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const headerList = await headers();
  const ip = clientKey(headerList.get("x-forwarded-for"));

  if (!rateLimit(`track:${ip}`, 12, TEN_MIN)) {
    return { ok: false, error: "Too many checks — please wait a few minutes and try again." };
  }

  const reference = (formData.get("reference")?.toString() ?? "").trim().toUpperCase();
  const email = (formData.get("email")?.toString() ?? "").trim().toLowerCase();

  if (!reference || !email) {
    return { ok: false, error: "Enter your tracking ID and the email you used on the form." };
  }
  if (!REFERENCE_PATTERN.test(reference)) {
    return { ok: false, error: "That tracking ID doesn't look right — it should look like 1XB-2F8K-DM4Z." };
  }

  const [row] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.reference, reference), eq(tickets.email, email)))
    .limit(1);

  if (!row) {
    return { ok: false, error: "We couldn't find a request matching those details." };
  }

  return {
    ok: true,
    ticket: {
      reference: row.reference,
      name: row.name,
      subject: row.subject,
      category: row.category,
      type: row.type,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      publicReply: row.publicReply,
      repliedAt: row.repliedAt ? row.repliedAt.toISOString() : null,
    },
  };
}

export type AdminLoginState = { ok: boolean; error?: string };

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const headerList = await headers();
  const ip = clientKey(headerList.get("x-forwarded-for"));

  if (!rateLimit(`login:${ip}`, 10, TEN_MIN)) {
    return { ok: false, error: "Too many attempts — please wait a few minutes." };
  }

  const code = formData.get("code")?.toString() ?? "";
  if (!isValidAccessCode(code)) {
    return { ok: false, error: "Incorrect access code." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, adminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminSignOut(): Promise<{ ok: boolean }> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) {
    return { ok: false, error: "Session expired — refresh and sign in again." };
  }
  if (!TICKET_STATUSES.includes(status)) {
    return { ok: false, error: "Unknown status." };
  }
  await db.update(tickets).set({ status, updatedAt: new Date() }).where(eq(tickets.id, id));
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveTicketUpdate(
  id: string,
  publicReply: string,
  adminNote: string,
): Promise<{ ok: boolean; error?: string; updatedAt?: string }> {
  if (!(await isAdminAuthed())) {
    return { ok: false, error: "Session expired — refresh and sign in again." };
  }
  const reply = publicReply.trim().slice(0, 4000);
  const note = adminNote.trim().slice(0, 4000);
  const now = new Date();
  await db
    .update(tickets)
    .set({
      publicReply: reply || null,
      adminNote: note || null,
      repliedAt: reply ? now : null,
      updatedAt: now,
    })
    .where(eq(tickets.id, id));
  revalidatePath("/admin");
  return { ok: true, updatedAt: now.toISOString() };
}
