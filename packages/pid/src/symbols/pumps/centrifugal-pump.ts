import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Centrifugal Pump (Sentrifugalpumpe) — circle body x=0..60, y=0..60.
 * Triangular impeller symbol per ISO 10628-2.
 * Used for hydronic heating/cooling circulation circuits.
 *
 * Port x/y from body origin (0,0):
 *   suction   = left edge mid:  x=0,  y=30
 *   discharge = right edge mid: x=60, y=30
 */
export const centrifugalPump: PidSymbolDefinition = {
  id: "pump-centrifugal",
  name: "Centrifugal Pump",
  category: "Pumps",
  elements: [
    // Casing circle
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
    // Impeller — triangle pointing toward discharge (right)
    // ISO 10628-2 centrifugal pump symbol
    {
      type: "line",
      x: 12,
      y: 12,
      width: 36,
      height: 36,
      points: [
        [0, 18],
        [36, 0],
        [36, 36],
        [0, 18],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "impeller",
    },
    // Hub — centre indicator for run/stop/fault status
    {
      type: "ellipse",
      x: 24,
      y: 24,
      width: 12,
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
      label: "Suction (Innløp)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 30,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "in",
    },
    {
      id: "discharge",
      label: "Discharge (Utløp)",
      relativeX: 1,
      relativeY: 0.5,
      x: 60,
      y: 30,
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
  },
};
