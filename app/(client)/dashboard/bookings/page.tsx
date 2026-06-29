import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function BookingsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/bookings");

  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">Your bookings</h1>

      <div className="mt-8 space-y-3">
        {bookings.length === 0 && (
          <p className="text-ink-soft">No bookings yet.</p>
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
                Created {new Date(b.createdAt).toLocaleDateString()} ·{" "}
                {formatMoney(Number(b.totalAmount), b.currencyCode)}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
