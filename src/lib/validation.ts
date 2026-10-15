import { z } from "zod";

export const TICKET_TYPES = ["complaint", "enquiry"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_CATEGORIES = [
  "deposits-payments",
  "withdrawals",
  "account-access",
  "bet-settlement",
  "bonuses-promotions",
  "verification-kyc",
  "technical-issue",
  "responsible-gambling",
  "general-enquiry",
  "other",
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  "deposits-payments": "Deposits & payments",
  withdrawals: "Withdrawals & payouts",
  "account-access": "Account access & login",
  "bet-settlement": "Bet settlement",
  "bonuses-promotions": "Bonuses & promotions",
  "verification-kyc": "Verification (KYC)",
  "technical-issue": "Technical issue",
  "responsible-gambling": "Responsible gambling",
  "general-enquiry": "General enquiry",
  other: "Other",
};

export const CONTACT_METHODS = ["email", "phone-call", "sms", "whatsapp"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_LABELS: Record<ContactMethod, string> = {
  email: "Email",
  "phone-call": "Phone call",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export const ticketSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(90, "That name looks too long — please shorten it."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address so we can reach you.")
    .max(140, "Email address is too long."),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^\+?[0-9][0-9\s().-]{6,19}$/, "Enter a valid phone number, e.g. +234 801 234 5678."),
    ])
    .default(""),
  accountId: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(
          /^\d{6,16}$/,
          "Your account ID is the 6–16 digit number in your 1xBet profile — never your password.",
        ),
    ])
    .default(""),
  type: z.enum(TICKET_TYPES),
  category: z.enum(TICKET_CATEGORIES),
  subject: z
    .string()
    .trim()
    .min(5, "Give your request a short title (at least 5 characters).")
    .max(130, "Keep the title under 130 characters."),
  message: z
    .string()
    .trim()
    .min(20, "Give us a little more detail so we can help faster (at least 20 characters).")
    .max(2000, "Please keep your message under 2,000 characters."),
  preferredContact: z.enum(CONTACT_METHODS),
  consent: z
    .string()
    .refine((v) => v === "on", "Please accept the privacy notice so we are allowed to contact you."),
  ageConfirmation: z
    .string()
    .refine((v) => v === "on", "Please confirm that you are 18 or older."),
});

export type TicketInput = z.infer<typeof ticketSchema>;

/** Map a ZodError into friendly per-field messages (client-safe). */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (map[key]) continue;
    if (issue.code === "invalid_value" || issue.code === "invalid_type") {
      map[key] =
        key === "consent"
          ? "Please accept the privacy notice so we are allowed to contact you."
          : key === "ageConfirmation"
            ? "Please confirm that you are 18 or older."
          : "Please choose an option.";
    } else {
      map[key] = issue.message;
    }
  }
  return map;
}
