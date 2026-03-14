# Player Station Icons Design

## Goal

Allow each player to choose a simple line icon and a background colour during game setup so station cards can show a compact visual marker for players during gameplay.

## Current Context

`src/features/setup/SetupScreen.tsx` currently collects only player names and the shared end condition. `src/features/setup/setupValidation.ts` builds `Player` objects from those names.

`src/game/types.ts` defines `Player` without any appearance metadata. During gameplay, `src/features/game/BoardView.tsx` shows players on station cards as text pills containing player names, and `src/features/game/PlayerPanel.tsx` shows player names and stats without a shared token marker.

## Options

### Recommended: Store selected icon and colour on each player

Add two new player properties, one for icon id and one for background colour id, and let setup own the selection UI. Render the same token style anywhere the player needs a compact visual identity.

Trade-offs:
- Keeps configuration close to where players are created
- Makes board view and player panel rendering straightforward
- Avoids adding a second state store or derived mapping layer

### Alternative: Derive token appearance from player order

Assign fixed icon and colour pairs based on player index.

Trade-offs:
- Lowest implementation cost
- Removes user choice, so it does not satisfy the feature request

### Alternative: Store appearance in a separate player token registry

Keep `Player` minimal and introduce a separate structure for appearance metadata keyed by player id.

Trade-offs:
- More abstraction than the current app needs
- Adds lookup overhead in setup, board rendering, and tests
- No clear benefit while player setup remains local and simple

## Design

Extend the setup screen so every player row includes:

- a small fixed icon picker
- a small fixed background colour picker

The app will provide a fixed set of simple line icons and a fixed set of strong background colours from a shared module. Players choose both values only during setup. After the game starts, the appearance is read-only for the rest of the session.

Uniqueness is enforced on the icon and background colour combination, not on either field independently. Two players may share the same icon if their background colours differ, and may share the same background colour if their icons differ. The same exact pair may not be used twice.

Gameplay surfaces will render the player marker as a coloured badge containing only the selected icon:

- `BoardView` replaces the current text token pill with icon badges on station cards
- `PlayerPanel` shows the same badge next to each player name so the mapping stays obvious

## Architecture

Create one shared appearance module that exports:

- the fixed icon option list
- the fixed colour option list
- helper labels and identifiers used by setup, display components, and tests

`Player` in `src/game/types.ts` will gain `iconId` and `colorId` fields. Setup validation becomes responsible for confirming that every submitted icon and colour pair is unique before returning a successful result.

Board and sidebar rendering should use a shared presentational badge component or shared rendering helper so the icon treatment stays visually consistent across the app.

## Testing

Add coverage for:

- setup rendering the appearance controls for each player
- setup start payload including selected icon and colour ids
- validation rejecting duplicate icon and colour combinations
- board station cards rendering icon badges instead of player-name pills
- player panel rendering the same badge next to each player
