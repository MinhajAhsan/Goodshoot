// Pure, deterministic pricing engine. No DB access — fully unit-testable.

import type {
  QuestionnaireAnswers,
  EventType,
  LocationType,
  Deliverables,
} from "@/lib/questionnaire";

export interface QuoteEngineSettings {
  baseAmount: number; // AdminSettings.baseQuoteAmount
  quoteValidityHours: number; // AdminSettings.quoteValidityHours
}

export interface QuoteLineItem {
  label: string;
  factor: number; // multiplier applied
}

export interface GeneratedQuote {
  baseAmount: number;
  additionalCharges: QuoteLineItem[];
  totalAmount: number;
  currencyCode: "PKR";
  expiresAt: Date;
}

const EVENT_MULTIPLIER: Record<EventType, number> = {
  wedding: 2.5,
  corporate: 1.8,
  music_video: 2.0,
  birthday: 1.2,
  real_estate: 1.0,
  other: 1.5,
};

const LOCATION_MULTIPLIER: Record<LocationType, number> = {
  indoor: 1.0,
  outdoor: 1.15,
  both: 1.25,
};

const DELIVERABLES_MULTIPLIER: Record<Deliverables, number> = {
  photos: 1.0,
  video: 1.4,
  both: 1.7,
  highlight_reel: 1.5,
};

// Coverage beyond this many hours adds 12% of base per extra hour.
const INCLUDED_HOURS = 2;
const PER_EXTRA_HOUR_FACTOR = 0.12;

export function generateQuote(
  answers: QuestionnaireAnswers,
  settings: QuoteEngineSettings,
  now: Date = new Date()
): GeneratedQuote {
  const base = settings.baseAmount;

  const eventFactor = EVENT_MULTIPLIER[answers.eventType] ?? 1.5;
  const locationFactor = LOCATION_MULTIPLIER[answers.locationType] ?? 1.0;
  const deliverablesFactor =
    DELIVERABLES_MULTIPLIER[answers.deliverables] ?? 1.0;

  const extraHours = Math.max(0, (answers.durationHours ?? INCLUDED_HOURS) - INCLUDED_HOURS);
  const durationFactor = 1 + extraHours * PER_EXTRA_HOUR_FACTOR;

  const additionalCharges: QuoteLineItem[] = [
    { label: `Event type: ${answers.eventType}`, factor: eventFactor },
    { label: `Coverage: ${answers.durationHours}h`, factor: round(durationFactor) },
    { label: `Location: ${answers.locationType}`, factor: locationFactor },
    { label: `Deliverables: ${answers.deliverables}`, factor: deliverablesFactor },
  ];

  const total =
    base * eventFactor * durationFactor * locationFactor * deliverablesFactor;

  const expiresAt = new Date(
    now.getTime() + settings.quoteValidityHours * 60 * 60 * 1000
  );

  return {
    baseAmount: round(base),
    additionalCharges,
    totalAmount: roundToNearest(total, 500), // round to nearest Rs 500
    currencyCode: "PKR",
    expiresAt,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundToNearest(n: number, step: number): number {
  return Math.round(n / step) * step;
}
