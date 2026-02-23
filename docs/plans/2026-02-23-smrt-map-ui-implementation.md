# SMRT Map UI Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the game interface to a faithful SMRT-map visual theme with local branding assets and line-color-driven UI accents.

**Architecture:** Keep all game logic unchanged and implement a presentation-only refactor. Add local SVG assets and a small branding mapping module, then consume that mapping across setup/game/result components. Drive styling through CSS variables and line-specific utility classes for consistency and maintainability.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, Playwright, CSS

---

**Skill references for execution:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Add local SMRT branding assets

**Files:**
- Create: `src/assets/smrt/smrt-logo.svg`
- Create: `src/assets/smrt/line-nsl.svg`
- Create: `src/assets/smrt/line-ewl.svg`
- Create: `src/assets/smrt/line-ccl.svg`
- Create: `src/assets/smrt/line-tel.svg`
- Create: `src/assets/smrt/line-bplrt.svg`
- Test: `src/features/game/lineBranding.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { getLineBadge } from "./lineBranding";

describe("line branding assets", () => {
  test("returns a local badge path for each SMRT line", () => {
    expect(getLineBadge("NSL")).toContain("line-nsl");
    expect(getLineBadge("EWL")).toContain("line-ewl");
    expect(getLineBadge("CCL")).toContain("line-ccl");
    expect(getLineBadge("TEL")).toContain("line-tel");
    expect(getLineBadge("BPLRT")).toContain("line-bplrt");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/lineBranding.test.ts`  
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

```svg
<!-- src/assets/smrt/line-nsl.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="28" fill="#d42f2f" />
  <text x="32" y="37" text-anchor="middle" font-size="16" fill="#fff">NS</text>
</svg>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/lineBranding.test.ts`  
Expected: PASS (all line assets mapped).

**Step 5: Commit**

```bash
git add src/assets/smrt/*.svg src/features/game/lineBranding.test.ts
git commit -m "feat: add local SMRT branding assets"
```

### Task 2: Add line-branding mapping helper

**Files:**
- Create: `src/features/game/lineBranding.ts`
- Test: `src/features/game/lineBranding.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { getLineThemeClass, getLineLabel } from "./lineBranding";

describe("lineBranding", () => {
  test("maps line code to label and css class", () => {
    expect(getLineLabel("NSL")).toBe("North South Line");
    expect(getLineThemeClass("NSL")).toBe("line-theme-nsl");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/lineBranding.test.ts -t "maps line code"`  
Expected: FAIL with missing exports.

**Step 3: Write minimal implementation**

```ts
import nslBadge from "../../assets/smrt/line-nsl.svg";

const BRANDING = {
  NSL: { label: "North South Line", badge: nslBadge, className: "line-theme-nsl" }
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/lineBranding.test.ts`  
Expected: PASS after adding all line entries.

**Step 5: Commit**

```bash
git add src/features/game/lineBranding.ts src/features/game/lineBranding.test.ts
git commit -m "feat: add line branding mapping utility"
```

### Task 3: Refactor global styles to SMRT map theme

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render } from "@testing-library/react";
import App from "./App";

test("applies map theme shell class", () => {
  const { container } = render(<App />);
  expect(container.querySelector(".map-theme-shell")).toBeTruthy();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx -t "map theme shell class"`  
Expected: FAIL with missing class.

**Step 3: Write minimal implementation**

```css
:root {
  --line-nsl: #d42f2f;
  --line-ewl: #2e9f4f;
  --line-ccl: #f0a11a;
  --line-tel: #8a4fa8;
  --line-bplrt: #7d8f52;
  --map-bg: #f5f7fb;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx -t "map theme shell class"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/styles.css src/App.test.tsx
git commit -m "style: apply SMRT map theme tokens and shell styling"
```

### Task 4: Update app shell and setup screen branding

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/setup/SetupScreen.tsx`
- Test: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("renders SMRT logo in setup shell", () => {
  render(<App />);
  expect(screen.getByAltText("SMRT")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx -t "SMRT logo in setup shell"`  
Expected: FAIL with missing image element.

**Step 3: Write minimal implementation**

```tsx
import smrtLogo from "./assets/smrt/smrt-logo.svg";
<img src={smrtLogo} alt="SMRT" className="smrt-logo" />
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`  
Expected: PASS and existing vote flow tests remain green.

**Step 5: Commit**

```bash
git add src/App.tsx src/features/setup/SetupScreen.tsx src/features/setup/SetupScreen.test.tsx
git commit -m "feat: add SMRT-branded setup shell"
```

### Task 5: Theme board tiles with line rail and badges

**Files:**
- Modify: `src/features/game/BoardView.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("renders line badge on station tiles", () => {
  render(<GameScreen initial={initialState} diceValueProvider={() => 3} />);
  expect(screen.getAllByAltText(/line badge/i).length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "line badge on station tiles"`  
Expected: FAIL with missing badges.

**Step 3: Write minimal implementation**

```tsx
const branding = getLineBranding(tile.line);
<li className={`board-tile ${branding.className}`}>
  <img src={branding.badge} alt={`${tile.line} line badge`} />
</li>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`  
Expected: PASS including existing turn-phase test.

**Step 5: Commit**

```bash
git add src/features/game/BoardView.tsx src/features/game/GameScreen.test.tsx
git commit -m "feat: add line-colored station rails and badges"
```

### Task 6: Theme player panel and turn controls

**Files:**
- Modify: `src/features/game/PlayerPanel.tsx`
- Modify: `src/features/game/TurnControls.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("highlights active player with service indicator", () => {
  render(<GameScreen initial={initialState} />);
  expect(screen.getByText("Player 1").closest("li")).toHaveClass("active-player");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "service indicator"`  
Expected: FAIL due to missing updated class semantics.

**Step 3: Write minimal implementation**

```tsx
<li className={`player-card ${isActive ? "active-player service-running" : ""}`}>...</li>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`  
Expected: PASS with no regressions.

**Step 5: Commit**

```bash
git add src/features/game/PlayerPanel.tsx src/features/game/TurnControls.tsx src/features/game/GameScreen.test.tsx
git commit -m "style: refresh player and controls with transit panel theme"
```

### Task 7: Theme winner screen and status header

**Files:**
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/features/results/WinnerScreen.tsx`
- Test: `src/features/results/WinnerScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("shows service summary heading", () => {
  render(<WinnerScreen winnerName="Player 2" ranking={[...]} />);
  expect(screen.getByText("Service Summary")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/results/WinnerScreen.test.tsx -t "Service Summary"`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
<h3>Service Summary</h3>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/results/WinnerScreen.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/game/GameScreen.tsx src/features/results/WinnerScreen.tsx src/features/results/WinnerScreen.test.tsx
git commit -m "feat: style winner and status sections as service summary board"
```

### Task 8: Full verification and docs update

**Files:**
- Modify: `README.md`
- Modify: `docs/game-rules-v1.md`

**Step 1: Write the failing test**

```bash
npm run lint && npm run test && npm run build
```

Expected: FAIL before final selector or style adjustments.

**Step 2: Run test to verify it fails**

Run: `npm run lint && npm run test && npm run build`  
Expected: at least one failure before cleanup.

**Step 3: Write minimal implementation**

```md
### UI Theme
- Faithful SMRT map palette and local line badges
```

**Step 4: Run test to verify it passes**

Run: `npm run lint && npm run test && npm run build && PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers npm run test:e2e -- tests/e2e/pass-and-play.spec.ts`  
Expected: all PASS.

**Step 5: Commit**

```bash
git add README.md docs/game-rules-v1.md
git commit -m "docs: update runbook with SMRT map theme UI details"
```
