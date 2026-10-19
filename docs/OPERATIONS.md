# EACL staging operations and handoff

This guide describes the staging installation on the Jetstream2 Ubuntu 24.04
VM `eacl-web-interface-test`. It is intended for the next maintainer. Read the
[project overview](../README.md) first. Commands shown for the existing VM
assume SSH access as `exouser`; changes under `/etc` require `sudo`. Do not
run write or delete operations against research data just to test a deploy.

## 1. Access and responsibility

The source checkout is `/home/exouser/EACL`, a symlink to
`/media/volume/eacl-data-volume/apps/EACL`. The attached volume also holds
posters and local backups. The root disk is much smaller. Before doing work:

```bash
mountpoint /media/volume/eacl-data-volume
df -h / /media/volume/eacl-data-volume
cd /home/exouser/EACL
git status -sb
git log -1 --oneline
```

If the mount is missing, **stop**. Do not recreate the directory and deploy
there: data can land on the root filesystem instead of the attached volume.
The Jetstream2 VM must be running (not shelved) for the shared URL to work.
Confirm that the new maintainer has appropriate Jetstream2, GitHub, RDC,
certificate, and escalation contacts in an approved private channel; none of
those credentials belong in Git.

The active files on this VM are:

| Purpose | Path/service |
| --- | --- |
| Frontend source | `/home/exouser/EACL/film-database-frontend` |
| Frontend served files | `/var/www/eacl` |
| Backend source and Python venv | `/home/exouser/EACL/film-database-backend` and `.venv` |
| Backend secrets | `/home/exouser/EACL/film-database-backend/.env` (ignored by Git) |
| Backend process | `eacl-backend.service`, Gunicorn on `127.0.0.1:5000` |
| Nginx site | `/etc/nginx/sites-enabled/default` |
| Poster files | `/media/volume/eacl-data-volume/uploads/posters` |
| Local backups | `/media/volume/eacl-data-volume/backups` |

The versioned examples are [`deploy/eacl-backend.service`](../deploy/eacl-backend.service)
and [`deploy/nginx-eacl.conf`](../deploy/nginx-eacl.conf). Always compare them
with the running `/etc` files before replacing anything. Changing hostname,
certificate, Unix user, paths, or VM requires editing the examples.

## 2. Backend environment and dependencies

The app is Flask in `film-database-backend/app.py`. Both `app` and `application`
refer to the Flask object. Gunicorn runs `app:application` with two workers.
Its systemd unit runs as `exouser`, loads the backend `.env`, and restarts on
failure. The backend opens a PostgreSQL connection per HTTP request, sets the
session's `search_path` to `films, public`, and closes the connection after the
request. It is not a long-lived global PostgreSQL connection.

The `.env` template is [`film-database-backend/.env.example`](../film-database-backend/.env.example).
On a new VM, create the real file locally:

```bash
cd /home/exouser/EACL/film-database-backend
cp .env.example .env
chmod 600 .env
# Edit .env locally with a text editor, obtaining credentials privately.
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-deploy.txt
```

Required settings:

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | RDC PostgreSQL URL, with credentials supplied privately; database `eaclab`, port `5444` |
| `PGSSLMODE` | Normally `require` for RDC |
| `DB_SCHEMA` | `films` |
| `JWT_SECRET_KEY` | Long, random signing secret; changing it logs out all existing users |
| `POSTER_UPLOAD_FOLDER` | Absolute writable path `/media/volume/eacl-data-volume/uploads/posters` |
| `DB_CONNECT_TIMEOUT` | Optional PostgreSQL connect timeout; defaults to 10 seconds |

If a password contains `@`, `$`, `:`, `/`, or other URL-special characters,
percent-encode it in `DATABASE_URL`. Do not print the `.env`, put credentials in
shell history, or add them to source files. On a replacement VM, arrange the
attached volume and poster directory **before** starting Gunicorn. The folder
must be writable by the service user and readable by Nginx.

For a temporary backend check, use a different *loopback* port because the
service already owns 5000:

```bash
cd /home/exouser/EACL/film-database-backend
.venv/bin/gunicorn --workers 1 --bind 127.0.0.1:5001 app:application
# In a second terminal:
curl -i http://127.0.0.1:5001/public/films
```

