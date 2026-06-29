"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { QUESTION_FLOW, type QuestionnaireAnswers } from "@/lib/questionnaire";

type City = { id: string; name: string };
type Answers = Partial<QuestionnaireAnswers>;

export function QuestionnaireForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const steps = QUESTION_FLOW.steps;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ durationHours: 4 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  function set<K extends keyof QuestionnaireAnswers>(
    key: K,
    value: QuestionnaireAnswers[K]
  ) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function currentAnswered(): boolean {
    const v = answers[current.id as keyof QuestionnaireAnswers];
    return v !== undefined && v !== "" && v !== null;
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/book/quote?quoteId=${data.quoteId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-300">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <h2 className="text-2xl font-semibold">{current.title}</h2>

      <div className="mt-6 min-h-[160px]">
        {/* Single-select */}
        {current.type === "single-select" && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {current.options.map((opt) => {
              const selected =
                answers[current.id as keyof QuestionnaireAnswers] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    set(current.id as keyof QuestionnaireAnswers, opt.value as never)
                  }
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-accent bg-accent-soft/50 text-ink"
                      : "border-line bg-cream-50 text-ink-soft hover:border-muted-light"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* City select */}
        {current.type === "city-select" && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cities.length === 0 && (
              <p className="text-sm text-muted">
                No cities available yet. Seed the database.
              </p>
            )}
            {cities.map((c) => {
              const selected = answers.cityId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set("cityId", c.id)}
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-accent bg-accent-soft/50 text-ink"
                      : "border-line bg-cream-50 text-ink-soft hover:border-muted-light"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Date */}
        {current.type === "date" && (
          <input
            type="date"
            value={answers.eventDate ?? ""}
            onChange={(e) => set("eventDate", e.target.value)}
            className="w-full rounded-xl border border-line bg-cream-50 px-4 py-3 text-ink focus:border-accent focus:outline-none"
          />
        )}

        {/* Number (duration) */}
        {current.type === "number" && (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={12}
              value={answers.durationHours ?? 4}
              onChange={(e) => set("durationHours", Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="w-20 text-right font-display text-2xl">
              {answers.durationHours ?? 4}h
            </span>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-accent-dark">{error}</p>}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          Back
        </Button>

        {isLast ? (
          <Button
            type="button"
            variant="secondary"
            onClick={submit}
            disabled={!currentAnswered() || submitting}
          >
            {submitting ? "Building your quote…" : "See my quote →"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!currentAnswered()}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
