# Snapping

## Files

| File | Purpose |
| --- | --- |
| `packages/excalidraw/snapping.ts` | All snap logic — types, cache, computation, export |
| `packages/excalidraw/components/App.tsx` | Calls snap functions; manages `originSnapOffset` state |
| `packages/math/src/segment.ts` | `closestPointOnSegment` used by segment snapping |

## Key Constants

```ts
const SNAP_DISTANCE = 8; // px at zoom 1
const PORT_SNAP_MULTIPLIER = 2.5; // ports get a 2.5× larger snap radius
```

`getSnapDistance(zoomValue)` adjusts `SNAP_DISTANCE` for current zoom.

## Snap Types

| Type              | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `PointSnap`       | Aligns element corners/vertices to reference corners |
| `GapSnap`         | Distributes equal spacing between elements           |
| `PointerSnapLine` | Used during freehand drawing (room/pipe tools)       |

## SnapCache

Static singleton (`packages/excalidraw/snapping.ts:133`). Stores reference snap points and visible gaps across a drag/draw session.

- Populated at drag start via `SnapCache.setReferenceSnapPoints()` / `SnapCache.setVisibleGaps()`
- Destroyed on pointer-up via `SnapCache.destroy()`
- During room-freedraw/pipe-draw the cache is lazily populated per pointer-move (cleared on pointer-up)

## Main Exported Functions

### `snapDraggedElements` — dragging existing elements

Called when moving selected elements. Returns `{ snapOffset, snapLines }`.

### `snapResizingElements` — resize handles

Called during resize. Snaps the active handle corner only.

### `snapNewElement` — drawing new shapes

Called for rectangle/ellipse/etc. as they are first placed.

### `snapLinearElementPoint` — point-by-point drawing (room/pipe tools)

`packages/excalidraw/snapping.ts:1514`

Priority order:

1. **Port snap** — P&ID symbol ports within `snapDistance × 2.5`. Returns `snappedPort: ResolvedPort` so callers can write connection metadata.
2. **Segment snap** — foot point on any linear element's segments (Euclidean distance).
3. **Corner/axis snap** — nearest corner or edge midpoint aligned on X or Y independently.

Returns `{ snapOffset, snapLines, snappedPort }`.

### `getSnapLinesAtPointer` — pointer hover (non-drawing)

`packages/excalidraw/snapping.ts:1376`

Same priority as `snapLinearElementPoint` but for cursor position — updates `originSnapOffset` in app state so the first vertex of a new room/pipe starts on a snapped position.

### `isActiveToolLinearSnappable`

`packages/excalidraw/snapping.ts:1715`

Returns `true` for `"room-freedraw"` and `"pipe-draw"`. Gating check used in App.tsx pointer-move handler.

## Port Snapping Integration

Port positions are injected into `getElementsCorners` at `snapping.ts:353` for standard snap tools. For `snapLinearElementPoint` ports are checked via `getAllResolvedPorts` + `findNearestPort` from `packages/pid/src/ports.ts`.

A typed line (`activePipeType !== null`) only snaps to ports whose `acceptsTypes` includes the pipe type.

## Enabling Snapping

`objectsSnapModeEnabled` defaults to `true` (`packages/excalidraw/appState.ts`).

- Hold `Ctrl/Cmd` to temporarily invert snap state.
- Arrows never snap (they use the binding system instead).

## Adding a New Tool to Snapping

1. Add the tool's type to `isActiveToolLinearSnappable` (for drawing) or `isActiveToolNonLinearSnappable` (for placement).
2. In the pointer-move handler in App.tsx, gate the snap call behind `isActiveToolLinearSnappable`.
3. Pass `referenceElements` excluding the element being drawn to avoid self-snapping.
