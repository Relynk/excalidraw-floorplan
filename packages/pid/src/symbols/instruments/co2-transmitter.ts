import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * CO₂ Transmitter (CO₂-transmitter)
 *
 * ISA 5.1 instrument bubble: circle body x=0..36, y=0..36.
 * Monitors indoor air quality in return air or occupied zones.
 * Used for demand-controlled ventilation (behovsstyrt ventilasjon — DCV)
 * per NS-EN 13779 / NS-EN 15251. Common setpoint: 800–1000 ppm.
 *
 * Port x/y from body origin (0,0):
 *   process    = bottom centre: x=18, y=36
 *   signal-out = right centre:  x=36, y=18
 */
export const co2Transmitter: PidSymbolDefinition = {
  id: "sensor-co2",
  name: "CO₂ Transmitter",
  category: "Instruments",
  elements: [
    {
      type: "ellipse",
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
      roughness: 0,
      role: "divider",
    },
    {
      type: "text",
      x: 3,
      y: 4,
      width: 30,
      height: 14,
      text: "CO2",
      fontSize: 10,
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
    {
      type: "text",
      x: 0,
      y: 40,
      width: 36,
      height: 16,
      text: "-- ppm",
      fontSize: 11,
      strokeColor: "#374151",
      role: "value",
    },
  ],
  ports: [
    {
      id: "process",
      label: "Process Connection",
      relativeX: 0.5,
      relativeY: 1,
      x: 18,
      y: 36,
      acceptsTypes: [PORT_TYPES.DUCT, PORT_TYPES.SIGNAL_4_20MA],
      direction: "in",
    },
    {
      id: "signal-out",
      label: "Signal Output (4–20 mA)",
      relativeX: 1,
      relativeY: 0.5,
      x: 36,
      y: 18,
      acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA],
      direction: "out",
    },
  ],
  inputs: [
    {
      id: "value",
      label: "CO₂ Concentration (ppm)",
      type: "numeric",
      defaultValue: "--",
    },
  ],
  stateRenderer(inputs, ctx) {
    if (inputs.value === undefined) return;
    ctx.set("value", "text", `${inputs.value} ppm`);
    // Amber alarm body when CO₂ exceeds 1000 ppm
    const ppm = Number(inputs.value);
    if (!isNaN(ppm)) {
      ctx.update("body", { strokeColor: ppm > 1000 ? "#f59e0b" : "#1e1e1e" });
    }
  },
};
