"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type City = { id: string; name: string };

export function ProfileForm({
  initial,
  cities,
}: {
  initial: { fullName: string; phone: string; cityId: string };
  cities: City[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          cityId: form.cityId || null,
        }),
      });
      if (!res.ok) throw new Error("Could not save");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm text-ink-soft">Full name</span>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-ink-soft">Phone</span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 focus:border-accent focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-ink-soft">City</span>
        <select
          value={form.cityId}
          onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}
          className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 focus:border-accent focus:outline-none"
        >
          <option value="">Select a city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-accent-dark">{error}</p>}
      {saved && <p className="text-sm text-sage">Saved ✓</p>}

      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
