# Personal Planner — Milestone 1 Status

Last updated: 2026-10-21 (Asia/Hong_Kong)

## Current goal

Complete Saved Places metadata editing for Personal Mode within Milestone 1, then await review. Milestone 1 scope: simplify TREK for private use, keep Plan as the default trip view, make Saved Places easy to reach and add to a specific day, retain map/itinerary synchronization and drag-and-drop, preserve mobile/PWA/offline behavior, and provide realistic Macau × Zhuhai test data.

## Completed work

- Added an opt-in Personal Mode on desktop and mobile settings.
- Simplified global navigation and dashboard in Personal Mode to emphasize Trips, Saved Places, Upcoming, and Archive.
- Kept Plan as the default trip tab; collaboration is presented as Notes and nonessential plugin/admin surfaces are hidden in Personal Mode.
- Added desktop and mobile Saved Place → Trip → Day selection.
- Made copy-to-day reuse an existing trip place, avoid duplicate day assignments, validate trip/day ownership, and append new assignments atomically.
- Extended saved places with area, favorite, priority, opening hours, and recommended dishes in shared contracts and SQLite.
- Added the warm cream/taupe/sage `journal` appearance scheme with light and dark tokens.
- Added localized Personal Mode and Journal labels for all supported languages, including Traditional Chinese.
- Added an idempotent REST importer and fixture for `Macau × Zhuhai 2026` (2026-10-31 to 2026-11-02), including the PLAVE booking, De Castle hotel, itinerary, checklists, budget, and all requested Macau/Zhuhai food lists.
- Made the fixture importer enable Collections automatically for an admin on a fresh instance; non-admin users now receive an actionable error instead of silently losing saved lists.
- Opened Draft PR [#1](https://github.com/eleanko/TREK/pull/1) against `main`. It remains a draft and has not been merged.
- Completed the requested desktop and iPhone-sized manual review in an isolated local review environment.

### Saved Places metadata editing — completed 2026-10-21

- Desktop and mobile place detail sheets now show and edit area, favorite, priority (none/low/medium/high), opening hours, and recommended dishes in Personal Mode.
- Reused the existing edit/save/cancel flow, Collections update API, permission checks, and desktop/mobile input styles. No API or database change was needed.
- Shared form controls and draft normalization keep desktop/mobile behavior consistent. Empty text saves as `null`; favorite `false` and priority `0` are sent explicitly so existing values can be cleared.
- Cancel restores persisted metadata; save failures retain the draft. Viewers can read metadata without gaining edit access.
- Added English and Traditional Chinese labels; other languages use the existing English fallback. Personal Mode off keeps the existing UI and excludes metadata from edit payloads.

## Files changed

- Metadata UI follow-up: `client/src/components/Collections/PlaceMetadata.tsx` (shared read/edit controls), `client/src/components/Collections/usePlaceMetadata.ts` (draft/reset/normalization), `client/src/components/Collections/CollectionPlaceDetail.tsx` (desktop integration), `client/src/mobile/screens/collections/MCollPlaceSheet.tsx` (mobile integration).
- Metadata regression tests: `client/src/components/Collections/CollectionPlaceDetail.test.tsx`, `client/tests/unit/mobile/collections/MCollPlaceSheet.test.tsx`.
- Metadata labels: `shared/src/i18n/en/collection.ts`, `shared/src/i18n/zh-TW/collection.ts`.
- Personal Mode and navigation: `client/src/utils/personalMode.ts`, `client/src/components/Layout/Navbar.tsx`, `client/src/components/Layout/navItems.ts`, `client/src/components/Layout/navItems.hook.test.tsx`, `client/src/components/Settings/DisplaySettingsTab.tsx`, `client/src/mobile/screens/settings/MSettingsGeneral.tsx`, `client/src/store/settingsStore.ts`, `client/src/types.ts`.
- Dashboard and trip shell: `client/src/pages/DashboardPage.tsx`, `client/src/mobile/screens/dashboard/MDashboard.tsx`, `client/src/styles/dashboard.css`, `client/src/pages/tripPlanner/useTripPlanner.ts`, `client/src/pages/tripPlanner/useTripPlanner.test.tsx`, `client/src/mobile/screens/trip/MTripShell.tsx`.
- Saved Place → day flow: `client/src/api/collections.ts`, `client/src/components/Collections/CopyToTripModal.tsx`, `client/src/components/Collections/CopyToTripModal.test.tsx`, `client/src/mobile/screens/collections/MCollTripPickerSheet.tsx`, `client/tests/unit/mobile/collections/MCollTripPickerSheet.test.tsx`, `client/src/pages/collections/useCollections.ts`, `client/src/store/collectionStore.ts`.
- Appearance: `shared/src/appearance/appearance.schema.ts`, `client/src/theme/schemes.ts`, `client/src/components/Settings/AppearanceSettingsTab.tsx`, `client/src/index.css`.
- Collections contracts and persistence: `shared/src/collection/collection.schema.ts`, `server/src/db/schema.ts`, `server/src/db/migrations.ts`, `server/src/nest/collections/collections.service.ts`, `server/tests/unit/nest/collections.service.test.ts`.
- Fixture/importer: `scripts/fixtures/macau-zhuhai-2026.json`, `scripts/import-personal-trip.mjs`, `package.json`.
- Review record: `review-artifacts/personal-planner-m1/manual-review-results.json` and the screenshots in `review-artifacts/personal-planner-m1/`.
- Ongoing handoff: `PROJECT_STATUS.md`.
- Settings translations: `shared/src/i18n/{ar,br,ca,cs,de,en,es,fr,gr,hu,id,it,ja,ko,nl,pl,ru,sv,tr,uk,vi,zh,zh-TW}/settings.ts`.

## Tests run and results

Latest metadata UI session (focused checks only):

- `npm exec --workspace=client -- vitest run src/components/Collections/CollectionPlaceDetail.test.tsx tests/unit/mobile/collections/MCollPlaceSheet.test.tsx --reporter=dot`: **102 tests passed** in 2 suites, including 12 new metadata tests covering save/trim, cancel, read-only display, clearing persisted values, failure retention, and Traditional Chinese labels across desktop/mobile.
- ESLint on the six changed client implementation/test files: passed with zero warnings and zero errors.
- `git diff --check`: passed.
- Rebuilt shared translation output so runtime locale imports include the new labels. No full application build or broad test suite was run this session.
- This session used component tests; the screenshots below record the previous Milestone 1 browser review and do not show the new metadata controls.

Earlier Milestone 1 validation:

- `npm run build`: passed for shared, server, and client; PWA service worker generated.
- Shared appearance/collection schema suites: 31 tests passed.
- Server Collections unit/controller/integration suites: 121 tests passed.
- Client Milestone regression selection: 374 tests passed.
- Focused Personal Mode navigation/trip-planner suites: 163 tests passed.
- Focused desktop/mobile copy-to-day suites: 30 tests passed.
- Shared, server, and client TypeScript checks: passed.
- Strict i18n parity, client page-pattern check, theme lint, and fixture contract validation: passed.
- Server and client ESLint completed with zero errors; the repository still reports existing warnings.
- Live importer run: passed twice against a fresh isolated SQLite instance; the second run completed without duplicating fixture-owned records. Collections were enabled and all three saved lists were imported.
- Desktop Personal Mode: passed at 1440×1000; Trips, Saved Places, Upcoming Reservations, and Archive were visible in Traditional Chinese.
- iPhone layout: passed at 390×844 for both the Personal Mode dashboard and trip itinerary; no visible clipping or unintended horizontal overflow was found.
- Saved Place → Add to day: passed by copying `篤篤小食區` into Day 1 and confirming it through the trips API.
- Map/itinerary synchronization: passed in both directions. Selecting `The Londoner Arena` opened its inspector and expanded the matching marker to 44 px; clicking a map marker selected the corresponding itinerary row.
- Fixture verification: passed for 2026-10-31 through 2026-11-02, 3 days, 11 itinerary places after the copy test, 2 reservations, 3 collections, and 21 saved places.
- Importer syntax check and `git diff --check`: passed after the Collections bootstrap fix.

### Manual review artifacts

- [Desktop Personal Mode](review-artifacts/personal-planner-m1/desktop-personal-mode.png)
- [Saved Place → Add to day](review-artifacts/personal-planner-m1/saved-place-add-to-day.png)
- [Map/itinerary synchronization](review-artifacts/personal-planner-m1/map-itinerary-selection.png)
- [iPhone Personal Mode dashboard](review-artifacts/personal-planner-m1/mobile-personal-mode.png)
- [iPhone trip itinerary](review-artifacts/personal-planner-m1/mobile-trip-plan.png)
- [Machine-readable results](review-artifacts/personal-planner-m1/manual-review-results.json)

## Known issues / risks

- The cloud review environment blocks public map/routing, weather, and exchange-rate endpoints. The map canvas therefore appears without its external base tiles and the dashboard cannot fetch live exchange rates, while local marker rendering and map/itinerary selection still work. These are environment egress limitations rather than observed application regressions.
- The browser console reports an existing React `key` warning from `DayPlanSidebar` while rendering the itinerary. It did not affect the reviewed selection, copy, or mobile flows, but should be cleaned up separately.
- The repository-wide shared lint/format task currently reports pre-existing Prettier debt outside this milestone.
- Metadata controls are scoped to Personal Mode. No new browser screenshot pass was performed for this follow-up; desktop/mobile rendering and behavior are covered by the focused component suites.
- Personal Mode is opt-in to preserve upstream-compatible default behavior. The fixture importer enables it for the importing user.

## Remaining tasks

- Review the completed metadata editing UI and address user feedback.
- Keep this file and the Draft PR description current after each meaningful increment.
- Keep Draft PR #1 unmerged until explicit user direction.

## Important design decisions

- Personal Mode changes presentation and navigation only; it does not weaken authentication or authorization.
- Existing map selection, routing, drag-and-drop, offline storage, and PWA architecture were retained.
- Database changes use an additive idempotent migration; existing collection records remain valid.
- Copy-to-day reuses TREK's existing place matching strategies and performs assignment writes in one transaction.
- Metadata editing reuses the existing Collections update contract and preserves normal Collections behavior when Personal Mode is off.
- Real-trip content is isolated in a fixture/import script rather than hardcoded into application logic.

## Anything that needs user approval

- No outstanding metadata scope decision: the user authorized and the implementation completes all five metadata fields.
- Review Draft PR #1 before it is marked ready for review. Do not merge it yet.
