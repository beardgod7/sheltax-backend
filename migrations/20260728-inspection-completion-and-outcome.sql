-- Close the inspection funnel: an inspection can now reach a terminal
-- COMPLETED state and carry the outcome of the visit.
--
-- Safe to run more than once. ALTER TYPE ... ADD VALUE is permitted inside a
-- transaction on PostgreSQL 12+ as long as the new value is not *used* in the
-- same transaction; nothing below references 'COMPLETED' as a literal.

BEGIN;

ALTER TYPE enum_inspections_status ADD VALUE IF NOT EXISTS 'COMPLETED';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_inspections_outcome') THEN
    CREATE TYPE enum_inspections_outcome
      AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'NO_SHOW');
  END IF;
END
$$;

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS outcome enum_inspections_outcome,
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "outcomeAt" TIMESTAMP WITH TIME ZONE;

-- Funnel reporting reads "completed inspections by outcome" per listing.
CREATE INDEX IF NOT EXISTS inspections_outcome_idx
  ON inspections ("propertyId", outcome)
  WHERE outcome IS NOT NULL;

COMMIT;
