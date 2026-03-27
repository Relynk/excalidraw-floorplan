/**
 * @excalidraw/pid — P&ID symbol library, typed ports, and state engine.
 *
 * Usage:
 *
 * 1. Load the default symbol library into excalidraw:
 *    ```ts
 *    import { getDefaultPidLibrary } from "@excalidraw/pid";
 *    excalidrawAPI.updateLibrary({ libraryItems: getDefaultPidLibrary(), merge: true });
 *    ```
 *
 * 2. Apply real-time variable state to placed symbols:
 *    ```ts
 *    import { applyPidState } from "@excalidraw/pid";
 *    applyPidState({ "pump_01.status": "running", "TT_01.value": 87.5 }, excalidrawAPI);
 *    ```
 *
 * 3. Configure bindings on a placed symbol instance:
 *    ```ts
 *    import { setSymbolBindings } from "@excalidraw/pid";
 *    const updated = setSymbolBindings(api.getSceneElements(), symbolId, [
 *      { variableId: "pump_01.status", targetElementRole: "indicator",
 *        property: "backgroundColor",
 *        mapping: { running: "#22c55e", stopped: "#ef4444", fault: "#f97316" } },
 *    ]);
 *    api.updateScene({ elements: updated });
 *    ```
 */

// Type definitions
export type {
  PortType,
  PidPort,
  PidSymbolDefinition,
  PidElementTemplate,
  PidSymbolInput,
  PidVisualProps,
  PidSymbolContext,
  PidStateRenderer,
  PidStateRule,
  BindableProperty,
  VariableBinding,
  PidSymbolCustomData,
  PidElementCustomData,
  PidConnectionCustomData,
  ResolvedPort,
} from "./types";

export { PORT_TYPES } from "./types";

// Library integration
export type { LibraryItem } from "./library";
export { createLibraryItems, getDefaultPidLibrary } from "./library";

// Symbol definitions — re-export everything (individual symbols + registry)
export * from "./symbols/index";

// Port resolution
export {
  isPidSymbolElement,
  resolvePortPositions,
  getAllResolvedPorts,
  findNearestPort,
} from "./ports";

// State engine
export type { VariableValues, PidSceneApi } from "./state-engine";
export { applyPidState, setSymbolBindings } from "./state-engine";

// Connection tracking
export { updateConnectedPipes } from "./connections";
