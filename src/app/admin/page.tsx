import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { isAdminAuthed, isDemoAdminAccess } from "@/lib/admin";
import AdminLogin from "@/components/admin-login";
import AdminDashboard, { type AdminTicket } from "@/components/admin-dashboard";
import type { TicketStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support Console — 1xBet Nigeria",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin demo={isDemoAdminAccess()} />;
  }

  const rows = await db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(500);

  const data: AdminTicket[] = rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    name: r.name,
    email: r.email,
    phone: r.phone,
    accountId: r.accountId,
    type: r.type,
    category: r.category,
    subject: r.subject,
    message: r.message,
    preferredContact: r.preferredContact,
    status: r.status as TicketStatus,
    publicReply: r.publicReply,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
  }));

  return <AdminDashboard initialTickets={data} />;
}
