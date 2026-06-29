import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { questionnaireResponse: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json({
    quote: {
      id: quote.id,
      baseAmount: Number(quote.baseAmount),
      additionalCharges: quote.additionalCharges,
      totalAmount: Number(quote.totalAmount),
      currencyCode: quote.currencyCode,
      expiresAt: quote.expiresAt,
      isActive: quote.isActive,
      answers: quote.questionnaireResponse.responses,
    },
  });
}