Stop temporary Gunicorn with Ctrl-C. `python app.py` starts Flask in debug mode
and binds to all interfaces; do **not** use it for the shared site. Use
`requirements-deploy.txt`, not the older broad `requirements.txt`, for the
staging runtime.

## 3. Frontend build and API routing

The frontend is React/TypeScript using Create React App and custom CSS. There
is no Material UI dependency. Node 20 and npm are installed on the current VM.
On a new machine, install a supported Node version first. Install exact locked
dependencies with `npm ci`:

```bash
cd /home/exouser/EACL/film-database-frontend
npm ci
printf 'REACT_APP_API_BASE_URL=/api\n' > .env.production.local
npm run build
```

`.env.production.local` is Git-ignored. `REACT_APP_API_BASE_URL` is required
and embedded at **build time** by `src/api/endpoints.ts`; changing the file
without rebuilding has no effect. The output is `build/`, not `dist/`. Nginx
serves `/var/www/eacl`; it does not serve `src/` or `build/` automatically.
The `npm start` development server does not provide the deployed Nginx `/api`
proxy; give it an API URL reachable from the browser when using it.

The current Nginx site:

- Redirects HTTP port 80 to HTTPS port 443.
- Serves the React build from `/var/www/eacl` with a fallback to `index.html` for React Router paths.
- Proxies `/api/films` to Flask `/films` via `proxy_pass http://127.0.0.1:5000/;` (trailing slash matters).
- Serves `/uploads/posters/` from the attached volume.
- Accepts up to 6 MB request bodies at `/api/`; the backend itself limits poster images to 5 MB.

Do not expose Gunicorn's port 5000 or RDC's port 5444 to the public network.

## 4. Updating staging safely

Coordinate a maintenance window for backend/schema changes. Check `git status`
before pulling; do not discard someone else's local changes. Record the
reviewed commit ID and what was deployed. Run tests and build **before**
touching the live site.

### Frontend-only update

After `npm run build` succeeds, back up the live frontend and copy assets
before the new index file:

```bash
cd /home/exouser/EACL
backup=/media/volume/eacl-data-volume/backups/frontend-$(date -u +%Y%m%d-%H%M%S)
mkdir -p "$backup"
rsync -a /var/www/eacl/ "$backup/"
rsync -a --exclude=index.html film-database-frontend/build/ /var/www/eacl/
cp film-database-frontend/build/index.html /var/www/eacl/.index.html.next
mv /var/www/eacl/.index.html.next /var/www/eacl/index.html
```

Check the published page and asset URLs in a browser. The command does not
delete old hashed assets; an already-open page may still need them. A frontend
change does not need an Nginx reload or backend restart. To revert a bad
frontend deploy, take the chosen backup and publish it with the same order:
assets first, index last. Do not assume a build backup contains database data.

### Backend update

Review code and environment changes, install changed dependencies, then
restart and check the service:

```bash
cd /home/exouser/EACL/film-database-backend
.venv/bin/python -m pip install -r requirements-deploy.txt
sudo systemctl restart eacl-backend
sudo systemctl status eacl-backend --no-pager
sudo journalctl -u eacl-backend -n 100 --no-pager
curl -i http://127.0.0.1:5000/public/films
```

Do not edit the live `.env` without a documented reason, and do not paste its
contents into tickets or logs. A code rollback after a schema migration may
not work if the old code expects the old schema; plan migrations separately.

### Nginx or systemd changes

