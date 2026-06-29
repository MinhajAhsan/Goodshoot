// Shared questionnaire definition — drives the multi-step form, the seeded
// QuestionnaireTemplate.questionFlow, and the quote engine.

export type EventType =
  | "wedding"
  | "corporate"
  | "birthday"
  | "music_video"
  | "real_estate"
  | "other";

export type LocationType = "indoor" | "outdoor" | "both";

export type Deliverables = "photos" | "video" | "both" | "highlight_reel";

export interface QuestionnaireAnswers {
  eventType: EventType;
  cityId: string; // City uuid (loaded from DB)
  eventDate: string; // ISO date (yyyy-mm-dd)
  durationHours: number;
  locationType: LocationType;
  deliverables: Deliverables;
}

// Static option metadata used to render the form. `city` is loaded from the DB
// at render time, so it is not enumerated here.
export const QUESTION_FLOW = {
  version: 1,
  steps: [
    {
      id: "eventType",
      title: "What are we shooting?",
      type: "single-select" as const,
      options: [
        { value: "wedding", label: "Wedding" },
        { value: "corporate", label: "Corporate / Event" },
        { value: "birthday", label: "Birthday / Party" },
        { value: "music_video", label: "Music Video" },
        { value: "real_estate", label: "Real Estate" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      id: "cityId",
      title: "Which city?",
      type: "city-select" as const,
      options: [], // populated from active cities in the DB
    },
    {
      id: "eventDate",
      title: "When is it?",
      type: "date" as const,
    },
    {
      id: "durationHours",
      title: "How many hours of coverage?",
      type: "number" as const,
      min: 1,
      max: 24,
    },
    {
      id: "locationType",
      title: "Where is it happening?",
      type: "single-select" as const,
      options: [
        { value: "indoor", label: "Indoor" },
        { value: "outdoor", label: "Outdoor" },
        { value: "both", label: "Both" },
      ],
    },
    {
      id: "deliverables",
      title: "What do you need delivered?",
      type: "single-select" as const,
      options: [
        { value: "photos", label: "Photos only" },
        { value: "video", label: "Video only" },
        { value: "both", label: "Photos + Video" },
        { value: "highlight_reel", label: "Highlight reel" },
      ],
    },
  ],
} as const;
