# Pipe Draw Tool (P&ID Connections)

## Files

| File | Purpose |
| --- | --- |
| `packages/common/src/constants.ts:467` | Tool type constant `"pipe-draw"` |
| `packages/excalidraw/components/shapes.tsx:129` | Toolbar registration |
| `packages/excalidraw/types.ts:163` | Union type for `activeTool.type` |
| `packages/excalidraw/components/App.tsx:336` | `isPipeElement` local guard + all pointer handling |
| `packages/excalidraw/actions/actionFinalize.tsx:244` | End-port detection on finalize |
| `packages/excalidraw/renderer/renderPortIndicators.ts` | Port dot rendering |
| `packages/pid/src/connections.ts` | `updateConnectedPipes` — moves pipe endpoints when symbols drag |

## How It Works

The pipe-draw tool draws an open multi-point `line` element. It is identical to the room-freedraw tool except:

- It never closes into a polygon.
- It writes `PidConnectionCustomData` to `customData` to record which P&ID ports the endpoints are connected to.
- Port indicator dots are rendered over all symbol ports while the tool is active.

### customData on a pipe line element

```ts
{
  pipeTool: "pipe-draw",   // identifies as pipe element
  pidConnection: {
    pipeType: PortType,                          // inherited from first connected port
    startPort?: { elementId: string; portId: string },
    endPort?:   { elementId: string; portId: string },
  }
}
```

`pipeType` is inherited from the first port touched. Once set, only ports with a compatible `acceptsTypes` are shown as snap targets.

### Connection write points in App.tsx

| When | Location | What |
| --- | --- | --- |
| Draw start snaps to port | ~`App.tsx:9385` | `customData.pidConnection.startPort` written |
| Each pointer-down during draw | ~`App.tsx:9194` | If pointer is on a port: writes `endPort`, calls `actionFinalize` |
| `actionFinalize` | `actionFinalize.tsx:284` | Last-point port detection; writes `endPort` if within snap distance |

### Port indicator rendering

`renderPortIndicators` (`renderer/renderPortIndicators.ts`) is called from the interactive canvas render loop.

- Active when `pipe-draw` tool is selected **or** a pipe element is selected/being edited.
- Hollow teal circle = connectable port (untyped tool).
- Hollow blue circle = connectable port (typed pipe selected).
- Filled + white ring = currently snapping to this port.

`shouldShowPortIndicators(appState, allElements)` is the gate — returns `{ show, pipeType }`.

## Connected Pipe Dragging

`updateConnectedPipes` (`packages/pid/src/connections.ts:72`).

Called in App.tsx at ~`App.tsx:5180` (during drag) and ~`App.tsx:10303` (keyboard move).

**Key rule**: pass the total offset from drag-start (same as `updateElementCoords`), not a per-frame delta. Pass `originalElements` from `pointerDownState.originalElements`. For keyboard moves, pass `null`.

When a symbol moves by `(dx, dy)`:

- If `moveStart && moveEnd`: moves the whole pipe (`element.x + dx`).
- If `moveStart` only: moves `element.x/y` and inverse-shifts all other local points so they stay put.
- If `moveEnd` only: shifts the last local point by `(dx, dy)`.

`simultaneouslyUpdated` (Set of element ids) prevents double-moving when both the pipe and its connected symbol are selected together.

## Identifying Pipe Elements

```ts
// App.tsx local guard (not exported):
const isPipeElement = (el) => typeof el.customData?.pipeTool === "string";

// To check connection data:
import type { PidConnectionCustomData } from "@excalidraw/pid";
const conn = (el.customData as PidConnectionCustomData | undefined)
  ?.pidConnection;
```

## Adding a New Pipe Type

1. Add a constant to `PORT_TYPES` in `packages/pid/src/types.ts` (optional, any string works).
2. Add the new type to `acceptsTypes` on the relevant ports in the symbol definitions.
3. No other changes needed — the typed filtering is automatic in `getAllResolvedPorts`.
