import { PORT_TYPES } from "../types";
import type { PidSymbolDefinition } from "../types";

/**
 * Centrifugal Pump — circle body x=0..50, y=0..50.
 * Label/impeller inside body. No decorators outside body bounds.
 * Port x/y from body origin (0,0):
 *   suction  = left edge mid:  x=0,  y=25
 *   discharge= right edge mid: x=50, y=25
 */
export const centrifugalPump: PidSymbolDefinition = {
  id: "pump-centrifugal",
  name: "Centrifugal Pump",
  category: "Pumps",
  elements: [
    {
      type: "ellipse",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    {
      type: "line",
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      points: [
        [0, 15],
        [30, 0],
        [30, 30],
        [0, 15],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "impeller",
    },
    {
      type: "ellipse",
      x: 4,
      y: 4,
      width: 42,
      height: 42,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      strokeWidth: 0,
      roughness: 0,
      role: "indicator",
    },
    {
      type: "text",
      x: 18,
      y: 16,
      width: 14,
      height: 18,
      text: "P",
      fontSize: 14,
      strokeColor: "#1e1e1e",
      role: "label",
    },
  ],
  ports: [
    {
      id: "suction",
      label: "Suction (Inlet)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 25,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "discharge",
      label: "Discharge (Outlet)",
      relativeX: 1,
      relativeY: 0.5,
      x: 50,
      y: 25,
      acceptsTypes: [PORT_TYPES.PIPE],
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
    ctx.set("indicator", "backgroundColor", color);
  },
};

/**
 * Positive Displacement Pump — rectangle body x=0..60, y=0..40.
 */
export const positivePump: PidSymbolDefinition = {
  id: "pump-positive-displacement",
  name: "Positive Displacement Pump",
  category: "Pumps",
  elements: [
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 60,
      height: 40,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    {
      type: "line",
      x: 30,
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
      role: "piston",
    },
    {
      type: "line",
      x: 6,
      y: 10,
      width: 18,
      height: 20,
      points: [
        [0, 20],
        [18, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "arrow",
    },
    {
      type: "rectangle",
      x: 4,
      y: 4,
      width: 22,
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
      id: "suction",
      label: "Suction",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "discharge",
      label: "Discharge",
      relativeX: 1,
      relativeY: 0.5,
      x: 60,
      y: 20,
      acceptsTypes: [PORT_TYPES.PIPE],
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
    ctx.set("indicator", "backgroundColor", color);
  },
};

/**
 * Compressor — circle body x=0..50, y=0..50. Same as pump but with "C" label.
 */
export const compressor: PidSymbolDefinition = {
  id: "compressor",
  name: "Compressor",
  category: "Pumps",
  elements: [
    {
      type: "ellipse",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    {
      type: "line",
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      points: [
        [30, 15],
        [0, 0],
        [0, 30],
        [30, 15],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "impeller",
    },
    {
      type: "text",
      x: 18,
      y: 16,
      width: 14,
      height: 18,
      text: "C",
      fontSize: 14,
      strokeColor: "#1e1e1e",
      role: "label",
    },
    {
      type: "ellipse",
      x: 4,
      y: 4,
      width: 42,
      height: 42,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      strokeWidth: 0,
      roughness: 0,
      role: "indicator",
    },
  ],
  ports: [
    {
      id: "suction",
      label: "Suction",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 25,
      acceptsTypes: [PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "discharge",
      label: "Discharge",
      relativeX: 1,
      relativeY: 0.5,
      x: 50,
      y: 25,
      acceptsTypes: [PORT_TYPES.PIPE],
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
    ctx.set("indicator", "backgroundColor", color);
  },
};
