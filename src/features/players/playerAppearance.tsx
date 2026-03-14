interface PlayerIconOption {
  id: string;
  label: string;
  render: () => JSX.Element;
}

interface PlayerColorOption {
  id: string;
  label: string;
  background: string;
  foreground: string;
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.5" y="5.5" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function TriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.5 18.5 18H5.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 4.5 7.5 7.5-7.5 7.5-7.5-7.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export const PLAYER_ICON_OPTIONS: PlayerIconOption[] = [
  { id: "circle", label: "Circle", render: () => <CircleIcon /> },
  { id: "square", label: "Square", render: () => <SquareIcon /> },
  { id: "triangle", label: "Triangle", render: () => <TriangleIcon /> },
  { id: "diamond", label: "Diamond", render: () => <DiamondIcon /> }
];

export const PLAYER_COLOR_OPTIONS: PlayerColorOption[] = [
  { id: "navy", label: "Navy", background: "#1e3a5f", foreground: "#ffffff" },
  { id: "purple", label: "Purple", background: "#7c3aed", foreground: "#ffffff" },
  { id: "pink", label: "Pink", background: "#ec4899", foreground: "#ffffff" },
  { id: "cyan", label: "Cyan", background: "#0891b2", foreground: "#ffffff" }
];

export function getPlayerIconOption(iconId: string) {
  return PLAYER_ICON_OPTIONS.find((option) => option.id === iconId) ?? PLAYER_ICON_OPTIONS[0];
}

export function getPlayerColorOption(colorId: string) {
  return PLAYER_COLOR_OPTIONS.find((option) => option.id === colorId) ?? PLAYER_COLOR_OPTIONS[0];
}

interface PlayerIconGlyphProps {
  iconId: string;
  className?: string;
}

export function PlayerIconGlyph({ iconId, className = "" }: PlayerIconGlyphProps) {
  const icon = getPlayerIconOption(iconId);

  return <span className={className}>{icon.render()}</span>;
}

interface PlayerColorSwatchProps {
  colorId: string;
  className?: string;
}

export function PlayerColorSwatch({ colorId, className = "" }: PlayerColorSwatchProps) {
  const color = getPlayerColorOption(colorId);

  return <span className={className} style={{ backgroundColor: color.background }} />;
}

interface PlayerTokenBadgeProps {
  iconId: string;
  colorId: string;
  label: string;
  className?: string;
}

export function PlayerTokenBadge({
  iconId,
  colorId,
  label,
  className = ""
}: PlayerTokenBadgeProps) {
  const icon = getPlayerIconOption(iconId);
  const color = getPlayerColorOption(colorId);

  return (
    <span
      aria-label={label}
      className={className}
      role="img"
      style={{ backgroundColor: color.background, color: color.foreground }}
    >
      {icon.render()}
    </span>
  );
}
