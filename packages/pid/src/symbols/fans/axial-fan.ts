import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Axial Fan (Aksialvifte) — circle body x=0..60, y=0..60.
 * Central hub with 4 blades at 90° intervals.
 * Typical use: roof extract fans, toilet exhaust, engine room ventilation.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left edge mid:  x=0,  y=30
 *   outlet = right edge mid: x=60, y=30
 */
export const axialFan: PidSymbolDefinition = {
  id: "fan-axial",
  name: "Axial Fan",
  category: "Fans",
  elements: [
    // Outer casing circle
    {
      type: "ellipse",
      x: 0,
      y: 0,
      width: 60,
      height: 60,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Hub circle — status indicator
    {
      type: "ellipse",
      x: 22,
      y: 22,
      width: 16,
      height: 16,
      strokeColor: "#1e1e1e",
      backgroundColor: "#94a3b8",
      strokeWidth: 1.5,
      roughness: 0,
      role: "indicator",
    },
    // Blade right (0°): hub right edge (38,30) → near casing (56,30)
    {
      type: "line",
      x: 38,
      y: 30,
      width: 18,
      height: 0,
      points: [
        [0, 0],
        [18, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-1",
    },
    // Blade left (180°): near casing (4,30) → hub left edge (22,30)
    {
      type: "line",
      x: 4,
      y: 30,
      width: 18,
      height: 0,
      points: [
        [0, 0],
        [18, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-2",
    },
    // Blade down (90°): hub bottom edge (30,38) → near casing (30,56)
    {
      type: "line",
      x: 30,
      y: 38,
      width: 0,
      height: 18,
      points: [
        [0, 0],
        [0, 18],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-3",
    },
    // Blade up (270°): near casing (30,4) → hub top edge (30,22)
    {
      type: "line",
      x: 30,
      y: 4,
      width: 0,
      height: 18,
      points: [
        [0, 0],
        [0, 18],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-4",
    },
  ],
  ports: [
    {
      id: "inlet",
      label: "Air Inlet (Luftinntak)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 30,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Air Outlet (Luftuttak)",
      relativeX: 1,
      relativeY: 0.5,
      x: 60,
      y: 30,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Fan Status",
      type: "discrete",
      allowedValues: ["running", "stopped", "fault"],
      defaultValue: "stopped",
    },
  ],
  stateRenderer(inputs, ctx) {
    const color =
      inputs.status === "running"
        ? "#22c55e"
        : inputs.status === "fault"
          ? "#ef4444"
          : "#94a3b8";
    ctx.update("indicator", { backgroundColor: color });
  },
};
