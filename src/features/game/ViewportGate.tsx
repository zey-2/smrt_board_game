import { useEffect, useState } from "react";

export const PHONE_MAX_VIEWPORT_EDGE = 599;
export const MIN_SUPPORTED_GAME_WIDTH = 901;
export const MIN_SUPPORTED_GAME_HEIGHT = 600;

export interface ViewportSupport {
  width: number;
  height: number;
  isPhone: boolean;
  isLandscape: boolean;
  isLargeEnough: boolean;
  isSupported: boolean;
}

function readViewport() {
  if (typeof window === "undefined") {
    return {
      width: 1280,
      height: 800
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export function evaluateViewportSupport({
  width,
  height
}: {
  width: number;
  height: number;
}): ViewportSupport {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const shortestEdge = Math.min(safeWidth, safeHeight);
  const isPhone = shortestEdge <= PHONE_MAX_VIEWPORT_EDGE;
  const isLandscape = safeWidth >= safeHeight;
  const isLargeEnough =
    safeWidth > MIN_SUPPORTED_GAME_WIDTH - 1 && safeHeight >= MIN_SUPPORTED_GAME_HEIGHT;

  return {
    width: safeWidth,
    height: safeHeight,
    isPhone,
    isLandscape,
    isLargeEnough,
    isSupported: !isPhone && isLandscape && isLargeEnough
  };
}

export const DEFAULT_VIEWPORT_SUPPORT = evaluateViewportSupport({
  width: 1280,
  height: 800
});

export function useViewportSupport() {
  const [viewportSupport, setViewportSupport] = useState<ViewportSupport>(() =>
    evaluateViewportSupport(readViewport())
  );

  useEffect(() => {
    const syncViewportSupport = () => {
      setViewportSupport(evaluateViewportSupport(readViewport()));
    };

    syncViewportSupport();
    window.addEventListener("resize", syncViewportSupport);
    window.addEventListener("orientationchange", syncViewportSupport);

    return () => {
      window.removeEventListener("resize", syncViewportSupport);
      window.removeEventListener("orientationchange", syncViewportSupport);
    };
  }, []);

  return viewportSupport;
}

interface ViewportGateNoticeProps {
  viewportSupport: ViewportSupport;
  isBlocking?: boolean;
}

export function ViewportGateNotice({
  viewportSupport,
  isBlocking = false
}: ViewportGateNoticeProps) {
  const messages: string[] = [];

  if (viewportSupport.isPhone) {
    messages.push("SMRT Monopoly works best on desktop or tablet.");
  }

  if (!viewportSupport.isLandscape) {
    messages.push("Rotate to landscape before continuing.");
  }

  if (viewportSupport.isLandscape && !viewportSupport.isLargeEnough) {
    messages.push(
      "Use a larger screen or enlarge your browser window to view the full 25-station board cleanly."
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="card viewport-notice-card" aria-live="polite">
      <div className="viewport-notice-header">
        <h2>{isBlocking ? "Supported Landscape Screen Required" : "Screen Guidance"}</h2>
        <p>
          The game board stays fixed at 25 stations and will appear automatically once this screen
          supports the full layout.
        </p>
      </div>
      <ul className="viewport-notice-list">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  );
}
