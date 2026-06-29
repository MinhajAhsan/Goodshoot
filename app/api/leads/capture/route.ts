import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  quoteId: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().min(5),
  fullName: z.string().optional(),
});

// Captures the email/phone gate on the quote page as a Lead, so the innovator
// can follow up even if the client never books a consultation.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { quoteId, email, phone, fullName } = parsed.data;

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // De-dupe: one lead per quote/email pair.
  const existing = await prisma.lead.findFirst({
    where: { quoteId, email },
  });

  const lead =
    existing ??
    (await prisma.lead.create({
      data: {
        email,
        phone,
        fullName,
        quoteId,
        questionnaireResponseId: quote.questionnaireResponseId,
        abandonmentReason: "saw_quote",
      },
    }));

  if (!existing) {
    await sendEmail({
      to: process.env.INNOVATOR_EMAIL!,
      template: "innovator_new_lead",
      subject: "New lead captured",
      data: { email, phone, quoteId },
    });
  }

  return NextResponse.json({ leadId: lead.id });
}
