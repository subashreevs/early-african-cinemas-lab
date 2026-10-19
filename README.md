# Early African Cinemas Lab Web Interface

This repository contains the Early African Cinemas Lab (EACL) film database web
interface. The current deployment is **staging/testing**, not a production
release. Lab members should continue validating the research data and entry
workflow before any official launch.

Current staging address: <https://149.165.171.224>. This is an IP address, not
a project domain name. The VM must remain running while anyone uses this link.

## Architecture

| Part | Technology | Current location |
| --- | --- | --- |
| Frontend | React, TypeScript, Create React App, custom CSS | `film-database-frontend/`; deployed build at `/var/www/eacl` |
| Backend | Flask, Gunicorn, systemd | `film-database-backend/`; service `eacl-backend` |
| Database | IU RDC PostgreSQL (`eaclab`, schema `films`, port `5444`) | Remote from the Jetstream2 VM |
| Reverse proxy | Nginx and HTTPS | `/etc/nginx/sites-enabled/default` on the VM |
| Posters | JPEGs on the attached volume | `/media/volume/eacl-data-volume/uploads/posters` |
| Source checkout | Git on the attached volume | `/home/exouser/EACL` is a symlink to `/media/volume/eacl-data-volume/apps/EACL` |

Browser -> Nginx on ports 80/443 -> React build and `/api/` proxy -> Gunicorn
on `127.0.0.1:5000` -> IU RDC PostgreSQL. Nginx strips `/api/` before
forwarding: `/api/films` reaches the Flask `/films` route. HTTP redirects to
HTTPS. Nginx serves `/uploads/posters/` from the attached volume. PostgreSQL
is not hosted on the VM and must not be exposed as an inbound service.

The [operations and handoff guide](docs/OPERATIONS.md) covers installation,
deployments, database changes, backups, certificate renewal, troubleshooting,
and transition tasks. **Read it before changing the running service.**

## Repository layout

- `film-database-frontend/`: browsing, login, research workspace, API client, form validation, and frontend tests. Its [README](film-database-frontend/README.md) explains the UI build.
- `film-database-backend/app.py`: Flask entrypoint (`app` / `application`), API routes, authorization, database connections, and poster handling.
- `film-database-backend/requirements-deploy.txt`: focused runtime dependencies. `requirements.txt` is an older, larger list.
- `film-database-backend/.env.example`: safe environment template. Never commit the real `.env`.
- `film-database-backend/test_screenings.py` and `test_posters.py`: backend unit tests.
- `film-database-postgres-scripts/`: schema reference and incremental SQL scripts. **Do not run `schema.sql` as a one-click migration on RDC**; see the operations guide.
- `deploy/`: Nginx and systemd examples matching the current VM. The live `/etc` files remain authoritative.

## What works now

- Public visitors can browse film records and details. The catalog has text search, sorting, and filters for release year, people, and location. Logged-in users can export film data as CSV.
- The film form records basic information, production, authors, team, actors, equipment, institutions, screenings, and external document links. Names and production roles offer suggestions from existing records without preventing new entries.
- Screening dates can be unknown, year-only, month/year, or full date. Missing date parts remain `NULL` rather than being invented.
- Editors and administrators can create and edit films. Administrators can additionally soft-delete films and manage editor/reader accounts. Readers can view but not edit; visitors can use the public catalog.
- Editors and administrators can upload, replace, and remove posters. The backend accepts JPEG, PNG, and WebP files up to 5 MB, resizes them within 1200 x 1800 pixels without cropping, and saves a unique JPEG filename and URL. The files live on the attached volume, not in Git or PostgreSQL.
- Passwords are bcrypt-hashed. Login uses JWT access tokens. Deleted accounts cannot log in; changing/deleting an account invalidates older tokens via `token_version`.

The User Access page deliberately cannot create administrators. Administrator
creation and recovery require a separately approved privileged procedure.
Gallery and document **uploads** are not a supported workflow; external
document links are supported. Older gallery/document components and display
tabs still exist in the code and should not be mistaken for a working upload
feature. There is no self-service password reset yet.

## Quick checks

On the VM:

```bash
mountpoint /media/volume/eacl-data-volume
sudo systemctl status nginx eacl-backend --no-pager
curl -i https://149.165.171.224/api/public/films
curl -I https://149.165.171.224/
df -h / /media/volume/eacl-data-volume
```

`/api/public/films` should return HTTP 200 and a JSON `films` array; the array
may legitimately be empty. The frontend page returning 200 does not prove the
database is healthy, so check both endpoints. For errors, see
[Troubleshooting](docs/OPERATIONS.md#troubleshooting).

## Safety and ownership

Do not commit or send real `.env` files, database credentials, JWT secrets,
passwords, tokens, virtual environments, `node_modules`, built files, poster
files, or database backups. The repository `.gitignore` excludes common local
artifacts, but inspect `git status` before every commit. Rotate credentials
previously shared through email or chat before widening access.

The Git repository contains code, **not** the live RDC data, posters, the VM
configuration, or a verified restore point. Before handing off maintenance,
record Jetstream2/RDC access and ownership, certificate renewal responsibility,
administrator recovery contact, and a tested backup/restore procedure in an
approved private location. Keep the VM unshelved while users need the site.
