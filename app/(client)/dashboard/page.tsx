import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/config";

export const dynamic = "force-dynamic";

const ACTIVE = ["quoted", "consultation_scheduled", "consultation_completed", "paid_50", "assigned", "in_progress", "delivered"] as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeCount = bookings.filter((b) =>
    (ACTIVE as readonly string[]).includes(b.status)
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Hi{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-ink-soft">
            {activeCount > 0
              ? `You have ${activeCount} active booking${activeCount > 1 ? "s" : ""}.`
              : "You don't have any active bookings yet."}
          </p>
        </div>
        <ButtonLink href="/book" variant="secondary">
          New booking
        </ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {bookings.length === 0 && (
          <div className="rounded-2xl border border-line bg-cream-50 p-10 text-center">
            <p className="text-ink-soft">Ready to capture your next moment?</p>
            <ButtonLink href="/book" variant="secondary" className="mt-4">
              Get a quote
            </ButtonLink>
          </div>
        )}

        {bookings.map((b) => (
          <Link
            key={b.id}
            href={`/dashboard/bookings/${b.id}`}
            className="flex items-center justify-between rounded-2xl border border-line bg-cream-50 p-5 transition-colors hover:border-muted-light"
          >
            <div>
              <p className="font-medium">
                Booking #{b.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-muted">
                {b.eventDate
                  ? new Date(b.eventDate).toLocaleDateString()
                  : "Date TBD"}{" "}
                · {formatMoney(Number(b.totalAmount), b.currencyCode)}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </Link>
        ))}
      </div>

      {bookings.length > 0 && (
        <Link
          href="/dashboard/bookings"
          className="mt-6 inline-block text-sm text-ink underline"
        >
          View all bookings →
        </Link>
      )}
    </div>
  );
}
