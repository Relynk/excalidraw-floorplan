/**
 * P&ID State Engine
 *
 * Maps external variable values (from SCADA, OPC-UA, WebSocket, etc.) to
 * visual property changes on P&ID symbols placed on the canvas.
 *
 * Usage:
 *   // On initial mount, or whenever new data arrives:
 *   applyPidState({ "pump_01.status": "running", "TT_01.value": 87.5 }, api);
 *
 * The state engine is completely data-source agnostic — the host app is
 * responsible for obtaining variable values and calling applyPidState.
 */
import type {
  ExcalidrawElement,
  ExcalidrawTextElement,
} from "@excalidraw/element/types";
import { syncInvalidIndices } from "@excalidraw/element";

import type {
  VariableBinding,
  BindableProperty,
  PidSymbolCustomData,
  PidElementCustomData,
} from "./types";

import { isPidSymbolElement } from "./ports";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Map of variable identifier → current value */
export type VariableValues = Record<string, string | number | boolean>;

/**
 * Minimal subset of ExcalidrawImperativeAPI used by the state engine.
 * Using a structural type keeps the pid package independent of
 * @excalidraw/excalidraw.
 */
export interface PidSceneApi {
  getSceneElements(): readonly ExcalidrawElement[];
  updateScene(opts: { elements: ExcalidrawElement[] }): void;
}

// ---------------------------------------------------------------------------
// Mapping resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a binding's mapping to a concrete property value for a given
 * variable value.
 *
 * - Exact string match wins first.
 * - "*" is the wildcard/default. In text mappings, "${value}" is interpolated.
 * - Returns undefined if no mapping applies.
 */
function resolveMapping(
  mapping: Record<string, string | number | boolean>,
  value: string | number | boolean,
): string | number | boolean | undefined {
  const strValue = String(value);

  if (strValue in mapping) {
    return mapping[strValue];
  }

  if ("*" in mapping) {
    const template = String(mapping["*"]);
    return template.replace(/\$\{value\}/g, strValue);
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Element lookup helpers
// ---------------------------------------------------------------------------

/**
 * Find the sub-element within a symbol group that matches a given role.
 * Returns the first match (roles should be unique within a symbol).
 */
function findElementByRole(
  allElements: readonly ExcalidrawElement[],
  rootId: string,
  role: string,
): ExcalidrawElement | undefined {
  return allElements.find((el) => {
    const cd = el.customData as PidElementCustomData | undefined;
    return cd?.pidRootId === rootId && cd?.pidElementRole === role;
  });
}

// ---------------------------------------------------------------------------
// Partial update builder
// ---------------------------------------------------------------------------

// Use a plain record to avoid readonly conflicts with Partial<ExcalidrawElement>
type ElementUpdate = Record<string, unknown>;

function buildPropertyUpdate(
  property: BindableProperty,
  resolvedValue: string | number | boolean,
  existingElement: ExcalidrawElement,
): ElementUpdate {
  switch (property) {
    case "strokeColor":
      return { strokeColor: String(resolvedValue) };

    case "backgroundColor":
      return { backgroundColor: String(resolvedValue) };

    case "opacity": {
      const num = Number(resolvedValue);
      return {
        opacity: Number.isFinite(num)
          ? Math.max(0, Math.min(100, num))
          : existingElement.opacity,
      };
    }

    case "visible":
      // We use pidHidden in customData which is checked in renderElement.ts
      return {
        customData: {
          ...(existingElement.customData ?? {}),
          pidHidden: !resolvedValue,
        },
      };

    case "text": {
      const textVal = String(resolvedValue);
      // Only applicable to text elements
      if (existingElement.type !== "text") return {};
      return {
        text: textVal,
        originalText: textVal,
      };
    }

    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply a batch of variable values to all P&ID symbols in the scene.
 *
 * Call this whenever new data arrives from your external system.
 * The function performs a single batched updateScene() call.
 *
 * @param variableValues  Map of variableId → current value.
 * @param api             ExcalidrawImperativeAPI (or compatible object).
 */
export function applyPidState(
  variableValues: VariableValues,
  api: PidSceneApi,
): void {
  const allElements = api.getSceneElements();

  // Collect updates: elementId → plain property-update record
  const updates = new Map<string, ElementUpdate>();

  for (const element of allElements) {
    if (!isPidSymbolElement(element)) continue;

    const symbolData = element.customData as PidSymbolCustomData;
    const bindings: VariableBinding[] = symbolData.bindings ?? [];

    if (bindings.length === 0) continue;

    for (const binding of bindings) {
      const value = variableValues[binding.variableId];
      if (value === undefined) continue;

      const resolvedValue = resolveMapping(binding.mapping, value);
      if (resolvedValue === undefined) continue;

      // Find the target element by role within this symbol group
      const targetEl = findElementByRole(
        allElements,
        element.id,
        binding.targetElementRole,
      );
      if (!targetEl) continue;

      const existing = updates.get(targetEl.id) ?? {};
      const propertyUpdate = buildPropertyUpdate(
        binding.property,
        resolvedValue,
        targetEl,
      );

      // Merge customData objects if both have them
      const mergedCustomData =
        propertyUpdate["customData"] !== undefined ||
        existing["customData"] !== undefined
          ? {
              ...((existing["customData"] as Record<string, unknown>) ?? {}),
              ...((propertyUpdate["customData"] as Record<string, unknown>) ??
                {}),
            }
          : undefined;

      const merged: ElementUpdate = { ...existing, ...propertyUpdate };
      if (mergedCustomData !== undefined) {
        merged["customData"] = mergedCustomData;
      }

      updates.set(targetEl.id, merged);
    }
  }

  if (updates.size === 0) return;

  const now = Date.now();
  const updatedElements = allElements.map((el) => {
    const update = updates.get(el.id);
    if (!update) return el;
    // ExcalidrawElement properties are Readonly<>, so we spread to build a new object
    const updated: ExcalidrawElement = {
      ...el,
      ...update,
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: now,
    } as ExcalidrawElement;
    return updated;
  });

  // syncInvalidIndices ensures fractional indices remain strictly ordered after
  // spreads, which is validated (and throws in dev) by Scene.replaceAllElements.
  api.updateScene({ elements: syncInvalidIndices(updatedElements) });
}

/**
 * Convenience: add or replace bindings on a placed symbol instance.
 * Returns the updated elements array (does not call updateScene — caller does).
 *
 * @example
 * const updated = setSymbolBindings(
 *   api.getSceneElements(),
 *   symbolElementId,
 *   [{ variableId: "pump_01.status", targetElementRole: "indicator", ... }],
 * );
 * api.updateScene({ elements: updated });
 */
export function setSymbolBindings(
  allElements: readonly ExcalidrawElement[],
  symbolElementId: string,
  bindings: VariableBinding[],
): ExcalidrawElement[] {
  const now = Date.now();
  return allElements.map((el) => {
    if (el.id !== symbolElementId) return el;
    if (!isPidSymbolElement(el)) return el;

    return {
      ...el,
      customData: {
        ...el.customData,
        bindings,
      },
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: now,
    } as ExcalidrawElement;
  });
}
