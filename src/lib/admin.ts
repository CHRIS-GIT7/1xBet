import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "xb_support_session";
const FALLBACK_DEMO_CODE = "Demo-2026";

/** Effective access code — env-driven in production, visible demo fallback otherwise. */
function effectiveCode(): string {
  return process.env.ADMIN_ACCESS_CODE || FALLBACK_DEMO_CODE;
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || "xb-dev-only-secret";
}

function sessionToken(): string {
  return createHmac("sha256", `xb-support:${secret()}`).update(effectiveCode()).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isValidAccessCode(code: string): boolean {
  return safeEqual(code.trim(), effectiveCode());
}

export function adminSessionValue(): string {
  return sessionToken();
}

export function isDemoAdminAccess(): boolean {
  return !process.env.ADMIN_ACCESS_CODE;
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}

export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
