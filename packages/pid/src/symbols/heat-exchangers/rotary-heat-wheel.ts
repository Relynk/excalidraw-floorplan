import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Rotary Heat Wheel / Energy Recovery Wheel
 * (Rotasjonsvarmegjenvinner / Roterende varmegjenvinner)
 *
 * Body: circle x=0..80, y=0..80.
 * A dashed horizontal divider separates supply air (upper half)
 * from extract air (lower half). A curved CW rotation arrow shows the
 * wheel is rotating, transferring heat between the two air streams.
 *
 * Mandatory in virtually all modern Norwegian AHUs per TEK17 energy
 * requirements. Per EN 308 / NS-EN ISO 10628-2 P&ID conventions.
 *
 * Port x/y from body origin (0,0):
 *   supply-in   = left  upper: x=0,  y=20
 *   supply-out  = right upper: x=80, y=20
 *   extract-in  = right lower: x=80, y=60
 *   extract-out = left  lower: x=0,  y=60
 */
export const rotaryHeatWheel: PidSymbolDefinition = {
  id: "hx-rotary-heat-wheel",
  name: "Rotary Heat Wheel",
  category: "Heat Exchangers",
  elements: [
    // Outer wheel casing circle
    {
      type: "ellipse",
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Horizontal dashed divider — separates supply (top) from extract (bottom)
    {
      type: "line",
      x: 0,
      y: 40,
      width: 80,
      height: 0,
      points: [
        [0, 0],
        [80, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      strokeStyle: "dashed",
      roughness: 0,
      role: "divider",
    },
    // Centre axle hub
    {
      type: "ellipse",
      x: 34,
      y: 34,
      width: 12,
      height: 12,
      strokeColor: "#1e1e1e",
      backgroundColor: "#94a3b8",
      strokeWidth: 1.5,
      roughness: 0,
      role: "indicator",
    },
    // Rotation arc — CW semicircle in upper half from 9-o'clock to 3-o'clock.
    // Approximated with 5 Bézier-like control points at r=18 from centre (40,40).
    // Element positioned at (22,22), the arc's top-left bounding corner.
    // Points relative to (22,22):
    //   (0,18)  → abs (22,40) — 9 o'clock start
    //   (3,5)   → abs (25,27) — upper-left arc
    //   (18,0)  → abs (40,22) — 12 o'clock apex
    //   (33,5)  → abs (55,27) — upper-right arc
    //   (36,18) → abs (58,40) — 3 o'clock end
    //   (33,22) → abs (55,44) — arrowhead hook pointing CW (downward at 3 o'clock)
    {
      type: "line",
      x: 22,
      y: 22,
      width: 36,
      height: 22,
      points: [
        [0, 18],
        [3, 5],
        [18, 0],
        [33, 5],
        [36, 18],
        [33, 22],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "rotation-arrow",
    },
    // "SUPPLY" label — upper half
    {
      type: "text",
      x: 8,
      y: 8,
      width: 64,
      height: 12,
      text: "SUPPLY",
      fontSize: 9,
      strokeColor: "#374151",
      role: "label-supply",
    },
    // "EXHAUST" label — lower half
    {
      type: "text",
      x: 8,
      y: 60,
      width: 64,
      height: 12,
      text: "EXHAUST",
      fontSize: 9,
      strokeColor: "#374151",
      role: "label-exhaust",
    },
  ],
  ports: [
    {
      id: "supply-in",
      label: "Supply Air Inlet (Tilluft inn)",
      relativeX: 0,
      relativeY: 0.25,
      x: 0,
      y: 20,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "supply-out",
      label: "Supply Air Outlet (Tilluft ut)",
      relativeX: 1,
      relativeY: 0.25,
      x: 80,
      y: 20,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
    {
      id: "extract-in",
      label: "Extract Air Inlet (Avtrekk inn)",
      relativeX: 1,
      relativeY: 0.75,
      x: 80,
      y: 60,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "extract-out",
      label: "Extract Air Outlet (Avtrekk ut)",
      relativeX: 0,
      relativeY: 0.75,
      x: 0,
      y: 60,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "status",
      label: "Equipment Status",
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
    ctx.update("rotation-arrow", {
      strokeColor: inputs.status === "running" ? "#22c55e" : "#1e1e1e",
    });
  },
};
