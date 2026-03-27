/**
 * Pipe connection tracking: move pipe endpoints when connected P&ID symbols move.
 *
 * When a symbol group is dragged by (dx, dy), any pipe line whose
 * pidConnection.startPort.elementId or pidConnection.endPort.elementId matches
 * the symbol's root element id should have the corresponding endpoint moved by
 * the same offset.
 *
 * This mirrors Pattern B (bound text follows container) from the excalidraw
 * binding system — a direct offset copy without intersection recalculation.
 */
import { pointFrom } from "@excalidraw/math";
import type { LocalPoint } from "@excalidraw/math";

import type {
  ExcalidrawElement,
  ExcalidrawLinearElement,
} from "@excalidraw/element/types";
import { isLinearElement } from "@excalidraw/element";

import type { Scene } from "@excalidraw/element/Scene";

import { isPidSymbolElement } from "./ports";
import type { PidConnectionCustomData } from "./types";

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

function isPipeElement(
  element: ExcalidrawElement,
): element is ExcalidrawLinearElement & {
  customData: PidConnectionCustomData;
} {
  return (
    isLinearElement(element) &&
    typeof (element.customData as PidConnectionCustomData | undefined)
      ?.pidConnection === "object" &&
    (element.customData as PidConnectionCustomData).pidConnection !== null
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Move the pipe endpoints that are connected to a P&ID symbol that just moved.
 *
 * IMPORTANT: `dragOffset` must be the total offset from drag-start (not a
 * per-frame delta), and `originalElements` must be the element snapshots taken
 * at drag-start. This mirrors how `updateElementCoords` works: it always
 * computes `originalPosition + totalOffset` rather than incrementing the
 * current position, which prevents compounding errors across frames.
 *
 * For single-step moves (keyboard arrow keys) where there is no drag-start
 * snapshot, pass `null` for `originalElements`. In that case the function
 * falls back to `currentPosition + dragOffset`, which is correct for a
 * one-shot move.
 *
 * @param movedSymbolElement  The root element of the moved symbol (pidSymbol: true).
 * @param dragOffset          Total offset from drag-start (same value used to move the symbol).
 * @param scene               The live Scene instance (for mutateElement).
 * @param simultaneouslyUpdated
 *   Set of element ids also being moved in the same operation. Pipe elements
 *   in this set are skipped to avoid double-moving when both the pipe and its
 *   connected symbol are selected.
 * @param originalElements
 *   Snapshot of element states at drag-start (from pointerDownState.originalElements).
 *   Pass `null` for keyboard/single-step moves.
 */
export function updateConnectedPipes(
  movedSymbolElement: ExcalidrawElement,
  dragOffset: { x: number; y: number },
  scene: Scene,
  simultaneouslyUpdated: Set<string>,
  originalElements: ReadonlyMap<string, ExcalidrawElement> | null,
): void {
  if (!isPidSymbolElement(movedSymbolElement)) {
    return;
  }

  const { x: dx, y: dy } = dragOffset;
  if (dx === 0 && dy === 0) {
    return;
  }

  const symbolId = movedSymbolElement.id;

  for (const element of scene.getNonDeletedElements()) {
    // Skip elements that are themselves being moved — they'll be updated by
    // the caller's normal element-coordinate update.
    if (simultaneouslyUpdated.has(element.id)) {
      continue;
    }

    if (!isPipeElement(element)) {
      continue;
    }

    const { pidConnection } = element.customData;
    const moveStart = pidConnection.startPort?.elementId === symbolId;
    const moveEnd = pidConnection.endPort?.elementId === symbolId;

    if (!moveStart && !moveEnd) {
      continue;
    }

    // Use the original (drag-start) snapshot so we always compute
    // originalPosition + totalOffset, never currentPosition + totalOffset.
    // This prevents the cumulative offset from being applied multiple times
    // across frames (the same bug that updateElementCoords avoids by using
    // pointerDownState.originalElements).
    const origPipe =
      originalElements != null
        ? (originalElements.get(element.id) as
            | (ExcalidrawLinearElement & {
                customData: PidConnectionCustomData;
              })
            | undefined)
        : undefined;

    // Fall back to live element when no snapshot is available (keyboard move).
    const basePipe = origPipe ?? element;
    const basePoints = basePipe.points as readonly LocalPoint[];
    const lastIdx = basePoints.length - 1;

    if (moveStart && moveEnd) {
      // Both endpoints connected to this symbol — move the whole line.
      scene.mutateElement(element, {
        x: basePipe.x + dx,
        y: basePipe.y + dy,
      });
    } else if (moveStart) {
      // First point is always local (0,0); element.x/y IS the first point.
      // Move the origin and shift all other points by the inverse so they
      // stay at their original canvas positions.
      scene.mutateElement(element, {
        x: basePipe.x + dx,
        y: basePipe.y + dy,
        points: basePoints.map((p, i) =>
          i === 0
            ? pointFrom<LocalPoint>(0, 0)
            : pointFrom<LocalPoint>(p[0] - dx, p[1] - dy),
        ),
      });
    } else {
      // moveEnd only — adjust only the last point's local coordinate.
      scene.mutateElement(element, {
        points: basePoints.map((p, i) =>
          i === lastIdx ? pointFrom<LocalPoint>(p[0] + dx, p[1] + dy) : p,
        ),
      });
    }
  }
}
