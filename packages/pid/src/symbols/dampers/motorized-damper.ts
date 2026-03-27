import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Motorised Damper (Motorspjeld)
 *
 * Body: rectangle x=0..60, y=0..30 — represents the duct cross-section.
 * A single diagonal blade shows the damper position. Electric actuator
 * with "M" label sits above via a short shaft.
 *
 * Used extensively in AHU systems: fresh-air intake, exhaust, mixing,
 * bypass, and zone isolation. Per NS-EN 12599 / ASHRAE HVAC P&ID.
 *
 * Port x/y from body origin (0,0):
 *   air-in  = left  mid: x=0,  y=15
 *   air-out = right mid: x=60, y=15
 *   signal  = top of actuator: x=30, y=-18
 */
export const motorizedDamper: PidSymbolDefinition = {
  id: "damper-motorized",
  name: "Motorised Damper",
  category: "Dampers",
  elements: [
    // Duct section body rectangle
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 60,
      height: 30,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Damper blade — diagonal line representing partially-open blade
    {
      type: "line",
      x: 8,
      y: 4,
      width: 44,
      height: 22,
      points: [
        [0, 22],
        [44, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade",
    },
    // Actuator shaft
    {
      type: "line",
      x: 30,
      y: -4,
      width: 0,
      height: 8,
      points: [
        [0, 0],
        [0, 8],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "shaft",
    },
    // Actuator body
    {
      type: "rectangle",
      x: 18,
      y: -18,
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
      x: 20,
      y: -16,
      width: 20,
      height: 10,
      strokeColor: "transparent",
      backgroundColor: "#94a3b8",
      strokeWidth: 0,
      roughness: 0,
      role: "indicator",
    },
    // "M" label inside actuator box
    {
      type: "text",
      x: 26,
      y: -16,
      width: 8,
      height: 10,
      text: "M",
      fontSize: 8,
      strokeColor: "#1e1e1e",
      role: "motor-label",
    },
  ],
  ports: [
    {
      id: "air-in",
      label: "Air Inlet (Luft inn)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 15,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "air-out",
      label: "Air Outlet (Luft ut)",
      relativeX: 1,
      relativeY: 0.5,
      x: 60,
      y: 15,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
    {
      id: "signal",
      label: "Control Signal",
      relativeX: 0.5,
      relativeY: -1,
      x: 30,
      y: -18,
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA, PORT_TYPES.ELECTRICAL_24V],
      direction: "in",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Damper Position",
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
    ctx.update("blade", {
      strokeColor: inputs.status === "fault" ? "#ef4444" : "#1e1e1e",
    });
  },
};
