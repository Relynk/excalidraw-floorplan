import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Heating Coil / Hot Water Coil (Varmebatteri)
 *
 * Body: rectangle x=0..40, y=0..60.
 * Three wavy horizontal lines represent coil rows (hot water tubes
 * through which supply air passes). Air flows left-to-right.
 * Hot water connections at top (supply) and bottom (return).
 *
 * Per NS-EN ISO 10628-2 / ASHRAE conventions for AHU P&ID.
 *
 * Port x/y from body origin (0,0):
 *   air-in    = left  mid:    x=0,  y=30
 *   air-out   = right mid:    x=40, y=30
 *   water-in  = top   centre: x=20, y=0
 *   water-out = bot   centre: x=20, y=60
 */
export const heatingCoil: PidSymbolDefinition = {
  id: "hx-heating-coil",
  name: "Heating Coil",
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
    // Coil row 1 — sinusoidal wave at y=14
    // Points: [[0,0],[7,-5],[15,0],[22,5],[30,0]]  from x=5
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
    // Coil row 2 — inverted wave at y=30
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
    // Coil row 3 — same phase as row 1 at y=46
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
      label: "Hot Water Supply (Varmt vann inn)",
      relativeX: 0.5,
      relativeY: 0,
      x: 20,
      y: 0,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "water-out",
      label: "Hot Water Return (Varmt vann ut)",
      relativeX: 0.5,
      relativeY: 1,
      x: 20,
      y: 60,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
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
    // Active heating: coil lines turn warm red; idle: default dark
    const color = inputs.status === "active" ? "#dc2626" : "#1e1e1e";
    ctx.update("coil-1", { strokeColor: color });
    ctx.update("coil-2", { strokeColor: color });
    ctx.update("coil-3", { strokeColor: color });
  },
};
