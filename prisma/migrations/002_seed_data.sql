-- GoodShoot — placeholder seed data
-- Run this AFTER 001_initial_schema.sql
-- Run in: Supabase Dashboard → SQL Editor

-- ============================================================
-- CITIES  (Lahore first)
-- ============================================================

INSERT INTO "City" ("id", "name", "countryCode", "timezone", "isActive")
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Lahore',    'PK', 'Asia/Karachi', TRUE),
  ('11111111-0000-0000-0000-000000000002', 'Karachi',   'PK', 'Asia/Karachi', TRUE),
  ('11111111-0000-0000-0000-000000000003', 'Islamabad', 'PK', 'Asia/Karachi', TRUE)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- QUESTIONNAIRE TEMPLATE
-- ============================================================

INSERT INTO "QuestionnaireTemplate" ("id", "name", "version", "isActive", "questionFlow")
VALUES (
  '22222222-0000-0000-0000-000000000001',
  'Default booking flow',
  1,
  TRUE,
  '{
    "version": 1,
    "steps": [
      {
        "id": "eventType",
        "title": "What are we shooting?",
        "type": "single-select",
        "options": [
          { "value": "wedding",      "label": "Wedding" },
          { "value": "corporate",    "label": "Corporate / Event" },
          { "value": "birthday",     "label": "Birthday / Party" },
          { "value": "music_video",  "label": "Music Video" },
          { "value": "real_estate",  "label": "Real Estate" },
          { "value": "other",        "label": "Something else" }
        ]
      },
      {
        "id": "cityId",
        "title": "Which city?",
        "type": "city-select",
        "options": []
      },
      {
        "id": "eventDate",
        "title": "When is it?",
        "type": "date"
      },
      {
        "id": "durationHours",
        "title": "How many hours of coverage?",
        "type": "number",
        "min": 1,
        "max": 24
      },
      {
        "id": "locationType",
        "title": "Where is it happening?",
        "type": "single-select",
        "options": [
          { "value": "indoor",  "label": "Indoor" },
          { "value": "outdoor", "label": "Outdoor" },
          { "value": "both",    "label": "Both" }
        ]
      },
      {
        "id": "deliverables",
        "title": "What do you need delivered?",
        "type": "single-select",
        "options": [
          { "value": "photos",         "label": "Photos only" },
          { "value": "video",          "label": "Video only" },
          { "value": "both",           "label": "Photos + Video" },
          { "value": "highlight_reel", "label": "Highlight reel" }
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- ADMIN SETTINGS
-- ============================================================

INSERT INTO "AdminSettings" (
  "id", "baseQuoteAmount", "currency", "activeCities",
  "firstPaymentPercentage", "quoteValidityHours"
)
VALUES (
  '33333333-0000-0000-0000-000000000001',
  20000,
  'PKR',
  ARRAY[
    '11111111-0000-0000-0000-000000000001'::uuid,  -- Lahore
    '11111111-0000-0000-0000-000000000002'::uuid,  -- Karachi
    '11111111-0000-0000-0000-000000000003'::uuid   -- Islamabad
  ],
  50,
  24
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- SAMPLE SPECIALISTS  (no linked auth user — userId is nullable)
-- ============================================================

INSERT INTO "Specialist" (
  "id", "displayName", "bio", "cities", "experienceYears",
  "specializations", "ratePerHour", "isActive", "isVerified",
  "primaryContactName", "primaryContactPhone", "primaryContactEmail"
)
VALUES
  (
    '44444444-0000-0000-0000-000000000001',
    'Ali Hassan',
    'Wedding and portrait photographer based in Lahore with 7 years of experience.',
    ARRAY['11111111-0000-0000-0000-000000000001'::uuid],  -- Lahore
    7,
    ARRAY['wedding', 'portrait', 'indoor'],
    8000,
    TRUE,
    TRUE,
    'Ali Hassan',
    '+92-300-1234567',
    'ali.hassan.photo@example.com'
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    'Sara Malik',
    'Corporate event videographer covering Lahore and Islamabad.',
    ARRAY[
      '11111111-0000-0000-0000-000000000001'::uuid,  -- Lahore
      '11111111-0000-0000-0000-000000000003'::uuid   -- Islamabad
    ],
    5,
    ARRAY['corporate', 'video', 'outdoor'],
    9500,
    TRUE,
    FALSE,
    'Sara Malik',
    '+92-321-9876543',
    'sara.malik.video@example.com'
  ),
  (
    '44444444-0000-0000-0000-000000000003',
    'Bilal Rao',
    'Music video director and real estate photographer based in Karachi.',
    ARRAY['11111111-0000-0000-0000-000000000002'::uuid],  -- Karachi
    4,
    ARRAY['music_video', 'real_estate', 'outdoor'],
    7500,
    TRUE,
    FALSE,
    'Bilal Rao',
    '+92-333-5556789',
    'bilal.rao.media@example.com'
  )
ON CONFLICT ("id") DO NOTHING;
