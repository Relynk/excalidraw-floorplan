/**
 * Converts PidSymbolDefinition objects into excalidraw LibraryItems.
 *
 * Each symbol becomes one LibraryItem containing a group of standard excalidraw
 * elements. The first element in each group carries PidSymbolCustomData as its
 * customData (pidSymbol: true), making placed symbols identifiable on the canvas.
 * Every sub-element carries PidElementCustomData so the state engine can find
 * elements by their role.
 */
import {
  randomId,
  randomInteger,
  getUpdatedTimestamp,
  DEFAULT_ELEMENT_PROPS,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  FONT_FAMILY,
} from "@excalidraw/common";

import { pointFrom } from "@excalidraw/math";
import type { LocalPoint } from "@excalidraw/math";

import type {
  ExcalidrawElement,
  ExcalidrawLineElement,
  ExcalidrawGenericElement,
  ExcalidrawTextElement,
  NonDeleted,
} from "@excalidraw/element/types";

// Minimal LibraryItem shape — structurally compatible with @excalidraw/excalidraw's LibraryItem
// We avoid importing from @excalidraw/excalidraw to keep the package dependency lean.
export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;
  name?: string;
};

import type {
  PidSymbolDefinition,
  PidElementTemplate,
  PidSymbolCustomData,
  PidElementCustomData,
} from "./types";

import { ALL_PID_SYMBOLS } from "./symbols/index";

// ---------------------------------------------------------------------------
// Internal element builders
// ---------------------------------------------------------------------------

function makeBaseElement(
  template: PidElementTemplate,
  groupId: string,
  rootId: string,
  id: string,
  offsetX: number,
  offsetY: number,
): Omit<ExcalidrawElement, "type"> & { customData: PidElementCustomData } {
  return {
    id,
    x: offsetX + template.x,
    y: offsetY + template.y,
    width: template.width,
    height: template.height,
    angle: 0 as import("@excalidraw/math").Radians,
    strokeColor: template.strokeColor ?? DEFAULT_ELEMENT_PROPS.strokeColor,
    backgroundColor:
      template.backgroundColor ?? DEFAULT_ELEMENT_PROPS.backgroundColor,
    fillStyle:
      (template.fillStyle as ExcalidrawElement["fillStyle"]) ??
      DEFAULT_ELEMENT_PROPS.fillStyle,
    strokeWidth: template.strokeWidth ?? 2,
    strokeStyle:
      (template.strokeStyle as ExcalidrawElement["strokeStyle"]) ?? "solid",
    roughness: template.roughness ?? 0,
    opacity: template.opacity ?? 100,
    groupIds: [groupId],
    frameId: null,
    index: null,
    roundness: null,
    seed: randomInteger(),
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    boundElements: null,
    updated: getUpdatedTimestamp(),
    link: null,
    locked: false,
    customData: {
      pidElementRole: template.role ?? "unknown",
      pidRootId: rootId,
    } satisfies PidElementCustomData,
  };
}

function buildLineElement(
  template: PidElementTemplate,
  groupId: string,
  rootId: string,
  id: string,
  offsetX: number,
  offsetY: number,
): NonDeleted<ExcalidrawLineElement> {
  const base = makeBaseElement(template, groupId, rootId, id, offsetX, offsetY);
  const rawPoints = template.points ?? [
    [0, 0],
    [template.width, template.height],
  ];
  return {
    ...base,
    type: "line",
    points: rawPoints.map(([x, y]) => pointFrom<LocalPoint>(x, y)),
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
    polygon: false,
  } as NonDeleted<ExcalidrawLineElement>;
}

function buildShapeElement(
  template: PidElementTemplate,
  groupId: string,
  rootId: string,
  id: string,
  offsetX: number,
  offsetY: number,
): NonDeleted<ExcalidrawGenericElement> {
  const base = makeBaseElement(template, groupId, rootId, id, offsetX, offsetY);
  return {
    ...base,
    type: template.type as ExcalidrawGenericElement["type"],
  } as NonDeleted<ExcalidrawGenericElement>;
}

function buildTextElement(
  template: PidElementTemplate,
  groupId: string,
  rootId: string,
  id: string,
  offsetX: number,
  offsetY: number,
): NonDeleted<ExcalidrawTextElement> {
  const base = makeBaseElement(template, groupId, rootId, id, offsetX, offsetY);
  const text = template.text ?? "";
  return {
    ...base,
    type: "text",
    text,
    originalText: text,
    fontSize: template.fontSize ?? DEFAULT_FONT_SIZE,
    fontFamily: FONT_FAMILY.Excalifont,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    autoResize: true,
    lineHeight: 1.25 as ExcalidrawTextElement["lineHeight"],
  } as NonDeleted<ExcalidrawTextElement>;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert an array of P&ID symbol definitions into excalidraw LibraryItems.
 *
 * @example
 * const items = createLibraryItems(ALL_PID_SYMBOLS);
 * excalidrawAPI.updateLibrary({ libraryItems: items, merge: true });
 */
export function createLibraryItems(
  symbols: PidSymbolDefinition[],
): LibraryItem[] {
  return symbols.map((symbol) => {
    const groupId = randomId();
    const rootId = randomId();

    const elements: NonDeleted<ExcalidrawElement>[] = symbol.elements.map(
      (template, idx) => {
        const id = idx === 0 ? rootId : randomId();
        // All symbols are centered around 0,0; offset applied on canvas placement
        const offsetX = 0;
        const offsetY = 0;

        let el: NonDeleted<ExcalidrawElement>;

        if (template.type === "line") {
          el = buildLineElement(
            template,
            groupId,
            rootId,
            id,
            offsetX,
            offsetY,
          );
        } else if (template.type === "text") {
          el = buildTextElement(
            template,
            groupId,
            rootId,
            id,
            offsetX,
            offsetY,
          );
        } else {
          el = buildShapeElement(
            template,
            groupId,
            rootId,
            id,
            offsetX,
            offsetY,
          );
        }

        // The first element doubles as the symbol root: merge PidSymbolCustomData
        if (idx === 0) {
          const symbolCustomData: PidSymbolCustomData & PidElementCustomData = {
            pidSymbol: true,
            symbolId: symbol.id,
            ports: symbol.ports,
            // Element role for the root element
            pidElementRole: template.role ?? "root",
            pidRootId: id,
          };
          (
            el as ExcalidrawElement & { customData: typeof symbolCustomData }
          ).customData = symbolCustomData;
        }

        return el;
      },
    );

    return {
      id: randomId(),
      status: "published" as const,
      elements: elements as readonly NonDeleted<ExcalidrawElement>[],
      created: Date.now(),
      name: symbol.name,
    } satisfies LibraryItem;
  });
}

/** All built-in P&ID symbols as ready-to-use LibraryItems */
export function getDefaultPidLibrary(): LibraryItem[] {
  return createLibraryItems(ALL_PID_SYMBOLS);
}
