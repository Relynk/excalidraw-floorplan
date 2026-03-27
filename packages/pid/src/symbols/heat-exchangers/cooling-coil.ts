import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Cooling Coil / Chilled Water Coil (Kjølebatteri)
 *
 * Body: rectangle x=0..40, y=0..60.
 * Same geometry as the heating coil — three wavy horizontal coil rows —
 * but connected to the chilled water circuit. Air flows left-to-right.
 * Chilled water connections at top (supply cold in) and bottom (return out).
 *
 * Per NS-EN ISO 10628-2 / ASHRAE conventions for AHU P&ID.
 *
 * Port x/y from body origin (0,0):
 *   air-in    = left  mid:    x=0,  y=30
 *   air-out   = right mid:    x=40, y=30
 *   water-in  = bot   centre: x=20, y=60  (chilled water enters at bottom — counter-flow)
 *   water-out = top   centre: x=20, y=0   (chilled water exits at top)
 */
export const coolingCoil: PidSymbolDefinition = {
  id: "hx-cooling-coil",
  name: "Cooling Coil",
  category: "Heat Exchangers",
  elements: [
    // Coil casing body
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 40,
      height: 60,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Coil row 1 at y=14
    {
      type: "line",
      x: 5,
      y: 14,
      width: 30,
      height: 10,
      points: [
        [0, 0],
        [7, -5],
        [15, 0],
        [22, 5],
        [30, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "coil-1",
    },
    // Coil row 2 at y=30 (inverted)
    {
      type: "line",
      x: 5,
      y: 30,
      width: 30,
      height: 10,
      points: [
        [0, 0],
        [7, 5],
        [15, 0],
        [22, -5],
        [30, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "coil-2",
    },
    // Coil row 3 at y=46
    {
      type: "line",
      x: 5,
      y: 46,
      width: 30,
      height: 10,
      points: [
        [0, 0],
        [7, -5],
        [15, 0],
        [22, 5],
        [30, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "coil-3",
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
      x: 40,
      y: 30,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
    {
      id: "water-in",
      label: "Chilled Water Supply (Kjølevann inn)",
      relativeX: 0.5,
      relativeY: 1,
      x: 20,
      y: 60,
      acceptsTypes: [PORT_TYPES.CHILLED_WATER, PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "water-out",
      label: "Chilled Water Return (Kjølevann ut)",
      relativeX: 0.5,
      relativeY: 0,
      x: 20,
      y: 0,
      acceptsTypes: [PORT_TYPES.CHILLED_WATER, PORT_TYPES.PIPE],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Coil Status",
      type: "discrete",
      allowedValues: ["active", "idle"],
      defaultValue: "idle",
    },
  ],
  stateRenderer(inputs, ctx) {
    // Active cooling: coil lines turn cool blue; idle: default dark
    const color = inputs.status === "active" ? "#2563eb" : "#1e1e1e";
    ctx.update("coil-1", { strokeColor: color });
    ctx.update("coil-2", { strokeColor: color });
    ctx.update("coil-3", { strokeColor: color });
  },
};
