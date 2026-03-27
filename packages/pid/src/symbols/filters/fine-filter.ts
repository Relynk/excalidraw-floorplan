import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Fine Filter (Finfilter, klasse F7/ePM1)
 *
 * Body: rectangle x=0..24, y=0..60 — same footprint as the pre-filter.
 * Five vertical lines with denser spacing represent finer filter media.
 * "F7" label below the body.
 *
 * Captures sub-micron particles and pollen. Mandatory in Norwegian
 * commercial AHU installations per TEK17 / NS-EN ISO 16890 ePM1.
 * Installed after the heat recovery unit, before supply fan or directly
 * before the supply air terminal.
 *
 * Port x/y from body origin (0,0):
 *   air-in  = left  mid: x=0,  y=30
 *   air-out = right mid: x=24, y=30
 */
export const fineFilter: PidSymbolDefinition = {
  id: "filter-fine",
  name: "Fine Filter F7",
  category: "Filters",
  elements: [
    // Filter pack body
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 24,
      height: 60,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Media line 1 (finer, denser spacing)
    {
      type: "line",
      x: 5,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      roughness: 0,
      role: "media-1",
    },
    // Media line 2
    {
      type: "line",
      x: 8,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      roughness: 0,
      role: "media-2",
    },
    // Media line 3
    {
      type: "line",
      x: 12,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      roughness: 0,
      role: "media-3",
    },
    // Media line 4
    {
      type: "line",
      x: 16,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      roughness: 0,
      role: "media-4",
    },
    // Media line 5
    {
      type: "line",
      x: 19,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      roughness: 0,
      role: "media-5",
    },
    // Class label below body
    {
      type: "text",
      x: 2,
      y: 63,
      width: 20,
      height: 12,
      text: "F7",
      fontSize: 10,
      strokeColor: "#374151",
      role: "class-label",
    },
  ],
  ports: [
    {
      id: "air-in",
      label: "Air Inlet (Luft inn)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 30,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "air-out",
      label: "Air Outlet (Luft ut)",
      relativeX: 1,
      relativeY: 0.5,
      x: 24,
      y: 30,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "dp",
      label: "Differential Pressure (Pa)",
      type: "numeric",
      defaultValue: 0,
    },
  ],
  stateRenderer(inputs, ctx) {
    // Highlight body amber when differential pressure indicates clogging
    const dp = Number(inputs.dp ?? 0);
    if (dp > 300) {
      ctx.update("body", { strokeColor: "#f59e0b" });
    } else {
      ctx.update("body", { strokeColor: "#1e1e1e" });
    }
  },
};
