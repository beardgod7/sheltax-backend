BEGIN;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "kycStatus" VARCHAR(32) NOT NULL DEFAULT 'UNSUBMITTED',
  ADD COLUMN IF NOT EXISTS "kycLevel" VARCHAR(32) DEFAULT 'BASIC',
  ADD COLUMN IF NOT EXISTS "kycRejectionReason" TEXT;

-- Older KYC rejection code also cleared account verification. KYC-submitted
-- accounts had already authenticated, so restore only those affected accounts.
UPDATE "User"
SET verified = TRUE
WHERE "kycStatus" IN ('PENDING', 'APPROVED', 'REJECTED')
  AND verified = FALSE;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS address VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "reviewedBy" UUID,
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Preserve the active marketplace records while making `properties` canonical.
-- Conflicting approved/rejected copies are returned to pending review.
INSERT INTO properties (
  id, title, description, intent, "propertyType", price, currency, location,
  address, city, state, bedrooms, bathrooms, "sittingRooms", tags, images,
  "isFeatured", "isPopular", "approvalStatus", "rejectionReason", "ownerId",
  "createdAt", "updatedAt", "submittedAt"
)
SELECT
  rental.id,
  rental.title,
  rental.description,
  CASE LOWER(COALESCE(rental.tag, 'rent'))
    WHEN 'buy' THEN 'BUY'
    WHEN 'shortlet' THEN 'SHORTLET'
    WHEN 'swap' THEN 'SWAP'
    ELSE 'RENT'
  END,
  COALESCE(rental."propertyType", 'apartment'),
  rental."rentAmount",
  COALESCE(rental.currency, 'NGN'),
  COALESCE(rental.address, rental.city || ', ' || rental.state),
  rental.address,
  rental.city,
  rental.state,
  COALESCE(rental.bedrooms, 0),
  COALESCE(rental.bathrooms, 0),
  COALESCE(rental."sittingRooms", 0),
  COALESCE(rental.features, '[]'::json),
  COALESCE(rental.images, '[]'::json),
  COALESCE(rental."isFeatured", FALSE),
  FALSE,
  CASE rental."listingStatus"
    WHEN 'active' THEN 'APPROVED'
    WHEN 'rejected' THEN 'REJECTED'
    ELSE 'PENDING'
  END,
  rental."rejectionReason",
  rental."ownerId",
  rental."createdAt",
  rental."updatedAt",
  rental."createdAt"
FROM "RentalProperties" rental
ON CONFLICT (id) DO UPDATE SET
  "approvalStatus" = CASE
    WHEN properties."approvalStatus" = 'APPROVED'
      AND EXCLUDED."approvalStatus" = 'REJECTED' THEN 'PENDING'
    WHEN properties."approvalStatus" = 'REJECTED'
      AND EXCLUDED."approvalStatus" = 'APPROVED' THEN 'PENDING'
    WHEN properties."approvalStatus" = 'APPROVED'
      OR EXCLUDED."approvalStatus" = 'APPROVED' THEN 'APPROVED'
    ELSE EXCLUDED."approvalStatus"
  END,
  "rejectionReason" = CASE
    WHEN properties."approvalStatus" <> EXCLUDED."approvalStatus"
      THEN 'Legacy records had conflicting review states. Admin re-review required.'
    ELSE COALESCE(EXCLUDED."rejectionReason", properties."rejectionReason")
  END,
  "ownerId" = EXCLUDED."ownerId",
  images = CASE
    WHEN json_array_length(COALESCE(properties.images, '[]'::json)) = 0
      THEN EXCLUDED.images
    ELSE properties.images
  END,
  "updatedAt" = GREATEST(properties."updatedAt", EXCLUDED."updatedAt");

CREATE TABLE IF NOT EXISTS review_decisions (
  id UUID PRIMARY KEY,
  "subjectType" VARCHAR(16) NOT NULL CHECK ("subjectType" IN ('KYC', 'LISTING')),
  "subjectId" UUID NOT NULL,
  cycle INTEGER NOT NULL DEFAULT 1,
  outcome VARCHAR(32) NOT NULL CHECK (outcome IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED_TO_PENDING')),
  reason TEXT,
  "reviewerId" UUID,
  "submittedBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS review_decisions_subject_idx
  ON review_decisions ("subjectType", "subjectId", cycle);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'SYSTEM',
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  link VARCHAR(500),
  metadata JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON notifications ("userId", "createdAt" DESC);

-- Inspection creation now resolves canonical Listing records. Replace the
-- legacy RentalProperties foreign key so the database enforces the same model
-- as the application.
ALTER TABLE inspections
  DROP CONSTRAINT IF EXISTS "inspections_propertyId_fkey";

ALTER TABLE inspections
  ADD CONSTRAINT "inspections_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES properties(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

COMMIT;
