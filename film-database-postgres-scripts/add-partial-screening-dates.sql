BEGIN;

ALTER TABLE films.film_screenings
  ADD COLUMN IF NOT EXISTS screening_year SMALLINT,
  ADD COLUMN IF NOT EXISTS screening_month SMALLINT,
  ADD COLUMN IF NOT EXISTS screening_day SMALLINT;

UPDATE films.film_screenings
SET screening_year = EXTRACT(YEAR FROM screening_date)::SMALLINT,
    screening_month = EXTRACT(MONTH FROM screening_date)::SMALLINT,
    screening_day = EXTRACT(DAY FROM screening_date)::SMALLINT
WHERE screening_date IS NOT NULL
  AND screening_year IS NULL
  AND screening_month IS NULL
  AND screening_day IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'films.film_screenings'::regclass
      AND conname = 'screening_date_parts_valid'
  ) THEN
    ALTER TABLE films.film_screenings
      ADD CONSTRAINT screening_date_parts_valid CHECK (
        (screening_year IS NULL OR screening_year BETWEEN 1 AND 9999)
        AND (screening_month IS NULL OR screening_month BETWEEN 1 AND 12)
        AND (screening_day IS NULL OR screening_day BETWEEN 1 AND 31)
        AND (screening_month IS NULL OR screening_year IS NOT NULL)
        AND (screening_day IS NULL OR screening_month IS NOT NULL)
        AND (screening_date IS NULL OR (
          screening_year = EXTRACT(YEAR FROM screening_date)
          AND screening_month = EXTRACT(MONTH FROM screening_date)
          AND screening_day = EXTRACT(DAY FROM screening_date)
        ))
      );
  END IF;
END $$;

COMMIT;
