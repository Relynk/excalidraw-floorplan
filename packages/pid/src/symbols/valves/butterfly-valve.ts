import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Motorised Butterfly Valve (Motordrevet skiveventil / butterflyventil)
 *
 * Body: circle x=0..40, y=0..40.
 * A diagonal line represents the disc in the 45° partially-open position.
 * Electric actuator box above the body with status indicator.
 * Very common in AHU systems for large-bore hydronic and duct isolation.
 *
 * Port x/y from body origin (0,0):
 *   inlet   = left  mid: x=0,  y=20
 *   outlet  = right mid: x=40, y=20
 *   signal  = top of actuator: x=20, y=-30
 */
export const butterflyValve: PidSymbolDefinition = {
  id: "valve-butterfly",
  name: "Butterfly Valve",
  category: "Valves",
  elements: [
    // Valve body circle
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
    // Disc — diagonal line representing the butterfly plate (45° open)
    {
      type: "line",
      x: 5,
      y: 5,
      width: 30,
      height: 30,
      points: [
        [0, 30],
        [30, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "disc",
    },
    // Actuator stem
    {
      type: "line",
      x: 20,
      y: -16,
      width: 0,
      height: 16,
      points: [
        [0, 0],
        [0, 16],
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
      y: -30,
      width: 24,
      height: 14,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 1.5,
      roughness: 0,
      role: "actuator",
    },
    // Actuator status indicator fill
    {
      type: "rectangle",
      x: 10,
      y: -28,
      width: 20,
      height: 10,
      strokeColor: "transparent",
      backgroundColor: "#94a3b8",
      strokeWidth: 0,
      roughness: 0,
      role: "indicator",
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
        PORT_TYPES.DUCT,
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
        PORT_TYPES.DUCT,
      ],
      direction: "out",
    },
    {
      id: "signal",
      label: "Control Signal",
      relativeX: 0.5,
      relativeY: -1,
      x: 20,
      y: -30,
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA, PORT_TYPES.ELECTRICAL_24V],
      direction: "in",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Valve Position",
      type: "discrete",
      allowedValues: ["open", "closed", "fault"],
      defaultValue: "closed",
    },
  ],
  stateRenderer(inputs, ctx) {
    const color =
      inputs.status === "open"
        ? "#22c55e"
        : inputs.status === "fault"
          ? "#ef4444"
          : "#64748b";
    ctx.update("indicator", { backgroundColor: color });
    ctx.update("body", {
      strokeColor: inputs.status === "fault" ? "#ef4444" : "#1e1e1e",
    });
  },
};
