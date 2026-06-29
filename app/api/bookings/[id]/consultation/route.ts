import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isInnovator } from "@/lib/auth";
import { canTransition } from "@/lib/stateMachine";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  slotTime: z.string().min(1), // ISO datetime of chosen consultation slot
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
  });
  if (!booking || booking.deletedAt) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const owner = booking.clientId === user.id || (await isInnovator());
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canTransition(booking.status, "consultation_scheduled")) {
    return NextResponse.json(
      { error: `Cannot schedule consultation from status "${booking.status}"` },
      { status: 409 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "consultation_scheduled",
      consultationScheduled: true,
      consultationSlotTime: new Date(parsed.data.slotTime),
      consultationNotes: parsed.data.notes,
    },
  });

  await writeAuditLog({
    bookingId: booking.id,
    entityType: "booking",
    action: "status_changed",
    actorType: "client",
    actorId: user.id,
    oldValues: { status: booking.status },
    newValues: { status: updated.status, slot: parsed.data.slotTime },
  });

  await sendEmail({
    to: user.email,
    template: "consultation_scheduled",
    subject: "Your GoodShoot consultation is booked",
    data: { bookingId: booking.id, slot: parsed.data.slotTime },
  });
  await sendEmail({
    to: process.env.INNOVATOR_EMAIL!,
    template: "innovator_new_consultation",
    subject: "New consultation booked",
    data: { bookingId: booking.id, slot: parsed.data.slotTime },
  });

  return NextResponse.json({ ok: true });
}
