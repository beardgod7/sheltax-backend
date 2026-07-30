-- Property Reviews: a seeker's rating and written account of a listing they
-- personally inspected. Distinct from review_decisions, which records the
-- admin moderation that controls whether a listing may appear publicly.
--
-- Safe to run more than once.

BEGIN;

-- Listing deletion has to suspend review submission without destroying the
-- reviews already written, so an owner's delete becomes a soft delete. Every
-- existing query goes through Sequelize's paranoid filter, so deleted stock
-- disappears from discovery exactly as it did under the hard delete.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;

-- Discovery reads live listings only; a partial index keeps that path cheap.
CREATE INDEX IF NOT EXISTS properties_live_idx
  ON properties (id)
  WHERE "deletedAt" IS NULL;

CREATE TABLE IF NOT EXISTS property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "propertyId" UUID NOT NULL
    REFERENCES properties(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "seekerId" UUID NOT NULL
    REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  -- The single overall score. The first review model has no category scores.
  rating SMALLINT NOT NULL,
  body TEXT NOT NULL,
  -- The inspection that granted eligibility. Kept as provenance so a review
  -- can always answer "which visit does this account for?", and so a Verified
  -- Inspection badge never has to be re-derived from the inspection history.
  "inspectionId" UUID
    REFERENCES inspections(id) ON UPDATE CASCADE ON DELETE SET NULL,
  "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "editedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT property_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT property_reviews_body_length
    CHECK (char_length(btrim(body)) BETWEEN 20 AND 1000)
);

-- A seeker holds one review slot per listing. Later qualifying inspections
-- refresh the eligibility window; they never open a second slot.
CREATE UNIQUE INDEX IF NOT EXISTS property_reviews_one_per_seeker_idx
  ON property_reviews ("propertyId", "seekerId");

-- The listing page reads newest-first reviews for one property.
CREATE INDEX IF NOT EXISTS property_reviews_listing_recent_idx
  ON property_reviews ("propertyId", "publishedAt" DESC);

-- The seeker's own "my reviews" view reads by author.
CREATE INDEX IF NOT EXISTS property_reviews_seeker_idx
  ON property_reviews ("seekerId", "publishedAt" DESC);

COMMIT;
