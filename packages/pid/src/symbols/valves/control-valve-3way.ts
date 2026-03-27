import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * 3-Way Control Valve (3-veis reguleringsventil)
 *
 * Body: two opposing triangles (horizontal axis), x=0..40, y=0..40.
 * A vertical mixing stem connects the pinch point to a third port at the bottom
 * (common/mixing port). Electric actuator above.
 *
 * Widely used in AHU heating/cooling circuits for mixing or diverting flow,
 * e.g. to modulate heating coil output while maintaining constant pump flow.
 *
 * Port x/y from body origin (0,0):
 *   port-a  = left  mid: x=0,  y=20
 *   port-b  = right mid: x=40, y=20
 *   port-ab = bottom centre (mixing): x=20, y=60
 *   signal  = top of actuator: x=20, y=-36
 */
export const controlValve3Way: PidSymbolDefinition = {
  id: "valve-control-3way",
  name: "3-Way Control Valve",
  category: "Valves",
  elements: [
    // Left triangle
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
    // Right triangle
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
    // Mixing connection stem — from body pinch point (20,20) downward to port (20,60)
    {
      type: "line",
      x: 20,
      y: 20,
      width: 0,
      height: 40,
      points: [
        [0, 0],
        [0, 40],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "mixing-stem",
    },
    // Actuator stem (above body)
    {
      type: "line",
      x: 20,
      y: -20,
      width: 0,
      height: 20,
      points: [
        [0, 0],
        [0, 20],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "stem",
    },
    // Actuator body
    {
      type: "rectangle",
      x: 8,
      y: -36,
      width: 24,
      height: 16,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 1.5,
      roughness: 0,
      role: "actuator",
    },
    // Actuator position indicator
    {
      type: "rectangle",
      x: 10,
      y: -34,
      width: 20,
      height: 12,
      strokeColor: "transparent",
      backgroundColor: "#94a3b8",
      strokeWidth: 0,
      roughness: 0,
      role: "indicator",
    },
  ],
  ports: [
    {
      id: "port-a",
      label: "Port A",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "bidirectional",
    },
    {
      id: "port-b",
      label: "Port B",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "bidirectional",
    },
    {
      id: "port-ab",
      label: "Port AB — Common / Mixing (Blanding)",
      relativeX: 0.5,
      relativeY: 1,
      x: 20,
      y: 60,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "bidirectional",
    },
    {
      id: "signal",
      label: "Control Signal",
      relativeX: 0.5,
      relativeY: -1,
      x: 20,
      y: -36,
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA, PORT_TYPES.ELECTRICAL_24V],
      direction: "in",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Valve Position",
      type: "discrete",
      allowedValues: ["a-open", "b-open", "mid", "fault"],
      defaultValue: "mid",
    },
  ],
  stateRenderer(inputs, ctx) {
    if (inputs.status === "fault") {
      ctx.update("body-left", { strokeColor: "#ef4444" });
      ctx.update("body-right", { strokeColor: "#ef4444" });
      ctx.update("indicator", { backgroundColor: "#ef4444" });
    } else {
      ctx.update("body-left", { strokeColor: "#1e1e1e" });
      ctx.update("body-right", { strokeColor: "#1e1e1e" });
      const color =
        inputs.status === "a-open" || inputs.status === "b-open"
          ? "#22c55e"
          : "#94a3b8";
      ctx.update("indicator", { backgroundColor: color });
    }
  },
};
