// Booking status state machine. Enforces the lifecycle; no skipping states.
import type { BookingStatus } from "@prisma/client";

// Allowed forward transitions per the spec:
// draft → quoted → consultation_scheduled → consultation_completed → paid_50
//       → assigned → in_progress → delivered → completed
// `cancelled` and `abandoned` are terminal and reachable from most live states.
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ["quoted", "cancelled", "abandoned"],
  quoted: ["consultation_scheduled", "cancelled", "abandoned"],
  consultation_scheduled: ["consultation_completed", "cancelled", "abandoned"],
  consultation_completed: ["paid_50", "cancelled", "abandoned"],
  paid_50: ["assigned", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  abandoned: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return false;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedNextStatuses(from: BookingStatus): BookingStatus[] {
  return TRANSITIONS[from] ?? [];
}

export class InvalidTransitionError extends Error {
  constructor(from: BookingStatus, to: BookingStatus) {
    super(`Invalid booking status transition: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}
