# P&ID Symbols

## Package

`packages/pid/` — standalone `@excalidraw/pid` package. No dependency on `@excalidraw/excalidraw`; depends only on `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/common`.

## Files

| File | Purpose |
| --- | --- |
| `packages/pid/src/types.ts` | All type definitions |
| `packages/pid/src/symbols/valves.ts` | Valve symbol definitions |
| `packages/pid/src/symbols/pumps.ts` | Pump/compressor symbol definitions |
| `packages/pid/src/symbols/instruments.ts` | Instrument symbol definitions |
| `packages/pid/src/symbols/index.ts` | `ALL_PID_SYMBOLS`, `PID_SYMBOLS_BY_CATEGORY` |
| `packages/pid/src/library.ts` | `createLibraryItems`, `getDefaultPidLibrary` |
| `packages/pid/src/ports.ts` | Port resolution: `resolvePortPositions`, `getAllResolvedPorts`, `findNearestPort` |
| `packages/pid/src/state-engine.ts` | `applyPidState`, `setSymbolBindings` |
| `packages/pid/src/connections.ts` | `updateConnectedPipes` |
| `packages/pid/src/index.ts` | Public API re-exports |

## Symbol Definition

```ts
interface PidSymbolDefinition {
  id: string; // e.g. "valve-gate"
  name: string; // display name in library
  category: string; // e.g. "Valves"
  elements: PidElementTemplate[];
  ports: PidPort[];
}
```

`PidElementTemplate` mirrors Excalidraw element fields but with relative coordinates. The `role` field (`"body"`, `"indicator"`, `"label"`, `"value"`) is used by the state engine to target sub-elements.

## Adding a New Symbol

1. Define a `PidSymbolDefinition` in the appropriate file under `packages/pid/src/symbols/`.
2. Export it and add it to `ALL_PID_SYMBOLS` in `packages/pid/src/symbols/index.ts`.
3. That's it — `getDefaultPidLibrary()` picks it up automatically.

## Port Definition

```ts
interface PidPort {
  id: string;
  label: string;
  acceptsTypes: PortType[]; // e.g. ["pipe", "steam-pipe"]
  // Position (choose one):
  x?: number; // absolute px offset from body bbox origin (preferred)
  y?: number;
  relativeX: number; // 0–1 fraction of full group bbox (fallback)
  relativeY: number;
}
```

Use `x`/`y` (body-relative px) when the symbol has decorators (stems, labels) outside the body that would skew `relativeX/Y`. The body bbox is the bounding box of all elements whose `role` starts with `"body"`.

## customData on Canvas Elements

**Symbol root element** (`pidSymbol: true`):

```ts
{
  pidSymbol: true,
  symbolId: string,
  ports: PidPort[],
  bindings?: VariableBinding[],
}
```

**Each sub-element**:

```ts
{
  pidElementRole: string,   // e.g. "body", "indicator"
  pidRootId: string,        // element.id of the root
}
```

Detect a symbol root: `isPidSymbolElement(el)` from `packages/pid/src/ports.ts`.

## Port Resolution

`resolvePortPositions(rootElement, allElements)` — returns `ResolvedPort[]` with absolute canvas `x`/`y`, applying element rotation. Group rotation is applied around the group bbox centre.

## Loading Library

```ts
import { getDefaultPidLibrary } from "@excalidraw/pid";
excalidrawAPI.updateLibrary({
  libraryItems: getDefaultPidLibrary(),
  merge: true,
});
```

## State Engine

`applyPidState(variableValues, api)` — batch update. Iterates all placed symbols, resolves bindings, and calls `api.updateScene()` once.

`setSymbolBindings(allElements, symbolId, bindings)` — returns a new elements array with updated bindings on the target symbol (caller calls `updateScene`).

Bindable properties: `strokeColor`, `backgroundColor`, `opacity`, `visible`, `text`.

The `visible` property writes `customData.pidHidden = true/false`, which is checked in `packages/excalidraw/element/src/renderElement.ts`.

## PORT_TYPES constants

```ts
import { PORT_TYPES } from "@excalidraw/pid";
PORT_TYPES.PIPE; // "pipe"
PORT_TYPES.STEAM_PIPE; // "steam-pipe"
PORT_TYPES.ELECTRICAL_24V;
PORT_TYPES.SIGNAL_4_20MA;
PORT_TYPES.INSTRUMENT_AIR;
```

Custom types are any string — no registry needed.
