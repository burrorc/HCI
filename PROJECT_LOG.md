# HCI Project Log

This file is meant to give another AI or teammate enough context to get productive quickly.

## Overview
- Frontend-only Vite + React + TypeScript app that mocks an Argo CD-style console.
- Entry point is `src/main.tsx` (Vite default) mounting `App` from `src/App.tsx`.
- `App` currently renders `ArgoCardsLayout` (card-centric grid). The alternative `ArgoLayout` is a simpler single-page view left in place for reference.

## Tech stack & scripts
- React 18, TypeScript 5, Vite 5.
- Styling is plain CSS plus Tailwind-like utility classes authored inline (no Tailwind config in use despite dependency). Global styles live in `src/index.css`; legacy card styles in `src/App.css`.
- Icons from `lucide-react`.
- NPM scripts: `npm run dev` (Vite dev server), `npm run build` (tsc build + Vite), `npm run preview`, `npm run lint` (ESLint), `npm run test` (Vitest), `npm run format` (Prettier).

## Components & state
- `src/components/ArgoCardsLayout.tsx` — primary UI. Key behaviors:
  - Hard-coded `apps` array of 9 mock Argo applications with status, sync flag, repo info, timestamps.
  - Allows per-card title editing with inline save/revert, star toggling (affects sort), and info-mode toggling (compact vs. detailed meta view).
  - Pagination (8 per page), search input with focus-triggered dropdown listing all apps (no filtering yet), and a status-distribution progress bar.
  - Nav/sidebar with static items; top bar actions (`+ NEW APP`, `SYNC APPS`, `REFRESH APPS`) are non-functional placeholders.
  - Per-card actions (`SYNC`, `REFRESH`, `DELETE`) are also UI-only; no API calls.
- `src/components/ArgoLayout.tsx` — simpler vertical layout showing sidebar, status tiles, and grid of resource nodes. Kept for design reference; not mounted by default.

## Current styling
- Global palette set in `src/index.css` with radial-gradient background and system sans font.
- `ArgoCardsLayout` uses inline utility classes for layout/colors; `App.css` contains older card styles that are not used by the current layout but remain harmless.

## Done so far
- Bootstrapped Vite React project with TypeScript.
- Built interactive Argo-inspired card grid with editable titles, starring, pagination, status and sync iconography, and info-mode toggle.
- Added basic navigation/sidebar and header controls (UI only).

## Open gaps / next steps
- Hook real data sources or mock API layer; replace hard-coded `apps` with fetch + loading/error states.
- Wire search dropdown to filtering; add debounce; handle empty/no-results state.
- Connect top-level actions (new/sync/refresh) and per-card actions to actual behaviors.
- Improve accessibility: focus outlines, aria labels on buttons/inputs, keyboard navigation for cards and dropdown.
- Add tests (React Testing Library + Vitest) for card behaviors (title edit save/revert, starring/sorting, pagination bounds).
- Decide whether to remove unused `App.css` or migrate styles; clarify Tailwind usage since dependency exists but is unused.

## How to run locally
1) Install deps: `npm install`
2) Dev server: `npm run dev`
3) Lint: `npm run lint`
4) Tests: `npm run test` (no tests yet)

## Notes for security
- Snyk rule applies; run a Snyk code scan after introducing new code to ensure no issues (tool not run in this session).
