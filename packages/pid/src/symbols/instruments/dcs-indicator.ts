import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * DCS / BAS Indicator (Styresystemindikator — AI/DI)
 *
 * ISA 5.1 instrument bubble — square body (shared-display, DCS-connected).
 * Per ISA 5.1: square = shared display / control system function.
 * Dashed divider indicates the signal is processed by the BAS/DCS.
 *
 * Used to represent any displayed value in the building automation
 * system without a dedicated field transmitter symbol.
 *
 * Port x/y from body origin (0,0):
 *   signal-in = bottom centre: x=18, y=36
 */
export const dcsIndicator: PidSymbolDefinition = {
  id: "dcs-indicator",
  name: "DCS Indicator",
  category: "Instruments",
  elements: [
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 36,
      height: 36,
      strokeColor: "#1e1e1e",
      backgroundColor: "#ffffff",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Dashed divider — ISA convention: dashed = shared-display device
    {
      type: "line",
      x: 2,
      y: 18,
      width: 32,
      height: 0,
      points: [
        [0, 0],
        [32, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1,
      strokeStyle: "dashed",
      roughness: 0,
      role: "divider",
    },
    {
      type: "text",
      x: 7,
      y: 4,
      width: 22,
      height: 14,
      text: "AI",
      fontSize: 11,
      strokeColor: "#1e1e1e",
      role: "tag",
    },
    {
      type: "text",
      x: 7,
      y: 20,
      width: 22,
      height: 14,
      text: "001",
      fontSize: 11,
      strokeColor: "#1e1e1e",
      role: "tag-number",
    },
  ],
  ports: [
    {
      id: "signal-in",
      label: "Signal Input",
      relativeX: 0.5,
      relativeY: 1,
      x: 18,
      y: 36,
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA, PORT_TYPES.ELECTRICAL_24V],
      direction: "in",
    },
  ],
  inputs: [
    {
      id: "value",
      label: "Display Value",
      type: "numeric",
      defaultValue: "--",
    },
  ],
  stateRenderer(inputs, ctx) {
    if (inputs.value === undefined) return;
    ctx.set("tag-number", "text", String(inputs.value));
  },
};
