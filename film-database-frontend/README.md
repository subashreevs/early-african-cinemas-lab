# EACL frontend

This is the React/TypeScript frontend for the Early African Cinemas Lab web
interface. It uses Create React App and project CSS, not Material UI. The
[project README](../README.md) and [operations guide](../docs/OPERATIONS.md)
cover the staging architecture, deployment, database, security, and handoff.

## Install and run

```bash
cd /home/exouser/EACL/film-database-frontend
npm ci
```

`src/api/endpoints.ts` requires `REACT_APP_API_BASE_URL` **when the app is
built**. For the deployed Nginx site, create the Git-ignored
`.env.production.local` file with `REACT_APP_API_BASE_URL=/api`. Nginx proxies
those requests to Flask. For `npm start`, point the variable to an API URL
reachable by the browser; the development server does not have the deployed
Nginx `/api` routing.

```bash
npm start
npm run build
```

The production output is `build/`. It is ignored by Git and is not served
until published to `/var/www/eacl` on the VM. Follow the operations guide;
do not edit the deployed build by hand.

## Main code areas

- `src/App.tsx`: browser routes and login state.
- `src/api/endpoints.ts` and `src/api/client.ts`: API URL construction and requests.
- `src/components/HomePage.tsx` and `catalogFilters.ts`: catalog search, filters, sorting, and CSV export.
- `src/components/MovieDetailsPage.tsx`: film detail display.
- `src/components/AdminDashboard.tsx`, `AdminFilms.tsx`, and `AdminUsers.tsx`: researcher workflows.
- `src/components/FormContent.tsx` and `FilmFormConstants.ts`: film entry and validation.
- `src/components/screeningDate.ts`: partial-date display.
- `src/components/PosterForm.tsx`: poster upload UI.
- `src/styles/`: the current CSS theme and layout.

Gallery/document upload components and endpoint constants remain from older
work, but those uploads are not a supported feature. External document URLs
can be entered as research links.

## Tests

```bash
CI=true npm test -- --watch=false --runInBand --runTestsByPath \
  src/components/catalogFilters.test.ts src/components/screeningDate.test.ts
npm run build
```

`src/App.test.tsx` is still the Create React App starter test; it needs to be
rewritten before treating the full frontend suite as a release gate.
