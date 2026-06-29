import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/bookings/${params.id}`);

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { deliverables: { where: { deletedAt: null } }, city: true },
  });

  if (!booking || booking.deletedAt || booking.clientId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/bookings" className="text-sm text-muted hover:text-ink">
        ← All bookings
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          Booking #{booking.id.slice(0, 8).toUpperCase()}
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Event date" value={booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "TBD"} />
        <Detail label="City" value={booking.city?.name ?? "—"} />
        <Detail label="Location" value={booking.eventLocation ?? "—"} />
        <Detail
          label="Consultation"
          value={
            booking.consultationSlotTime
              ? new Date(booking.consultationSlotTime).toLocaleString()
              : "Not scheduled"
          }
        />
      </section>

      {/* Payments */}
      <section className="mt-6 rounded-2xl border border-line bg-cream-50 p-6">
        <h2 className="text-lg font-semibold">Payment</h2>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Total" value={formatMoney(Number(booking.totalAmount), booking.currencyCode)} />
          <Row label="Deposit (50%)" value={booking.firstPaymentAmount ? formatMoney(Number(booking.firstPaymentAmount), booking.currencyCode) : "—"} />
          <Row label="On delivery (50%)" value={booking.secondPaymentAmount ? formatMoney(Number(booking.secondPaymentAmount), booking.currencyCode) : "—"} />
        </div>
      </section>

      {/* Point of contact */}
      <section className="mt-6 rounded-2xl border border-line bg-cream-50 p-6">
        <h2 className="text-lg font-semibold">Your point of contact</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {booking.status === "assigned" || booking.status === "in_progress" || booking.status === "delivered" || booking.status === "completed"
            ? "Your specialist's details will appear here."
            : "Assigned once your booking is confirmed."}
        </p>
        {booking.pocName && (
          <p className="mt-2 text-sm">{booking.pocName} · {booking.pocPhone ?? booking.pocEmail}</p>
        )}
      </section>

      {/* Deliverables */}
      <section className="mt-6 rounded-2xl border border-line bg-cream-50 p-6">
        <h2 className="text-lg font-semibold">Deliverables</h2>
        {booking.deliverables.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Nothing delivered yet. You&apos;ll be notified when your files are ready.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {booking.deliverables.map((d) => (
              <li key={d.id} className="text-sm">
                <a href={d.fileUrl} className="text-accent-dark underline">
                  {d.fileName}
                </a>{" "}
                <span className="text-muted">({d.fileType})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-cream-50 p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-ink-soft">{value}</span>
    </div>
  );
}
