# TravelBuddy Web

Frontend for TravelBuddy built with React, TypeScript and Vite.

## Community E2E

Playwright E2E tests for the community module live in `tests/e2e/community.spec.ts`.

Covered scenarios:

- creating a publication and checking that it appears in the feed
- verifying the selected transport on the post card
- verifying the selected trip date on the post card
- adding a comment and checking that it appears in the UI
- clicking the share button and checking for an observable UI result

## Regression Scenarios

Three tests are intentionally kept as regression tests and may fail until the
current product defects are fixed:

- `Транспорт публикации...`
  The post card shows a different transport than the one selected in the creation form.
- `Дата поездки...`
  The selected trip date is not shown on the post card after publication.
- `Кнопка "Поделиться"...`
  The share button click currently does not produce an observable UI result.

The tests remain unchanged to document current defects without changing
application business logic.

## How To Run

1. Install frontend dependencies:

```bash
npm install
```

2. Install Playwright runtime dependencies on a fresh machine or CI runner:

```bash
npx playwright install chromium ffmpeg
```

3. Run the E2E suite:

```bash
npm run test:e2e
```

Additional commands:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

## Execution Notes

- Playwright starts the local Vite dev server automatically through `webServer`
  unless `PLAYWRIGHT_BASE_URL` is provided.
- Local retries are `0`.
- In CI, retries are `1`, so `trace` and `video` are recorded on the first retry.
- Screenshots are recorded on every failure.

## Artifacts

Failure artifacts are stored here:

- `test-results/`:
  screenshots, traces, videos and error context
- `playwright-report/`:
  HTML report for local inspection

Open the HTML report after a run:

```bash
npm run test:e2e:report
```
