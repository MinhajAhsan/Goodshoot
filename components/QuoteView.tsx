"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/config";

interface QuoteData {
  id: string;
  baseAmount: number;
  totalAmount: number;
  currencyCode: string;
  expiresAt: string;
  additionalCharges: { label: string; factor: number }[];
}

export function QuoteView({
  quote,
  isAuthed,
  expired,
}: {
  quote: QuoteData;
  isAuthed: boolean;
  expired: boolean;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (expired) {
    return (
      <div className="rounded-2xl border border-line bg-cream-50 p-8 text-center">
        <h1 className="text-2xl font-semibold">This quote has expired</h1>
        <p className="mt-2 text-ink-soft">
          Quotes are valid for a limited time. Start again to get a fresh one.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => router.push("/book")}>
            Get a new quote
          </Button>
        </div>
      </div>
    );
  }

  async function captureLead(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quoteId: quote.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setRevealed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function book() {
    if (!isAuthed) {
      const next = encodeURIComponent(`/book/quote?quoteId=${quote.id}`);
      router.push(`/signup?next=${next}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/book/confirm?bookingId=${data.bookingId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  // --- Lead-capture gate ---
  if (!revealed) {
    return (
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Almost there
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Where should we send it?</h1>
        <p className="mt-2 text-ink-soft">
          Pop in your details and we&apos;ll reveal your personalised quote.
        </p>

        <form onSubmit={captureLead} className="mt-8 space-y-4">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
            type="text"
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            type="email"
            required
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            type="tel"
            required
          />
          {error && <p className="text-sm text-accent-dark">{error}</p>}
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={busy}
          >
            {busy ? "One sec…" : "Reveal my quote"}
          </Button>
        </form>
      </div>
    );
  }

  // --- Quote display ---
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Your quote
      </p>
      <h1 className="mt-2 font-display text-5xl font-semibold text-ink">
        {formatMoney(quote.totalAmount, quote.currencyCode)}
      </h1>
      <p className="mt-2 text-ink-soft">
        Valid until {new Date(quote.expiresAt).toLocaleString()}
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-cream-50 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Base package</span>
          <span>{formatMoney(quote.baseAmount, quote.currencyCode)}</span>
        </div>
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          {quote.additionalCharges.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted">{c.label}</span>
              <span className="text-ink-soft">×{c.factor}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 font-medium">
          <span>Total</span>
          <span>{formatMoney(quote.totalAmount, quote.currencyCode)}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Pay 50% to confirm your booking, and the remaining 50% on delivery.
      </p>

      {error && <p className="mt-4 text-sm text-accent-dark">{error}</p>}

      <Button
        variant="secondary"
        size="lg"
        className="mt-6 w-full"
        onClick={book}
        disabled={busy}
      >
        {busy ? "Setting up…" : "Book my consultation →"}
      </Button>
      {!isAuthed && (
        <p className="mt-3 text-center text-xs text-muted">
          You&apos;ll create a quick account to manage your booking.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-ink-soft">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 text-ink focus:border-accent focus:outline-none"
      />
    </label>
  );
}
