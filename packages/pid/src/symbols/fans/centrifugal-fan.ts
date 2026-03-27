import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Centrifugal Fan (Sentrifugalvifte) — circle body x=0..60, y=0..60.
 * 3-blade propeller impeller from centre hub.
 * Used for supply and extract fans in AHU systems.
 *
 * Per EN ISO 10628-2 / NS-EN conventions for HVAC P&ID.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left edge mid:  x=0,  y=30
 *   outlet = right edge mid: x=60, y=30
 */
export const centrifugalFan: PidSymbolDefinition = {
  id: "fan-centrifugal",
  name: "Centrifugal Fan",
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
    // Hub — centre circle, doubles as status indicator
    {
      type: "ellipse",
      x: 24,
      y: 24,
      width: 12,
      height: 12,
      strokeColor: "#1e1e1e",
      backgroundColor: "#94a3b8",
      strokeWidth: 1.5,
      roughness: 0,
      role: "indicator",
    },
    // Blade 1 — right (0°): centre (30,30) → (52,30)
    {
      type: "line",
      x: 30,
      y: 30,
      width: 22,
      height: 0,
      points: [
        [0, 0],
        [22, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-1",
    },
    // Blade 2 — lower-left (120° screen-CW): centre → (19,49)
    {
      type: "line",
      x: 30,
      y: 30,
      width: 11,
      height: 19,
      points: [
        [0, 0],
        [-11, 19],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-2",
    },
    // Blade 3 — upper-left (240° screen-CW): centre → (19,11)
    {
      type: "line",
      x: 30,
      y: 30,
      width: 11,
      height: 19,
      points: [
        [0, 0],
        [-11, -19],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade-3",
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
