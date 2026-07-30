BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM inspections inspection
    LEFT JOIN properties listing ON listing.id = inspection."propertyId"
    WHERE listing.id IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cannot repoint inspections.propertyId: legacy inspection rows have no canonical listing';
  END IF;
END
$$;

ALTER TABLE inspections
  DROP CONSTRAINT IF EXISTS "inspections_propertyId_fkey";

ALTER TABLE inspections
  ADD CONSTRAINT "inspections_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES properties(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

COMMIT;
