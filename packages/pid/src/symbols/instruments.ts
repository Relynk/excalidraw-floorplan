import { PORT_TYPES } from "../types";
import type { PidSymbolDefinition } from "../types";

/**
 * ISA instrument bubble factory — shared geometry for TT, PT, FT, LT.
 * Bubble body: ellipse x=0..36, y=0..36.
 * Value text below body: y=40.
 *
 * Process port at bottom-centre of bubble: x=18, y=36
 * Signal-out port at right-centre of bubble: x=36, y=18
 */
function makeTransmitterSymbol(
  id: string,
  name: string,
  tag: string, // e.g. "TT"
  valueUnit: string, // e.g. "°C"
  signalType: string[],
): import("../types").PidSymbolDefinition {
  return {
    id,
    name,
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
        x: 7,
        y: 4,
        width: 22,
        height: 14,
        text: tag,
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
      {
        type: "text",
        x: 0,
        y: 40,
        width: 36,
        height: 16,
        text: `-- ${valueUnit}`,
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
        y: 36, // bottom-centre of bubble
        acceptsTypes: [PORT_TYPES.PIPE, ...signalType],
        direction: "in",
      },
      {
        id: "signal-out",
        label: "Signal Output",
        relativeX: 1,
        relativeY: 0.5,
        x: 36,
        y: 18, // right-centre of bubble
        acceptsTypes: [PORT_TYPES.SIGNAL_4_20MA],
        direction: "out",
      },
    ],
    inputs: [
      {
        id: "value",
        label: "Process Value",
        type: "numeric",
        defaultValue: `-- ${valueUnit}`,
      },
    ],
    stateRenderer(inputs, ctx) {
      const val = inputs.value;
      if (val === undefined) return;
      ctx.set("value", "text", `${val} ${valueUnit}`);
    },
  };
}

export const temperatureTransmitter = makeTransmitterSymbol(
  "sensor-temperature",
  "Temperature Transmitter",
  "TT",
  "°C",
  [PORT_TYPES.SIGNAL_4_20MA],
);

export const pressureTransmitter = makeTransmitterSymbol(
  "sensor-pressure",
  "Pressure Transmitter",
  "PT",
  "bar",
  [PORT_TYPES.SIGNAL_4_20MA],
);

export const flowTransmitter = makeTransmitterSymbol(
  "sensor-flow",
  "Flow Transmitter",
  "FT",
  "m³/h",
  [PORT_TYPES.SIGNAL_4_20MA],
);

export const levelTransmitter = makeTransmitterSymbol(
  "sensor-level",
  "Level Transmitter",
  "LT",
  "%",
  [PORT_TYPES.SIGNAL_4_20MA],
);

/**
 * DCS Indicator — square body x=0..36, y=0..36, dashed divider.
 * Signal input at bottom-centre.
 */
export const dcsIndicator: import("../types").PidSymbolDefinition = {
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
    const val = inputs.value;
    if (val === undefined) return;
    ctx.set("tag-number", "text", String(val));
  },
};
