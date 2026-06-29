import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { QuoteView } from "@/components/QuoteView";

export const dynamic = "force-dynamic";

export default async function QuotePage({
  searchParams,
}: {
  searchParams: { quoteId?: string };
}) {
  const quoteId = searchParams.quoteId;

  if (!quoteId) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-soft">No quote specified.</p>
      </div>
    );
  }

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  const authUser = await getAuthUser();

  if (!quote) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-soft">We couldn&apos;t find that quote.</p>
      </div>
    );
  }

  const expired = quote.expiresAt < new Date() || !quote.isActive;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <QuoteView
          quote={{
            id: quote.id,
            baseAmount: Number(quote.baseAmount),
            totalAmount: Number(quote.totalAmount),
            currencyCode: quote.currencyCode,
            expiresAt: quote.expiresAt.toISOString(),
            additionalCharges: (quote.additionalCharges as
              | { label: string; factor: number }[]
              | null) ?? [],
          }}
          isAuthed={!!authUser}
          expired={expired}
        />
      </div>
    </div>
  );
}
