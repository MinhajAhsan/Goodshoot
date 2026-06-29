// Helper to write an AuditLog row for booking lifecycle events.
import { prisma } from "@/lib/prisma";
import type { AuditAction, AuditEntityType, ActorType } from "@prisma/client";

export async function writeAuditLog(input: {
  bookingId?: string | null;
  entityType: AuditEntityType;
  action: AuditAction;
  actorType: ActorType;
  actorId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      bookingId: input.bookingId ?? null,
      entityType: input.entityType,
      action: input.action,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      oldValues: (input.oldValues as object) ?? undefined,
      newValues: (input.newValues as object) ?? undefined,
      ipAddress: input.ipAddress ?? null,
    },
  });
}
