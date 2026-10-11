BEGIN;

CREATE TABLE IF NOT EXISTS films (
  film_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  release_year INT,
  runtime VARCHAR(50),
  synopsis TEXT,
  av_annotate_link VARCHAR(255),
  poster_url TEXT,
  poster_filename TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_production_details (
  production_detail_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  production_timeframe VARCHAR(100),
  shooting_city VARCHAR(100),
  shooting_country VARCHAR(100),
  post_production_studio VARCHAR(255),
  production_comments TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_authors (
  author_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  role VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  comment TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_production_team (
  team_member_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  department VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  comment TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_actors (
  actor_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  actor_name VARCHAR(255) NOT NULL,
  character_name VARCHAR(255),
  comment TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_equipment (
  equipment_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  equipment_name VARCHAR(255) NOT NULL,
  description TEXT,
  comment TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_documents (
  document_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  file_url TEXT,
  comment TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_institutional_info (
  info_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  production_company VARCHAR(255),
  funding_company VARCHAR(255),
  funding_comment TEXT,
  source TEXT,
  institutional_city VARCHAR(100),
  institutional_country VARCHAR(100),
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS film_screenings (
  screening_id SERIAL PRIMARY KEY,
  film_id INT REFERENCES films(film_id) ON DELETE CASCADE,
  screening_date TIMESTAMP,
  screening_year SMALLINT,
  screening_month SMALLINT,
  screening_day SMALLINT,
  CONSTRAINT screening_date_parts_valid CHECK (
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
  ),
  screening_city VARCHAR(100),
  screening_country VARCHAR(100),
  organizers VARCHAR(255),
  format VARCHAR(100),
  audience VARCHAR(100),
  film_rights TEXT,
  comment TEXT,
  source TEXT,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'reader',
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_username
ON users(username)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_films_deleted_at ON films(deleted_at);
CREATE INDEX IF NOT EXISTS idx_films_title ON films(title);
CREATE INDEX IF NOT EXISTS idx_film_authors_film_id ON film_authors(film_id);
CREATE INDEX IF NOT EXISTS idx_film_team_film_id ON film_production_team(film_id);
CREATE INDEX IF NOT EXISTS idx_film_actors_film_id ON film_actors(film_id);
CREATE INDEX IF NOT EXISTS idx_film_screenings_film_id ON film_screenings(film_id);
CREATE INDEX IF NOT EXISTS idx_film_documents_film_id ON film_documents(film_id);

COMMIT;



SET search_path TO films;

INSERT INTO users (username, password_hash, role)
VALUES (
  '<ADMIN_USERNAME>',
  '<ADMIN_PASSWORD_HASH>',
  '<ADMIN_ROLE>'
)
ON CONFLICT (username) WHERE deleted_at IS NULL
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  deleted_at = NULL;


  COMMIT;