The checked-in examples reflect the current configuration but are not an
installer. A different VM, Unix username, domain, or certificate changes the
paths. Back up the live file before replacing it. Validate Nginx before reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl daemon-reload      # only after changing a systemd unit
sudo systemctl restart eacl-backend
```

The current backend unit is enabled at boot. `systemctl` can keep it running
after SSH disconnects, but it cannot serve traffic while the VM is shelved.

## 5. RDC PostgreSQL and migrations

The database is `eaclab` on IU RDC PostgreSQL port 5444. All project tables are
in schema `films`, **not** `public`. The backend sets its own session search
path after connecting. In DBeaver or `psql`, use schema-qualified names:

```sql
SELECT current_database();
SELECT COUNT(*) FROM films.films WHERE deleted_at IS NULL;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'films' ORDER BY table_name;
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'films' AND table_name = 'film_screenings'
ORDER BY ordinal_position;
```

Current logical tables: `films`, `film_production_details`, `film_authors`,
`film_production_team`, `film_actors`, `film_equipment`, `film_documents`,
`film_institutional_info`, `film_screenings`, and `users`. The checked-in
`film-database-postgres-scripts/schema.sql` describes the intended shape, but
is **not a safe one-click migration for the running RDC database**: its table
names are unqualified and it ends with a placeholder administrator insert.
Do not run it wholesale. `schema-old.sql` is historical only.

Incremental scripts, each targeting `films.*` explicitly:

| Script | Expected change |
| --- | --- |
| `add-user-roles-and-token-version.sql` | Normalize roles, add token version to `films.users` |
| `add-partial-screening-dates.sql` | Add year/month/day fields, backfill exact dates, add constraint |
| `add-film-posters.sql` | Add poster URL and filename to `films.films` |

The running app expects these changes. Before re-running a script, verify the
current columns and constraints and discuss it with the database owner. Even
an `IF NOT EXISTS` script can change existing rows. Take an approved backup,
review a migration in DBeaver/`psql`, apply it once in a maintenance window,
then test the API and UI. Do not hardcode passwords in SQL or Git. Coordinate
RDC account, network, backup, and restore permissions with IU RDC staff.

Film deletion uses `deleted_at` to hide the film and dependent records. Film
**updates** currently delete and reinsert some dependent rows, so editing is
not a full audit trail. Preserve external database backups before bulk edits
or imports. Partial screening dates use `screening_year`, `screening_month`,
and `screening_day`; `screening_date` is populated only for full dates.

## 6. Accounts, secrets, and security

| Role | Films | Users |
| --- | --- | --- |
| Administrator | View, create, edit, soft-delete | Create/update/soft-delete editor and reader accounts |
| Editor | View, create, edit | No management |
| Reader | View only | No management |
| Visitor | Public viewing | No account |

Passwords are stored as bcrypt hashes. The backend checks `deleted_at` on
login and validates each token against the account's current role and
`token_version`. A user update or deletion invalidates older tokens. Access
tokens expire after ten days. A changed `JWT_SECRET_KEY` invalidates all
existing tokens. The User Access screen cannot create or modify administrator
accounts; a privileged database operator must handle those through an approved
procedure. Generate hashes privately, never put plain passwords or hashes in
versioned SQL, and increment `token_version` on an administrator password
change to revoke existing sessions.

There is no self-service password reset or email verification yet. Rotate any
credentials that were sent in email/chat before widening access. Share new
credentials only through a secure approved channel. Keep `.env` readable only
by the service owner and keep database backups private. JWTs in browser
storage are sensitive; avoid copying them into bug reports or screenshots.

Only SSH (22) and Nginx HTTP/HTTPS (80/443) should be publicly reachable as
needed. Nginx's HTTPS certificate secures browser traffic; it does not replace
authorization or database backups. Do not publish poster directories for
anything other than intended public poster files.

## 7. Backups and restore planning

The source checkout, remote PostgreSQL database, poster files, HTTPS
certificate, and VM configuration are **separate assets**. A frontend backup
under `/media/volume/eacl-data-volume/backups` covers only published static
files. A snapshot or backup on the **same attached volume** is not protection
against losing that volume. Confirm RDC's official database backup/restore
policy with its administrator, and arrange an approved off-volume copy of
posters and configuration.

For an authorized, manual database export, use `pg_dump` with an account that
has the necessary RDC permission. It will prompt for a password; do not put
the password in the command or environment variable in a shared shell. Check
institutional data-handling rules before storing or moving the archive:

```bash
umask 077
PGSSLMODE=require pg_dump -W -h <RDC_HOST> -p 5444 -U <RDC_USER> \
  -d eaclab -n films -Fc -f /media/volume/eacl-data-volume/backups/eaclab-films.dump
pg_restore --list /media/volume/eacl-data-volume/backups/eaclab-films.dump | head
```

`pg_restore --list` only checks that the archive is readable; it is **not** a
restore test. Arrange a restoration into a separate, authorized test database
and confirm film and user tables before declaring backup coverage. Do not
restore into the live `eaclab` database as a smoke test. Back up poster files
separately and verify that their database `poster_url` values still map to
files after restoration. Document who owns the schedule, retention, and
off-volume destination; no automated verified backup is supplied by this repo.

## 8. HTTPS, networking, and DNS

The active Nginx configuration is for `https://149.165.171.224` and points to
certificate files under `/etc/letsencrypt/live/149.165.171.224/`. The VM has a
`snap.certbot.renew.timer`, but the next maintainer should verify expiry,
renewal success, and external browser trust rather than assuming unattended
renewal will always work:

