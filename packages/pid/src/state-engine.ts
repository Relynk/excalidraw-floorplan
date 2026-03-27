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
import type { ExcalidrawElement } from "@excalidraw/element/types";
import { syncInvalidIndices } from "@excalidraw/element";

import type {
  VariableBinding,
  BindableProperty,
  PidSymbolCustomData,
  PidElementCustomData,
  PidStateRule,
  PidVisualProps,
  PidSymbolContext,
} from "./types";

import { isPidSymbolElement } from "./ports";
import { PID_SYMBOLS_BY_ID } from "./symbols/index";

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
// Mapping resolution (used by legacy stateRules path)
// ---------------------------------------------------------------------------

function resolveMapping(
  mapping: Record<string, string | number | boolean>,
  value: string | number | boolean,
): string | number | boolean | undefined {
  const strValue = String(value);
  if (strValue in mapping) return mapping[strValue];
  if ("*" in mapping) {
    return String(mapping["*"]).replace(/\$\{value\}/g, strValue);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Element lookup
// ---------------------------------------------------------------------------

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
// Update accumulator
// ---------------------------------------------------------------------------

type ElementUpdate = Record<string, unknown>;

function mergeUpdate(
  updates: Map<string, ElementUpdate>,
  targetId: string,
  patch: ElementUpdate,
): void {
  const existing = updates.get(targetId) ?? {};

  const mergedCustomData =
    patch["customData"] !== undefined || existing["customData"] !== undefined
      ? {
          ...((existing["customData"] as Record<string, unknown>) ?? {}),
          ...((patch["customData"] as Record<string, unknown>) ?? {}),
        }
      : undefined;

  const merged: ElementUpdate = { ...existing, ...patch };
  if (mergedCustomData !== undefined) {
    merged["customData"] = mergedCustomData;
  }
  updates.set(targetId, merged);
}

// ---------------------------------------------------------------------------
// Symbol context — passed to stateRenderer functions
// ---------------------------------------------------------------------------

/**
 * Build a PidSymbolContext scoped to one placed symbol instance.
 * All update() / set() calls accumulate into the shared `updates` map and
 * are applied in a single batch by the state engine.
 */
function createSymbolContext(
  rootId: string,
  allElements: readonly ExcalidrawElement[],
  updates: Map<string, ElementUpdate>,
): PidSymbolContext {
  function update(role: string, props: PidVisualProps): void {
    const el = findElementByRole(allElements, rootId, role);
    if (!el) return;

    const patch: ElementUpdate = {};

    if (props.strokeColor !== undefined) {
      patch.strokeColor = props.strokeColor;
    }
    if (props.backgroundColor !== undefined) {
      patch.backgroundColor = props.backgroundColor;
    }
    if (props.opacity !== undefined) {
      patch.opacity = Math.max(0, Math.min(100, props.opacity));
    }
    if (props.visible !== undefined) {
      // Must preserve the element's existing customData (pidElementRole, pidRootId, etc.)
      // so we start from the element's own customData and overlay the hidden flag.
      patch.customData = {
        ...((el.customData as Record<string, unknown>) ?? {}),
        pidHidden: !props.visible,
      };
    }
    if (props.text !== undefined) {
      if (el.type === "text") {
        patch.text = props.text;
        patch.originalText = props.text;
      }
    }

    if (Object.keys(patch).length > 0) {
      mergeUpdate(updates, el.id, patch);
    }
  }

  function set(
    role: string,
    property: keyof PidVisualProps,
    value: string | number | boolean,
  ): void {
    update(role, { [property]: value } as PidVisualProps);
  }

  return { update, set };
}

// ---------------------------------------------------------------------------
// Legacy stateRules path
// ---------------------------------------------------------------------------

function applyStateRules(
  rules: PidStateRule[],
  inputId: string,
  value: string | number | boolean,
  rootId: string,
  allElements: readonly ExcalidrawElement[],
  updates: Map<string, ElementUpdate>,
): void {
  for (const rule of rules) {
    if (rule.inputId !== inputId) continue;

    const resolvedValue = resolveMapping(rule.mapping, value);
    if (resolvedValue === undefined) continue;

    const targetEl = findElementByRole(
      allElements,
      rootId,
      rule.targetElementRole,
    );
    if (!targetEl) continue;

    // Build the property patch the same way as the old buildPropertyUpdate
    const patch: ElementUpdate = {};
    switch (rule.property) {
      case "strokeColor":
        patch.strokeColor = String(resolvedValue);
        break;
      case "backgroundColor":
        patch.backgroundColor = String(resolvedValue);
        break;
      case "opacity": {
        const num = Number(resolvedValue);
        patch.opacity = Number.isFinite(num)
          ? Math.max(0, Math.min(100, num))
          : targetEl.opacity;
        break;
      }
      case "visible":
        patch.customData = {
          ...((targetEl.customData as Record<string, unknown>) ?? {}),
          pidHidden: !resolvedValue,
        };
        break;
      case "text":
        if (targetEl.type === "text") {
          const t = String(resolvedValue);
          patch.text = t;
          patch.originalText = t;
        }
        break;
    }

    if (Object.keys(patch).length > 0) {
      mergeUpdate(updates, targetEl.id, patch);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply a batch of variable values to all P&ID symbols in the scene.
 *
 * Call this whenever new data arrives from your external system.
 * A single batched updateScene() call is made regardless of how many
 * symbols or bindings are updated.
 *
 * **Resolution order for each symbol:**
 * 1. If the symbol definition has a `stateRenderer` function:
 *    - Builds an `inputs` object from all inputId-based bindings.
 *    - Calls `stateRenderer(inputs, ctx)` — the function decides what to update.
 * 2. Else if the symbol definition has `stateRules`:
 *    - Evaluates each rule's mapping for matching inputId bindings.
 * 3. Direct bindings (with `targetElementRole`/`property`/`mapping`) are always
 *    applied as per-instance overrides, regardless of the above.
 *
 * @param variableValues  Map of variableId → current value.
 * @param api             ExcalidrawImperativeAPI (or compatible object).
 */
export function applyPidState(
  variableValues: VariableValues,
  api: PidSceneApi,
): void {
  const allElements = api.getSceneElements();
  const updates = new Map<string, ElementUpdate>();

  for (const element of allElements) {
    if (!isPidSymbolElement(element)) continue;

    const symbolData = element.customData as PidSymbolCustomData;
    const bindings: VariableBinding[] = symbolData.bindings ?? [];
    if (bindings.length === 0) continue;

    const symbolDef = PID_SYMBOLS_BY_ID.get(symbolData.symbolId);

    // -----------------------------------------------------------------------
    // stateRenderer path: build inputs map, call the renderer function once
    // -----------------------------------------------------------------------
    if (symbolDef?.stateRenderer) {
      // Collect all inputId-based bindings into a single inputs object
      const inputs: Record<string, string | number | boolean | undefined> = {};
      for (const binding of bindings) {
        if ("inputId" in binding) {
          inputs[binding.inputId] = variableValues[binding.variableId];
        }
      }

      // Only invoke if at least one bound input has a value in the update batch
      const hasAnyValue = Object.values(inputs).some((v) => v !== undefined);
      if (hasAnyValue) {
        const ctx = createSymbolContext(element.id, allElements, updates);
        try {
          symbolDef.stateRenderer(inputs, ctx);
        } catch (_err) {
          // A renderer error must never crash the whole state update loop.
          // In dev mode you'd add a console.error here for diagnostics.
        }
      }
    } else if (symbolDef?.stateRules) {
      // -----------------------------------------------------------------------
      // Legacy stateRules path (fallback when no stateRenderer is defined)
      // -----------------------------------------------------------------------
      for (const binding of bindings) {
        if (!("inputId" in binding)) continue;
        const value = variableValues[binding.variableId];
        if (value === undefined) continue;
        applyStateRules(
          symbolDef.stateRules,
          binding.inputId,
          value,
          element.id,
          allElements,
          updates,
        );
      }
    }

    // -----------------------------------------------------------------------
    // Direct bindings: per-instance overrides, always applied
    // -----------------------------------------------------------------------
    for (const binding of bindings) {
      if ("inputId" in binding) continue; // handled above

      const value = variableValues[binding.variableId];
      if (value === undefined) continue;

      const resolvedValue = resolveMapping(binding.mapping, value);
      if (resolvedValue === undefined) continue;

      const targetEl = findElementByRole(
        allElements,
        element.id,
        binding.targetElementRole,
      );
      if (!targetEl) continue;

      // Reuse the context's update logic via a one-off context
      const ctx = createSymbolContext(element.id, allElements, updates);
      ctx.set(
        binding.targetElementRole,
        binding.property as keyof PidVisualProps,
        resolvedValue,
      );
    }
  }

  if (updates.size === 0) return;

  const now = Date.now();
  const updatedElements = allElements.map((el) => {
    const update = updates.get(el.id);
    if (!update) return el;
    return {
      ...el,
      ...update,
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: now,
    } as ExcalidrawElement;
  });

  api.updateScene({ elements: syncInvalidIndices(updatedElements) });
}

/**
 * Convenience: add or replace bindings on a placed symbol instance.
 * Returns the updated elements array (does not call updateScene — caller does).
 *
 * @example
 * // Input-based binding (preferred — symbol's stateRenderer handles visuals)
 * const updated = setSymbolBindings(
 *   api.getSceneElements(),
 *   symbolElementId,
 *   [{ variableId: "pump_01.status", inputId: "status" }],
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
      customData: { ...el.customData, bindings },
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: now,
    } as ExcalidrawElement;
  });
}
