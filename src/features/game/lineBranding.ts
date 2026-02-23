import nslBadge from "../../assets/smrt/line-nsl.svg";
import ewlBadge from "../../assets/smrt/line-ewl.svg";
import cclBadge from "../../assets/smrt/line-ccl.svg";
import telBadge from "../../assets/smrt/line-tel.svg";
import bplrtBadge from "../../assets/smrt/line-bplrt.svg";
import type { SmrtLine } from "../../game/types";

interface LineBranding {
  badge: string;
  label: string;
  themeClass: string;
}

const LINE_BRANDING: Record<SmrtLine, LineBranding> = {
  NSL: {
    badge: nslBadge,
    label: "North South Line",
    themeClass: "line-theme-nsl"
  },
  EWL: {
    badge: ewlBadge,
    label: "East West Line",
    themeClass: "line-theme-ewl"
  },
  CCL: {
    badge: cclBadge,
    label: "Circle Line",
    themeClass: "line-theme-ccl"
  },
  TEL: {
    badge: telBadge,
    label: "Thomson-East Coast Line",
    themeClass: "line-theme-tel"
  },
  BPLRT: {
    badge: bplrtBadge,
    label: "Bukit Panjang LRT",
    themeClass: "line-theme-bplrt"
  }
};

export function getLineBadge(line: SmrtLine): string {
  return LINE_BRANDING[line].badge;
}

export function getLineLabel(line: SmrtLine): string {
  return LINE_BRANDING[line].label;
}

export function getLineThemeClass(line: SmrtLine): string {
  return LINE_BRANDING[line].themeClass;
}
