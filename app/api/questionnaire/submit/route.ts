import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveTemplate, getAdminSettings } from "@/lib/data";
import { generateQuote } from "@/lib/quoteEngine";
import { getAuthUser } from "@/lib/auth";

const answersSchema = z.object({
  eventType: z.enum([
    "wedding",
    "corporate",
    "birthday",
    "music_video",
    "real_estate",
    "other",
  ]),
  cityId: z.string().uuid(),
  eventDate: z.string().min(1),
  durationHours: z.coerce.number().int().min(1).max(24),
  locationType: z.enum(["indoor", "outdoor", "both"]),
  deliverables: z.enum(["photos", "video", "both", "highlight_reel"]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = answersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid answers", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const answers = parsed.data;

  const template = await getActiveTemplate();
  if (!template) {
    return NextResponse.json(
      { error: "No active questionnaire template. Run the seed." },
      { status: 500 }
    );
  }

  const settings = await getAdminSettings();
  const authUser = await getAuthUser();

  const generated = generateQuote(answers, {
    baseAmount: Number(settings.baseQuoteAmount),
    quoteValidityHours: settings.quoteValidityHours,
  });

  // Persist response + quote together.
  const response = await prisma.questionnaireResponse.create({
    data: {
      templateId: template.id,
      clientId: authUser?.id ?? null,
      responses: answers,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      questionnaireResponseId: response.id,
      clientId: authUser?.id ?? null,
      baseAmount: generated.baseAmount,
      additionalCharges: generated.additionalCharges as unknown as Prisma.InputJsonValue,
      totalAmount: generated.totalAmount,
      currencyCode: generated.currencyCode,
      expiresAt: generated.expiresAt,
    },
  });

  return NextResponse.json({ quoteId: quote.id });
}
