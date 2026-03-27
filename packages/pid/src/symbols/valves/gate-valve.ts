import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Gate Valve (Stengventil / Sluseventil)
 *
 * Body: two opposing triangles spanning x=0..40, y=0..40 (ISA 5.1 style).
 * Stem rises from pinch point. T-bar handwheel at top of stem.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left edge mid:  x=0,  y=20
 *   outlet = right edge mid: x=40, y=20
 */
export const gateValve: PidSymbolDefinition = {
  id: "valve-gate",
  name: "Gate Valve",
  category: "Valves",
  elements: [
    // Left triangle (inlet side)
    {
      type: "line",
      x: 0,
      y: 0,
      width: 20,
      height: 40,
      points: [
        [0, 0],
        [20, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-left",
    },
    // Right triangle (outlet side)
    {
      type: "line",
      x: 20,
      y: 0,
      width: 20,
      height: 40,
      points: [
        [0, 0],
        [-20, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-right",
    },
    // Stem
    {
      type: "line",
      x: 20,
      y: -14,
      width: 0,
      height: 14,
      points: [
        [0, 0],
        [0, 14],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "stem",
    },
    // T-bar handwheel
    {
      type: "line",
      x: 8,
      y: -14,
      width: 24,
      height: 0,
      points: [
        [0, 0],
        [24, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "handwheel",
    },
  ],
  ports: [
    {
      id: "inlet",
      label: "Inlet (Innløp)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet (Utløp)",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Valve Position",
      type: "discrete",
      allowedValues: ["open", "closed"],
      defaultValue: "closed",
    },
  ],
  stateRenderer(inputs, ctx) {
    const color = inputs.status === "open" ? "#22c55e" : "#ef4444";
    ctx.update("body-left", { strokeColor: color });
    ctx.update("body-right", { strokeColor: color });
  },
};
