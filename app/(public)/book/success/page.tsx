import { ButtonLink } from "@/components/ui/Button";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">
          You&apos;re all set
        </h1>
        <p className="mt-3 text-ink-soft">
          Your consultation is booked. We&apos;ve emailed you the details and our
          team will be in touch shortly to confirm everything for your shoot.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/dashboard" variant="secondary" size="lg">
            Go to my bookings
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" size="lg">
            Back home
          </ButtonLink>
        </div>

        {searchParams.bookingId && (
          <p className="mt-6 text-xs text-muted">
            Booking reference: {searchParams.bookingId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
}
