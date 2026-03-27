/**
 * Renders port indicator dots on all P&ID symbol ports when the pipe-draw tool
 * is active or a pipe element is being edited.
 *
 * Visual design:
 *  - All ports: hollow circle with teal (#14b8a6) or blue (#3b82f6) border
 *  - Snapped port (snap line points to it): filled, white border
 */
import { getAllResolvedPorts } from "../../pid/src/ports";
import type { PortType } from "../../pid/src/types";

import type { InteractiveCanvasAppState } from "../types";
import type { SnapLine } from "../snapping";

const PORT_DOT_RADIUS = 5;
const PORT_DOT_LINE_WIDTH = 2;

/**
 * Render port indicator dots over the interactive canvas.
 *
 * @param context     2D context (pre-scaled, not yet scroll-translated).
 * @param appState    For scroll, zoom, snapLines.
 * @param allElements All non-deleted scene elements.
 * @param pipeType    Active pipe type (null = any).
 */
export function renderPortIndicators(
  context: CanvasRenderingContext2D,
  appState: InteractiveCanvasAppState,
  allElements: readonly import("@excalidraw/element/types").ExcalidrawElement[],
  pipeType: PortType | null,
): void {
  const resolvedPorts = getAllResolvedPorts(allElements, pipeType);
  if (resolvedPorts.length === 0) return;

  const zoom = appState.zoom.value;
  const radius = PORT_DOT_RADIUS / zoom;
  const lineWidth = PORT_DOT_LINE_WIDTH / zoom;
  const color = pipeType === null ? "#14b8a6" : "#3b82f6";

  // Collect snap-line endpoint positions to detect snapped ports
  const snapPoints = new Set<string>();
  for (const snap of appState.snapLines as SnapLine[]) {
    if (snap.type === "pointer" && snap.points.length > 0) {
      const pt = snap.points[0];
      snapPoints.add(`${Math.round(pt[0])},${Math.round(pt[1])}`);
    }
  }

  context.save();
  context.translate(appState.scrollX, appState.scrollY);

  for (const resolved of resolvedPorts) {
    const key = `${Math.round(resolved.x)},${Math.round(resolved.y)}`;
    const isSnapped = snapPoints.has(key);

    context.beginPath();
    context.arc(resolved.x, resolved.y, radius, 0, Math.PI * 2);

    if (isSnapped) {
      // Filled + white ring = snapping to this port right now
      context.fillStyle = color;
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = lineWidth * 1.5;
      context.stroke();
    } else {
      // Hollow ring = connectable port
      context.fillStyle = "rgba(255,255,255,0.9)";
      context.fill();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.stroke();
    }
  }

  context.restore();
}

/**
 * Returns true when port indicators should be shown.
 * Active when:
 *   - pipe-draw tool is selected, OR
 *   - a pipe element is currently being edited (vertex drag / hover in edit mode)
 */
export function shouldShowPortIndicators(
  appState: InteractiveCanvasAppState,
  allElements: readonly import("@excalidraw/element/types").ExcalidrawElement[],
): { show: boolean; pipeType: PortType | null } {
  // Pipe tool active (drawing a new pipe)
  if (appState.activeTool.type === "pipe-draw") {
    return { show: true, pipeType: null };
  }

  // A pipe element is selected or being edited/dragged
  const linearEl = appState.selectedLinearElement;
  if (linearEl) {
    const el = allElements.find((e) => e.id === linearEl.elementId);
    if (el && typeof el.customData?.pipeTool === "string") {
      const pipeType =
        (el.customData as { pidConnection?: { pipeType?: PortType } })
          ?.pidConnection?.pipeType ?? null;
      return { show: true, pipeType };
    }
  }

  return { show: false, pipeType: null };
}
