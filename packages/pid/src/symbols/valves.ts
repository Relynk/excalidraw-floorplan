import { PORT_TYPES } from "../types";
import type { PidSymbolDefinition } from "../types";

/**
 * Gate Valve — ISA 5.1 style.
 * Body: two opposing triangles spanning x=0..40, y=0..40.
 * Stem goes up from x=20, y=-14. Handwheel at y=-14.
 *
 * Body bbox: x=0..40, y=0..40.
 * Port x/y are absolute offsets from body origin (0,0).
 *   Inlet  = left edge,  midpoint of body height: x=0,  y=20
 *   Outlet = right edge, midpoint of body height: x=40, y=20
 */
export const gateValve: PidSymbolDefinition = {
  id: "valve-gate",
  name: "Gate Valve",
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
    // Handwheel
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
      label: "Inlet",
      relativeX: 0,
      relativeY: 0.5, // fallback
      x: 0,
      y: 20, // absolute: left edge, mid-height of body
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20, // absolute: right edge, mid-height of body
      acceptsTypes: [PORT_TYPES.PIPE],
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

/**
 * Ball Valve — circle body x=0..40, y=0..40. Stem at y=-12.
 * Body bbox: x=0..40, y=0..40.
 */
export const ballValve: PidSymbolDefinition = {
  id: "valve-ball",
  name: "Ball Valve",
  category: "Valves",
  elements: [
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
  ],
  ports: [
    {
      id: "inlet",
      label: "Inlet",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
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

/**
 * Check Valve — left barrier + flow arrow pointing right.
 * Body spans x=0..40, y=0..40.
 */
export const checkValve: PidSymbolDefinition = {
  id: "valve-check",
  name: "Check Valve",
  category: "Valves",
  elements: [
    {
      type: "line",
      x: 0,
      y: 0,
      width: 0,
      height: 40,
      points: [
        [0, 0],
        [0, 40],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-barrier",
    },
    {
      type: "line",
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      points: [
        [0, 0],
        [40, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
  ],
  ports: [
    {
      id: "inlet",
      label: "Inlet",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "out",
    },
  ],
};

/**
 * Control Valve — gate valve body with actuator box on top.
 * Body bbox: x=0..40, y=0..40. Actuator at y=-36..-20. Stem at y=-20..0.
 * Process ports at left/right of body (y=20).
 * Signal port at top-centre of actuator.
 */
export const controlValve: PidSymbolDefinition = {
  id: "valve-control",
  name: "Control Valve",
  category: "Valves",
  elements: [
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
      strokeWidth: 2,
      roughness: 0,
      role: "stem",
    },
    {
      type: "rectangle",
      x: 8,
      y: -36,
      width: 24,
      height: 16,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "actuator",
    },
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
      label: "Inlet",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "out",
    },
    {
      id: "signal",
      label: "Control Signal",
      relativeX: 0.5,
      relativeY: -1,
      x: 20,
      y: -36, // top-centre of actuator box
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA, PORT_TYPES.ELECTRICAL_24V],
      direction: "in",
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
    const strokeColor = inputs.status === "open" ? "#22c55e" : "#ef4444";
    ctx.update("body-left", { strokeColor });
    ctx.update("body-right", { strokeColor });
    ctx.update("indicator", { backgroundColor: strokeColor });
  },
};

/**
 * Safety Relief Valve — upward-pointing triangle body with spring.
 * Body triangle: x=0..40, y=20..40. Base line at y=40.
 * Spring at x=16..24, y=0..20.
 * Process port at bottom-centre of body. Discharge at right.
 */
export const reliefValve: PidSymbolDefinition = {
  id: "valve-relief",
  name: "Safety Relief Valve",
  category: "Valves",
  elements: [
    {
      type: "line",
      x: 0,
      y: 20,
      width: 40,
      height: 20,
      points: [
        [0, 20],
        [20, 0],
        [40, 20],
        [0, 20],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    {
      type: "line",
      x: 0,
      y: 40,
      width: 40,
      height: 0,
      points: [
        [0, 0],
        [40, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "base",
    },
    {
      type: "line",
      x: 16,
      y: 0,
      width: 8,
      height: 20,
      points: [
        [4, 0],
        [0, 5],
        [8, 10],
        [0, 15],
        [4, 20],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "spring",
    },
  ],
  ports: [
    {
      id: "inlet",
      label: "Inlet",
      relativeX: 0.5,
      relativeY: 1,
      x: 20,
      y: 40, // bottom-centre of body
      acceptsTypes: [PORT_TYPES.PIPE, PORT_TYPES.STEAM_PIPE],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Discharge",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 30, // right mid-height of body triangle
      acceptsTypes: [PORT_TYPES.PIPE, PORT_TYPES.STEAM_PIPE],
      direction: "out",
    },
  ],
};
