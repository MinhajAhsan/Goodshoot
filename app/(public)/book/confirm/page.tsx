import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ConsultationScheduler } from "@/components/ConsultationScheduler";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const bookingId = searchParams.bookingId;
  if (!bookingId) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-soft">No booking specified.</p>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/signup?next=${encodeURIComponent(`/book/confirm?bookingId=${bookingId}`)}`);
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.clientId !== user.id) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-soft">We couldn&apos;t find that booking.</p>
      </div>
    );
  }

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  const hasRealCalendly = !!calendlyUrl && calendlyUrl.startsWith("http");

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Final step
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Book your consultation
        </h1>
        <p className="mt-2 text-ink-soft">
          Pick a time to talk through your shoot. We&apos;ll confirm the details and
          lock in your date.
        </p>

        <div className="mt-8">
          <ConsultationScheduler
            bookingId={booking.id}
            calendlyUrl={hasRealCalendly ? calendlyUrl : null}
          />
        </div>
      </div>
    </div>
  );
}
