import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const ticketTypeEnum = pgEnum("ticket_type", ["complaint", "enquiry"]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "new",
  "in_review",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "closed",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 24 }).notNull().unique(),
    name: varchar("name", { length: 90 }).notNull(),
    email: varchar("email", { length: 140 }).notNull(),
    phone: varchar("phone", { length: 24 }).notNull().default(""),
    accountId: varchar("account_id", { length: 24 }).notNull().default(""),
    type: ticketTypeEnum("type").notNull(),
    category: varchar("category", { length: 48 }).notNull(),
    subject: varchar("subject", { length: 140 }).notNull(),
    message: text("message").notNull(),
    preferredContact: varchar("preferred_contact", { length: 16 }).notNull().default("email"),
    status: ticketStatusEnum("status").notNull().default("new"),
    publicReply: text("public_reply"),
    adminNote: text("admin_note"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tickets_status_idx").on(t.status),
    index("tickets_created_idx").on(t.createdAt),
    index("tickets_email_idx").on(t.email),
  ],
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
