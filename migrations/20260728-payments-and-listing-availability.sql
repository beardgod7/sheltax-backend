-- Mock payment ledger + listing availability.
--
-- The payment flow deliberately mirrors a real gateway so the mock provider can
-- be swapped for Paystack without reshaping the data:
--   initiate  -> Payment(PENDING), listing RESERVED   (gateway init/redirect)
--   settle    -> Payment(SUCCESSFUL|FAILED)           (gateway webhook/callback)
--
-- Safe to run more than once.

BEGIN;

-- Listing availability is independent of moderation: approvalStatus says
-- whether a listing may be seen, availabilityStatus says whether it is still
-- on the market.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_properties_availabilityStatus') THEN
    CREATE TYPE "enum_properties_availabilityStatus"
      AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');
  END IF;
END
$$;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS "availabilityStatus" "enum_properties_availabilityStatus"
    NOT NULL DEFAULT 'AVAILABLE';

CREATE INDEX IF NOT EXISTS properties_availability_idx
  ON properties ("availabilityStatus", "approvalStatus");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_payments_status') THEN
    CREATE TYPE enum_payments_status
      AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY,
  "listingId"   UUID NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  "buyerId"     UUID NOT NULL,
  "sellerId"    UUID NOT NULL,
  "inspectionId" UUID,
  amount        NUMERIC(15, 2) NOT NULL,
  "platformFee" NUMERIC(15, 2) NOT NULL DEFAULT 0,
  "totalAmount" NUMERIC(15, 2) NOT NULL,
  currency      VARCHAR(8) NOT NULL DEFAULT 'NGN',
  provider      VARCHAR(32) NOT NULL DEFAULT 'MOCK',
  reference     VARCHAR(64) NOT NULL UNIQUE,
  status        enum_payments_status NOT NULL DEFAULT 'PENDING',
  "failureReason" TEXT,
  "paidAt"      TIMESTAMP WITH TIME ZONE,
  metadata      JSONB,
  "createdAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_buyer_idx ON payments ("buyerId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS payments_listing_idx ON payments ("listingId", status);

-- A listing can only be sold once, and one buyer can only hold one open
-- checkout against it at a time. Enforced in the database so two concurrent
-- checkouts cannot both settle.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_settled_sale_per_listing_idx
  ON payments ("listingId")
  WHERE status = 'SUCCESSFUL';

CREATE UNIQUE INDEX IF NOT EXISTS payments_one_open_checkout_per_buyer_listing_idx
  ON payments ("listingId", "buyerId")
  WHERE status = 'PENDING';

COMMIT;
