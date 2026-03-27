export * from "./valves";
export * from "./pumps";
export * from "./instruments";

import {
  gateValve,
  ballValve,
  checkValve,
  controlValve,
  reliefValve,
} from "./valves";

import { centrifugalPump, positivePump, compressor } from "./pumps";

import {
  temperatureTransmitter,
  pressureTransmitter,
  flowTransmitter,
  levelTransmitter,
  dcsIndicator,
} from "./instruments";

import type { PidSymbolDefinition } from "../types";

/** All built-in P&ID symbol definitions */
export const ALL_PID_SYMBOLS: PidSymbolDefinition[] = [
  // Valves
  gateValve,
  ballValve,
  checkValve,
  controlValve,
  reliefValve,
  // Pumps / Rotating equipment
  centrifugalPump,
  positivePump,
  compressor,
  // Instruments
  temperatureTransmitter,
  pressureTransmitter,
  flowTransmitter,
  levelTransmitter,
  dcsIndicator,
];

/** Symbols grouped by category */
export const PID_SYMBOLS_BY_CATEGORY = ALL_PID_SYMBOLS.reduce<
  Record<string, PidSymbolDefinition[]>
>((acc, sym) => {
  if (!acc[sym.category]) {
    acc[sym.category] = [];
  }
  acc[sym.category].push(sym);
  return acc;
}, {});
