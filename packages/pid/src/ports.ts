/**
 * Port resolution: given a placed P&ID symbol element on the canvas,
 * compute the absolute canvas coordinates of all its ports.
 *
 * Two coordinate systems are supported for port placement:
 *
 * 1. relativeX/Y (0–1) — relative to the full group bounding box.
 *    Simple but affected by decorator elements (stems, labels outside body).
 *
 * 2. x/y (pixels) — absolute offset from the body bounding box origin
 *    (min x/y of all elements whose role starts with "body").
 *    Precise and independent of decorators. Takes priority over relativeX/Y.
 */
import { pointRotateRads, pointFrom } from "@excalidraw/math";
import type { GlobalPoint } from "@excalidraw/math";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import type {
  PidPort,
  PidSymbolCustomData,
  PidElementCustomData,
  ResolvedPort,
  PortType,
} from "./types";

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isPidSymbolElement(
  element: ExcalidrawElement,
): element is ExcalidrawElement & { customData: PidSymbolCustomData } {
  return element.customData?.pidSymbol === true;
}

// ---------------------------------------------------------------------------
// Bounding box helpers
// ---------------------------------------------------------------------------

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function bboxOfElements(elements: readonly ExcalidrawElement[]): BBox | null {
  if (elements.length === 0) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const el of elements) {
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Full group bounding box — all elements sharing the root's groupId.
 */
function getGroupBBox(
  rootElement: ExcalidrawElement,
  allElements: readonly ExcalidrawElement[],
): BBox {
  const groupId = rootElement.groupIds?.[0];
  const members = groupId
    ? allElements.filter((el) => el.groupIds?.includes(groupId))
    : [rootElement];
  return (
    bboxOfElements(members) ?? {
      x: rootElement.x,
      y: rootElement.y,
      width: rootElement.width,
      height: rootElement.height,
    }
  );
}

/**
 * Body bounding box — only elements whose pidElementRole starts with "body".
 * Falls back to the full group bbox if no body elements are found.
 */
function getBodyBBox(
  rootElement: ExcalidrawElement,
  allElements: readonly ExcalidrawElement[],
): BBox {
  const groupId = rootElement.groupIds?.[0];
  const members = groupId
    ? allElements.filter((el) => el.groupIds?.includes(groupId))
    : [rootElement];

  const bodyElements = members.filter((el) => {
    const role = (el.customData as PidElementCustomData | undefined)
      ?.pidElementRole;
    return typeof role === "string" && role.startsWith("body");
  });

  const bbox = bboxOfElements(bodyElements.length > 0 ? bodyElements : members);
  return (
    bbox ?? {
      x: rootElement.x,
      y: rootElement.y,
      width: rootElement.width,
      height: rootElement.height,
    }
  );
}

// ---------------------------------------------------------------------------
// Port position resolution
// ---------------------------------------------------------------------------

/**
 * Compute absolute canvas positions for all ports on a placed P&ID symbol.
 *
 * Port coordinate resolution (in priority order):
 *   1. port.x / port.y — absolute pixel offset from body bbox origin
 *   2. port.relativeX / port.relativeY — fraction of full group bbox
 *
 * @param element     The root element of a placed symbol (pidSymbol: true).
 * @param allElements All scene elements (for group/body bbox computation).
 */
export function resolvePortPositions(
  element: ExcalidrawElement,
  allElements: readonly ExcalidrawElement[],
): ResolvedPort[] {
  if (!isPidSymbolElement(element)) return [];

  const ports: PidPort[] = element.customData.ports;
  const groupBBox = getGroupBBox(element, allElements);
  const bodyBBox = getBodyBBox(element, allElements);

  // Rotation centre of group bbox
  const cx = groupBBox.x + groupBBox.width / 2;
  const cy = groupBBox.y + groupBBox.height / 2;
  const angle = element.angle;

  return ports.map((port) => {
    let px: number;
    let py: number;

    if (port.x !== undefined && port.y !== undefined) {
      // Absolute pixel offset from body bbox origin — most precise
      px = bodyBBox.x + port.x;
      py = bodyBBox.y + port.y;
    } else {
      // Relative to full group bbox
      px = groupBBox.x + port.relativeX * groupBBox.width;
      py = groupBBox.y + port.relativeY * groupBBox.height;
    }

    // Apply group rotation around group bbox centre
    if (angle !== 0) {
      const rotated = pointRotateRads(
        pointFrom<GlobalPoint>(px, py),
        pointFrom<GlobalPoint>(cx, cy),
        angle,
      );
      px = rotated[0];
      py = rotated[1];
    }

    return {
      port,
      x: px,
      y: py,
      ownerElementId: element.id,
    };
  });
}

// ---------------------------------------------------------------------------
// Collection / search helpers
// ---------------------------------------------------------------------------

export function getAllResolvedPorts(
  elements: readonly ExcalidrawElement[],
  activePipeType: PortType | null,
): ResolvedPort[] {
  const result: ResolvedPort[] = [];
  for (const el of elements) {
    if (!isPidSymbolElement(el)) continue;
    for (const resolved of resolvePortPositions(el, elements)) {
      if (
        activePipeType !== null &&
        !resolved.port.acceptsTypes.includes(activePipeType)
      ) {
        continue;
      }
      result.push(resolved);
    }
  }
  return result;
}

export function findNearestPort(
  pointerX: number,
  pointerY: number,
  resolvedPorts: ResolvedPort[],
  snapDistance: number,
): { resolved: ResolvedPort; distance: number } | null {
  let best: { resolved: ResolvedPort; distance: number } | null = null;
  for (const resolved of resolvedPorts) {
    const dx = resolved.x - pointerX;
    const dy = resolved.y - pointerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= snapDistance && (best === null || dist < best.distance)) {
      best = { resolved, distance: dist };
    }
  }
  return best;
}
