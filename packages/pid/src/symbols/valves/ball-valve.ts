import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Ball Valve (Kulekran)
 *
 * Body: circle x=0..40, y=0..40.
 * Vertical indicator line shows ball position (vertical = open, horizontal = closed).
 * Stem above with T-bar handle.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left edge mid:  x=0,  y=20
 *   outlet = right edge mid: x=40, y=20
 */
export const ballValve: PidSymbolDefinition = {
  id: "valve-ball",
  name: "Ball Valve",
  category: "Valves",
  elements: [
    // Ball body circle
    {
      type: "ellipse",
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Ball position indicator (vertical line = open)
    {
      type: "line",
      x: 20,
      y: 8,
      width: 0,
      height: 24,
      points: [
        [0, 0],
        [0, 24],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "indicator",
    },
    // Stem
    {
      type: "line",
      x: 20,
      y: -12,
      width: 0,
      height: 12,
      points: [
        [0, 0],
        [0, 12],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "stem",
    },
    // T-bar handle
    {
      type: "line",
      x: 10,
      y: -12,
      width: 20,
      height: 0,
      points: [
        [0, 0],
        [20, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "handle",
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
    ctx.update("body", { strokeColor: color });
    ctx.update("indicator", { strokeColor: color });
  },
};
