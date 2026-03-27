import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * 2-Way Control Valve (2-veis reguleringsventil)
 *
 * Body: two opposing triangles (gate valve body) x=0..40, y=0..40.
 * Electric actuator box above the body with a status/position indicator.
 * Standard symbol for modulating control valves on heating/cooling coils.
 *
 * Per ISA 5.1 / NS-EN ISO 10628-2.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left  mid: x=0,  y=20
 *   outlet = right mid: x=40, y=20
 *   signal = top of actuator: x=20, y=-36
 */
export const controlValve2Way: PidSymbolDefinition = {
  id: "valve-control-2way",
  name: "2-Way Control Valve",
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
    // Actuator stem
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
    ctx.update("body-left", {
      strokeColor: inputs.status === "fault" ? "#ef4444" : "#1e1e1e",
    });
    ctx.update("body-right", {
      strokeColor: inputs.status === "fault" ? "#ef4444" : "#1e1e1e",
    });
    ctx.update("indicator", { backgroundColor: color });
  },
};