```bash
sudo certbot certificates
systemctl list-timers --all | grep -i certbot
sudo nginx -t
```

If UITS approves a project DNS name, coordinate DNS ownership and pointing
it to the correct VM, obtain a certificate for that exact name, update
`server_name`, the certificate paths, and any absolute links, then test HTTP
redirect, HTTPS, API, poster URLs, and login externally. The current IP URL
remains the staging address until that is completed. Do not change the DNS
or install the checked-in Nginx example without reviewing certificates first.
Jetstream2 network rules must allow the necessary ports; do not open 5000 or
5444 inbound.

## 9. Verification

Backend unit tests do not require a live RDC connection:

```bash
cd /home/exouser/EACL/film-database-backend
.venv/bin/python -m unittest discover -s . -p 'test_*.py'
```

Frontend focused tests and production build:

```bash
cd /home/exouser/EACL/film-database-frontend
CI=true npm test -- --watch=false --runInBand --runTestsByPath \
  src/components/catalogFilters.test.ts src/components/screeningDate.test.ts
npm run build
```

`src/App.test.tsx` is an old Create React App starter test and does not test
this application. It may fail; fix or replace it before using the full suite
as a release gate. Automated tests are not a complete UI workflow test.

After deployment, verify:

```bash
sudo systemctl is-active nginx eacl-backend
curl -I https://149.165.171.224/
curl -i https://149.165.171.224/api/public/films
curl -I https://149.165.171.224/admin
```

Then use a browser outside the VM to check certificate trust, catalog search
and filters, film detail pages, login, role restrictions, film create/edit,
partial screening dates, suggestions, posters, and user management. Use a
clearly identified test record and authorized test account. Do not delete
real research records to check a release.

## 10. Troubleshooting

| Symptom | First checks |
| --- | --- |
| Entire site unavailable | VM running, Jetstream2 network rules, Nginx status, ports 80/443, HTTPS certificate |
| Page loads, API 502 | `eacl-backend` status/journal and Gunicorn binding on `127.0.0.1:5000` |
| `Failed to load films` or API 500 | Backend journal, RDC reachability, database credentials, schema/migrations, SQL error |
| Login 401 | Username/password, active account, correct JWT secret, RDC connectivity; do not log the password |
| Poster fails to upload/display | File type/5 MB limit, mounted volume, folder ownership, `POSTER_UPLOAD_FOLDER`, Nginx alias, file existence |
| Browser displays old UI | Confirm built `index.html`/assets in `/var/www/eacl`; rebuild after env changes; hard-refresh browser |
| Certificate warning | Check hostname/IP match, expiry, Certbot timer, Nginx certificate paths, external browser trust |
| Root disk fills | `df -h`; inspect logs and build leftovers without deleting unrelated files or backups |

Useful non-secret commands:

```bash
sudo systemctl status nginx eacl-backend --no-pager
sudo journalctl -u eacl-backend -n 100 --no-pager
sudo nginx -t
ss -ltnp
df -h / /media/volume/eacl-data-volume
```

The frontend can return HTTP 200 while the API is broken, so always check
both. A backend restart may temporarily mask an RDC problem; investigate
repeat failures rather than repeatedly restarting the service.

## 11. Outstanding handoff decisions

- Select and approve a project domain name if one is needed; coordinate UITS/Jetstream2 DNS and a matching HTTPS certificate.
- Decide ownership and cadence for RDC exports, off-volume poster/configuration backups, and an actual restore drill.
- Replace the starter `App.test.tsx` and add browser-level coverage for login, film CRUD, permissions, poster upload, and error states.
- Design a self-service password reset or other approved recovery process. Administrator recovery currently needs privileged database help.
- Confirm launch readiness with researchers: data quality, comments/source fields, permissions, workflow, accessibility, and support contact.
- Decide whether gallery/document uploads and proposed visualization tools should be implemented; they are not part of the supported staging workflow now.

Record the current reviewed Git commit, running configuration differences,
certificate and backup owners, and emergency contacts in an approved private
handoff document. Do not leave the next maintainer dependent on this VM's
shell history or a former team member's personal accounts.
