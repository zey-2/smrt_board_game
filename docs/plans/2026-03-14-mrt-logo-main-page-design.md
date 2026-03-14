# MRT Logo Main Page Design

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Replace the current landing-page header logo with the user-provided MRT station logo PNG.

## Goal

Use the provided MRT station logo as the primary brand mark in the main page title banner.

## Confirmed Direction

- Replace the existing small SMRT logo in the landing header.
- Download the provided PNG into the repository and use it as a local asset.
- Keep the current title banner structure and map-themed layout.

## Implementation Shape

### Asset handling

- Store the downloaded image under `src/assets/smrt/`.
- Import the asset from `src/App.tsx` so Vite bundles it with the app.

### UI changes

- Swap the existing header logo import for the new MRT station logo.
- Update banner/logo styling only as needed so the new image renders cleanly without distortion.
- Preserve responsive behavior for the title banner on narrow screens.

### Testing

- Update the app-level test to assert the new landing-page logo alt text.
- Run targeted app tests, then run the full unit test suite and build verification.
