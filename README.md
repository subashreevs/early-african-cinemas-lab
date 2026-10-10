# Early African Cinemas Lab Web Interface

This repository contains the staging web application for the Early African Cinemas Lab database interface.

## Folders

- `film-database-frontend` - React frontend for browsing, login, and data-entry screens.
- `film-database-backend` - Flask backend API connected to the IU RDC PostgreSQL database.
- `film-database-postgres-scripts` - PostgreSQL schema/setup scripts for the database tables.

## Current Status

The application is currently in staging/testing. Basic film browsing and film data-entry workflows are being validated before wider use.

## Notes

Do not commit real `.env` files, database credentials, JWT secrets, virtual environments, `node_modules`, or build artifacts.

## Film posters

Apply `film-database-postgres-scripts/add-film-posters.sql` to the RDC database once.
Set `POSTER_UPLOAD_FOLDER=/media/volume/eacl-data-volume/uploads/posters` in the backend `.env`.
Install backend dependencies from `film-database-backend/requirements-deploy.txt`.

Posters are uploaded through `POST /api/films/<id>/poster` by editors and admins.
The backend accepts JPEG, PNG, or WebP files up to 5 MB, resizes them within
1200 x 1800 pixels without cropping, and stores unique JPEG files on the data
volume. The generated URL is saved on `films.films`.

`deploy/nginx-eacl.conf` serves those poster URLs from the data volume. After
installing it as the active Nginx site, run `sudo nginx -t` before reloading Nginx.
