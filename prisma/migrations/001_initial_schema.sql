-- GoodShoot — initial schema
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DO $$ blocks)

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "AuthProvider" AS ENUM ('email', 'google');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM (
    'draft', 'quoted', 'consultation_scheduled', 'consultation_completed',
    'paid_50', 'assigned', 'in_progress', 'delivered', 'completed',
    'cancelled', 'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('bank_transfer', 'jazzcash', 'cash', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AbandonmentReason" AS ENUM ('saw_quote', 'no_follow_up', 'budget_concern', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RecontactStatus" AS ENUM (
    'not_contacted', 'contacted_1', 'contacted_2', 'converted', 'do_not_contact'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DeliverableFileType" AS ENUM ('video', 'photo', 'document');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AuditEntityType" AS ENUM ('booking', 'payment', 'specialist_assignment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AuditAction" AS ENUM ('created', 'updated', 'status_changed', 'assigned', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ActorType" AS ENUM ('client', 'specialist', 'innovator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "City" (
  "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        TEXT        NOT NULL,
  "countryCode" TEXT        NOT NULL DEFAULT 'PK',
  "timezone"    TEXT        NOT NULL DEFAULT 'Asia/Karachi',
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "User" (
  "id"                     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"                  TEXT            NOT NULL UNIQUE,
  "phone"                  TEXT,
  "fullName"               TEXT,
  "profilePictureUrl"      TEXT,
  "cityId"                 UUID            REFERENCES "City"("id"),
  "authProvider"           "AuthProvider"  NOT NULL DEFAULT 'email',
  "passwordHash"           TEXT,
  "isSpecialist"           BOOLEAN         NOT NULL DEFAULT FALSE,
  "specialistBio"          TEXT,
  "specialistPortfolioUrl" TEXT,
  "specialistVerified"     BOOLEAN         NOT NULL DEFAULT FALSE,
  "createdAt"              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "deletedAt"              TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "User_cityId_idx" ON "User"("cityId");

CREATE TABLE IF NOT EXISTS "Specialist" (
  "id"                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"              UUID        UNIQUE REFERENCES "User"("id"),
  "displayName"         TEXT        NOT NULL,
  "bio"                 TEXT,
  "profilePictureUrl"   TEXT,
  "portfolioUrl"        TEXT,
  "cities"              UUID[]      NOT NULL DEFAULT '{}',
  "experienceYears"     INTEGER,
  "specializations"     TEXT[]      NOT NULL DEFAULT '{}',
  "ratePerHour"         NUMERIC(12, 2),
  "isActive"            BOOLEAN     NOT NULL DEFAULT TRUE,
  "isVerified"          BOOLEAN     NOT NULL DEFAULT FALSE,
  "primaryContactName"  TEXT,
  "primaryContactPhone" TEXT,
  "primaryContactEmail" TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt"           TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "QuestionnaireTemplate" (
  "id"           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"         TEXT        NOT NULL,
  "version"      INTEGER     NOT NULL DEFAULT 1,
  "isActive"     BOOLEAN     NOT NULL DEFAULT TRUE,
  "questionFlow" JSONB       NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "QuestionnaireResponse" (
  "id"         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId"   UUID        REFERENCES "User"("id"),
  "templateId" UUID        NOT NULL REFERENCES "QuestionnaireTemplate"("id"),
  "responses"  JSONB       NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "QuestionnaireResponse_clientId_idx" ON "QuestionnaireResponse"("clientId");

CREATE TABLE IF NOT EXISTS "Quote" (
  "id"                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId"                UUID        REFERENCES "User"("id"),
  "questionnaireResponseId" UUID        NOT NULL REFERENCES "QuestionnaireResponse"("id"),
  "baseAmount"              NUMERIC(12, 2) NOT NULL,
  "additionalCharges"       JSONB,
  "totalAmount"             NUMERIC(12, 2) NOT NULL,
  "currencyCode"            TEXT        NOT NULL DEFAULT 'PKR',
  "exchangeRate"            NUMERIC(12, 6) NOT NULL DEFAULT 1.0,
  "isActive"                BOOLEAN     NOT NULL DEFAULT TRUE,
  "expiresAt"               TIMESTAMPTZ NOT NULL,
  "createdAt"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Quote_clientId_idx" ON "Quote"("clientId");

CREATE TABLE IF NOT EXISTS "Booking" (
  "id"                    UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId"              UUID             NOT NULL REFERENCES "User"("id"),
  "quoteId"               UUID             NOT NULL REFERENCES "Quote"("id"),
  "specialists"           UUID[]           NOT NULL DEFAULT '{}',
  "eventDate"             DATE,
  "eventTime"             TEXT,
  "eventLocation"         TEXT,
  "cityId"                UUID             REFERENCES "City"("id"),
  "pocName"               TEXT,
  "pocPhone"              TEXT,
  "pocEmail"              TEXT,
  "status"                "BookingStatus"  NOT NULL DEFAULT 'draft',
  "totalAmount"           NUMERIC(12, 2)   NOT NULL,
  "firstPaymentAmount"    NUMERIC(12, 2),
  "secondPaymentAmount"   NUMERIC(12, 2),
  "currencyCode"          TEXT             NOT NULL DEFAULT 'PKR',
  "consultationSlotTime"  TIMESTAMPTZ,
  "consultationScheduled" BOOLEAN          NOT NULL DEFAULT FALSE,
  "consultationNotes"     TEXT,
  "clientNotes"           TEXT,
  "innovatorNotes"        TEXT,
  "createdAt"             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "completedAt"           TIMESTAMPTZ,
  "deletedAt"             TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "Booking_clientId_idx" ON "Booking"("clientId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx"   ON "Booking"("status");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id"                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId"            UUID            NOT NULL REFERENCES "Booking"("id"),
  "amount"               NUMERIC(12, 2)  NOT NULL,
  "currencyCode"         TEXT            NOT NULL DEFAULT 'PKR',
  "paymentOrder"         INTEGER         NOT NULL,
  "paymentMethod"        "PaymentMethod" NOT NULL,
  "gateway"              TEXT,
  "gatewayTransactionId" TEXT,
  "gatewayResponse"      JSONB,
  "status"               "PaymentStatus" NOT NULL DEFAULT 'pending',
  "createdAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "completedAt"          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "Payment_bookingId_idx" ON "Payment"("bookingId");

CREATE TABLE IF NOT EXISTS "Lead" (
  "id"                      UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"                   TEXT                 NOT NULL,
  "phone"                   TEXT,
  "fullName"                TEXT,
  "questionnaireResponseId" UUID                 REFERENCES "QuestionnaireResponse"("id"),
  "quoteId"                 UUID                 REFERENCES "Quote"("id"),
  "abandonmentReason"       "AbandonmentReason",
  "recontactStatus"         "RecontactStatus"    NOT NULL DEFAULT 'not_contacted',
  "lastRecontactAt"         TIMESTAMPTZ,
  "createdAt"               TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  "updatedAt"               TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Lead_recontactStatus_idx" ON "Lead"("recontactStatus");

CREATE TABLE IF NOT EXISTS "Deliverable" (
  "id"                     UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId"              UUID                  NOT NULL REFERENCES "Booking"("id"),
  "fileName"               TEXT                  NOT NULL,
  "fileUrl"                TEXT                  NOT NULL,
  "fileType"               "DeliverableFileType" NOT NULL,
  "fileSizeMb"             NUMERIC(12, 2),
  "uploadedBySpecialistId" UUID                  REFERENCES "Specialist"("id"),
  "uploadedByInnovator"    BOOLEAN               NOT NULL DEFAULT FALSE,
  "createdAt"              TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  "deletedAt"              TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "Deliverable_bookingId_idx" ON "Deliverable"("bookingId");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId"  UUID              REFERENCES "Booking"("id"),
  "entityType" "AuditEntityType" NOT NULL,
  "action"     "AuditAction"     NOT NULL,
  "actorType"  "ActorType"       NOT NULL,
  "actorId"    UUID,
  "oldValues"  JSONB,
  "newValues"  JSONB,
  "ipAddress"  TEXT,
  "createdAt"  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "AuditLog_bookingId_idx" ON "AuditLog"("bookingId");

CREATE TABLE IF NOT EXISTS "AdminSettings" (
  "id"                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "baseQuoteAmount"        NUMERIC(12, 2) NOT NULL,
  "currency"               TEXT        NOT NULL DEFAULT 'PKR',
  "activeCities"           UUID[]      NOT NULL DEFAULT '{}',
  "paymentGatewayPrimary"  TEXT,
  "paymentGatewayFallback" TEXT,
  "firstPaymentPercentage" INTEGER     NOT NULL DEFAULT 50,
  "quoteValidityHours"     INTEGER     NOT NULL DEFAULT 24,
  "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- updatedAt trigger (Prisma handles this in app layer, but
-- useful if you ever write directly to the DB)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'User','City','Specialist','QuestionnaireTemplate',
    'Quote','Booking','Payment','Lead','AdminSettings'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON "%s"; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON "%s" FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END $$;
