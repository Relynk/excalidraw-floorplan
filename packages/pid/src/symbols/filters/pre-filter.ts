import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Pre-Filter / Coarse Filter (Grovfilter, klasse G4/M5)
 *
 * Body: narrow rectangle x=0..24, y=0..60 — represents the filter pack
 * depth installed across the full duct cross-section.
 * Three vertical lines inside show the filter media (coarse spacing).
 * "G4" label below the body.
 *
 * First stage of filtration in Norwegian AHUs per NS-EN ISO 16890.
 * Protects heat wheel and fine filter from large particles and insects.
 *
 * Port x/y from body origin (0,0):
 *   air-in  = left  mid: x=0,  y=30
 *   air-out = right mid: x=24, y=30
 */
export const preFilter: PidSymbolDefinition = {
  id: "filter-pre",
  name: "Pre-Filter G4",
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
    // Filter media line 1 (coarse spacing)
    {
      type: "line",
      x: 7,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "media-1",
    },
    // Filter media line 2
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
      strokeWidth: 1.5,
      roughness: 0,
      role: "media-2",
    },
    // Filter media line 3
    {
      type: "line",
      x: 17,
      y: 4,
      width: 0,
      height: 52,
      points: [
        [0, 0],
        [0, 52],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "media-3",
    },
    // Class label below body
    {
      type: "text",
      x: 2,
      y: 63,
      width: 20,
      height: 12,
      text: "G4",
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
    // Highlight filter body amber when differential pressure is high (clogged)
    const dp = Number(inputs.dp ?? 0);
    if (dp > 200) {
      ctx.update("body", { strokeColor: "#f59e0b" });
    } else {
      ctx.update("body", { strokeColor: "#1e1e1e" });
    }
  },
};
