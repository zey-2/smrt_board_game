import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import {
  getLineBadge,
  getLineLabel,
  getLineThemeClass
} from "./lineBranding";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const STYLES_PATH = resolve(TEST_DIR, "../../styles.css");
const TEL_BADGE_PATH = resolve(TEST_DIR, "../../assets/smrt/line-tel.svg");

describe("lineBranding", () => {
  test("returns local badge paths for every supported SMRT line", () => {
    expect(getLineBadge("NSL")).toContain("line-nsl");
    expect(getLineBadge("EWL")).toContain("line-ewl");
    expect(getLineBadge("CCL")).toContain("line-ccl");
    expect(getLineBadge("TEL")).toContain("line-tel");
    expect(getLineBadge("BPLRT")).toContain("line-bplrt");
  });

  test("maps line code to readable label and theme class", () => {
    expect(getLineLabel("NSL")).toBe("North South Line");
    expect(getLineThemeClass("NSL")).toBe("line-theme-nsl");
    expect(getLineThemeClass("EWL")).toBe("line-theme-ewl");
  });

  test("uses the official brown Thomson-East Coast Line colour token and badge fill", () => {
    const styles = readFileSync(STYLES_PATH, "utf8");
    const telBadge = readFileSync(TEL_BADGE_PATH, "utf8");

    expect(styles).toContain("--line-tel: #9D5B25;");
    expect(telBadge).toContain('fill="#9D5B25"');
  });
});
