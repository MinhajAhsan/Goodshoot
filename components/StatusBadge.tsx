import { clsx } from "clsx";
import type { BookingStatus } from "@prisma/client";

const LABELS: Record<BookingStatus, string> = {
  draft: "Draft",
  quoted: "Quote ready",
  consultation_scheduled: "Consultation booked",
  consultation_completed: "Consultation done",
  paid_50: "Deposit paid",
  assigned: "Specialist assigned",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
};

const TONE: Record<BookingStatus, string> = {
  draft: "bg-cream-300 text-ink-soft",
  quoted: "bg-accent-soft text-accent-dark",
  consultation_scheduled: "bg-accent-soft text-accent-dark",
  consultation_completed: "bg-sage-soft text-sage",
  paid_50: "bg-sage-soft text-sage",
  assigned: "bg-sage-soft text-sage",
  in_progress: "bg-sage-soft text-sage",
  delivered: "bg-sage-soft text-sage",
  completed: "bg-ink text-cream-50",
  cancelled: "bg-cream-300 text-muted",
  abandoned: "bg-cream-300 text-muted",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}

export const statusLabel = (s: BookingStatus) => LABELS[s];
