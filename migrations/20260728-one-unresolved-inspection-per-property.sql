BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM inspections
    WHERE status IN ('PENDING', 'RESCHEDULED')
    GROUP BY "seekerId", "propertyId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce unique unresolved inspections: duplicate active requests exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS inspections_one_unresolved_per_seeker_property_idx
  ON inspections ("seekerId", "propertyId")
  WHERE status IN ('PENDING', 'RESCHEDULED');

COMMIT;
