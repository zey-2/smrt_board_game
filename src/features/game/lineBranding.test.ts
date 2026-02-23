import { describe, expect, test } from "vitest";
import {
  getLineBadge,
  getLineLabel,
  getLineThemeClass
} from "./lineBranding";

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
});
