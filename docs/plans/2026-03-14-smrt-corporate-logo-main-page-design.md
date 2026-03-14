# SMRT Corporate Logo Main Page Design

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Replace the current main-page header logo with a cropped wide SMRT corporate logo based on the user-provided image.

## Goal

Use the attached SMRT logo as the main-page brand mark in its natural wide footprint.

## Confirmed Direction

- Replace the current square MRT station logo in the title banner.
- Crop out the white border from the provided image.
- Do not force the new logo into a square footprint.
- Keep the existing header structure and responsive layout.

## Implementation Shape

### Asset handling

- Store a local cropped SMRT logo asset under `src/assets/smrt/`.
- Prefer a local vector or transparent-background asset matching the attached image so the banner can render crisply.

### UI changes

- Update `src/App.tsx` to use the new SMRT logo asset.
- Keep the image inline with the title text on desktop.
- Update `src/styles.css` so the logo uses a wide responsive footprint with preserved aspect ratio and clean stacking on mobile.

### Testing

- Update the app-level test to assert the new SMRT logo alt text.
- Run focused app tests, then the full test suite and production build.
