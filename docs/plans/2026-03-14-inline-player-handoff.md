# Inline Player Handoff Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the blocking pass-device modal with a non-modal inline handoff card that requires the next player to click `Start Turn`.

**Architecture:** Keep turn state in the reducer unchanged and manage the handoff gate as local UI state in `GameScreen`. Move the handoff presentation into `TurnControls` so the gameplay actions are hidden until the next player explicitly proceeds.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library

---

**Skill references for implementation:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Replace modal expectations with inline handoff tests

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/features/game/PassDeviceOverlay.test.tsx`
- Read for context: `src/features/game/GameScreen.tsx`
- Read for context: `src/features/game/TurnControls.tsx`

**Step 1: Write the failing test**

Add a `GameScreen` interaction test that clicks `End Turn` from a `turn_end` state and expects:
- inline text `Pass device to <next player>`
- a `Start Turn` button
- normal turn controls hidden during the handoff state

Update or replace the old overlay test so it no longer expects a dialog or `Continue` button.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: FAIL because the UI still renders the modal overlay flow.

**Step 3: Write minimal implementation**

Implement only enough behavior to render the inline handoff state and remove the popup expectation.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: PASS

### Task 2: Move handoff rendering into turn controls

**Files:**
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/features/game/TurnControls.tsx`
- Modify: `src/styles.css`
- Delete: `src/features/game/PassDeviceOverlay.tsx`
- Delete or repurpose: `src/features/game/PassDeviceOverlay.test.tsx`

**Step 1: Use the failing tests from Task 1**

Keep the UI regression active while changing the render path.

**Step 2: Write minimal implementation**

Pass the local handoff gate and callbacks from `GameScreen` into `TurnControls`.

Render a compact inline handoff card in the controls panel with the player name, reminder copy, and `Start Turn` button.

Remove the overlay component and its CSS.

**Step 3: Run targeted verification**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

### Task 3: Verify the changed handoff surface

**Files:**
- Test: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/PassDeviceOverlay.test.tsx` if retained

**Step 1: Run final targeted verification**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: PASS
