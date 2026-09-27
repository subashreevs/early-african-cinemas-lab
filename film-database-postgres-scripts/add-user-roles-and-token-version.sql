BEGIN;

ALTER TABLE films.users
ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

UPDATE films.users
SET role = LOWER(TRIM(role));

UPDATE films.users
SET role = 'reader'
WHERE role NOT IN ('admin', 'editor', 'reader');

ALTER TABLE films.users
ALTER COLUMN role SET DEFAULT 'reader';

ALTER TABLE films.users
ALTER COLUMN role SET NOT NULL;

COMMIT;
