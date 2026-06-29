"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";

// Phase 1: a lightweight slot picker that stands in for the Calendly embed.
// When NEXT_PUBLIC_CALENDLY_URL is configured (Phase 4), the real Calendly
// inline widget renders instead, and a webhook will auto-update the status.
export function ConsultationScheduler({
  bookingId,
  calendlyUrl,
}: {
  bookingId: string;
  calendlyUrl: string | null;
}) {
  const router = useRouter();
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Phase 4: real Calendly inline embed ---
  if (calendlyUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-cream-50">
        <iframe
          src={calendlyUrl}
          className="h-[680px] w-full"
          title="Schedule a consultation"
        />
      </div>
    );
  }

  // --- Phase 1: stubbed slot picker ---
  const slots = buildSlots();

  async function confirm() {
    if (!slot) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotTime: slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/book/success?bookingId=${bookingId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-cream-50 p-6">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
        Scheduling preview
      </p>
      <p className="mb-5 text-sm text-ink-soft">
        Choose a slot below. (A full Calendly calendar will appear here once
        connected.)
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((s) => (
          <button
            key={s.iso}
            type="button"
            onClick={() => setSlot(s.iso)}
            className={clsx(
              "rounded-xl border px-3 py-3 text-left text-sm transition-colors",
              slot === s.iso
                ? "border-accent bg-accent-soft/50"
                : "border-line bg-white hover:border-muted-light"
            )}
          >
            <span className="block font-medium">{s.day}</span>
            <span className="text-muted">{s.time}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-accent-dark">{error}</p>}

      <Button
        variant="secondary"
        size="lg"
        className="mt-6 w-full"
        onClick={confirm}
        disabled={!slot || busy}
      >
        {busy ? "Confirming…" : "Confirm consultation"}
      </Button>
    </div>
  );
}

function buildSlots() {
  const out: { iso: string; day: string; time: string }[] = [];
  const now = new Date();
  for (let d = 1; d <= 3; d++) {
    for (const hour of [11, 15, 18]) {
      const date = new Date(now);
      date.setDate(now.getDate() + d);
      date.setHours(hour, 0, 0, 0);
      out.push({
        iso: date.toISOString(),
        day: date.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        time: date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    }
  }
  return out;
}
