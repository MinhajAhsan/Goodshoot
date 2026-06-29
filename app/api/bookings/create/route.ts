import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAdminSettings } from "@/lib/data";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  quoteId: z.string().uuid(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  eventLocation: z.string().optional(),
  pocName: z.string().optional(),
  pocPhone: z.string().optional(),
  pocEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const quote = await prisma.quote.findUnique({
    where: { id: input.quoteId },
    include: { questionnaireResponse: true },
  });
  if (!quote || !quote.isActive) {
    return NextResponse.json({ error: "Quote unavailable" }, { status: 404 });
  }
  if (quote.expiresAt < new Date()) {
    return NextResponse.json({ error: "Quote has expired" }, { status: 410 });
  }

  const settings = await getAdminSettings();
  const total = Number(quote.totalAmount);
  const firstPct = settings.firstPaymentPercentage ?? 50;
  const firstPayment = Math.round((total * firstPct) / 100);
  const secondPayment = total - firstPayment;

  const answers = quote.questionnaireResponse.responses as {
    cityId?: string;
    eventDate?: string;
  };

  const booking = await prisma.booking.create({
    data: {
      clientId: user.id,
      quoteId: quote.id,
      status: "quoted",
      totalAmount: total,
      firstPaymentAmount: firstPayment,
      secondPaymentAmount: secondPayment,
      currencyCode: quote.currencyCode,
      cityId: answers.cityId ?? null,
      eventDate: input.eventDate
        ? new Date(input.eventDate)
        : answers.eventDate
        ? new Date(answers.eventDate)
        : null,
      eventTime: input.eventTime,
      eventLocation: input.eventLocation,
      pocName: input.pocName ?? user.fullName,
      pocPhone: input.pocPhone ?? user.phone,
      pocEmail: input.pocEmail ?? user.email,
    },
  });

  await writeAuditLog({
    bookingId: booking.id,
    entityType: "booking",
    action: "created",
    actorType: "client",
    actorId: user.id,
    newValues: { status: "quoted", totalAmount: total },
  });

  await sendEmail({
    to: user.email,
    template: "quote_generated",
    subject: "Your GoodShoot quote",
    data: { bookingId: booking.id, total },
  });

  return NextResponse.json({ bookingId: booking.id });
}
