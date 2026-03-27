// ─── Fans ────────────────────────────────────────────────────────────────────
import { centrifugalFan } from "./fans/centrifugal-fan";
import { axialFan } from "./fans/axial-fan";

// ─── Pumps ───────────────────────────────────────────────────────────────────
import { centrifugalPump } from "./pumps/centrifugal-pump";

// ─── Heat Exchangers ─────────────────────────────────────────────────────────
import { rotaryHeatWheel } from "./heat-exchangers/rotary-heat-wheel";
import { plateHeatExchanger } from "./heat-exchangers/plate-heat-exchanger";
import { heatingCoil } from "./heat-exchangers/heating-coil";
import { coolingCoil } from "./heat-exchangers/cooling-coil";

// ─── Valves ──────────────────────────────────────────────────────────────────
import { gateValve } from "./valves/gate-valve";
import { ballValve } from "./valves/ball-valve";
import { checkValve } from "./valves/check-valve";
import { butterflyValve } from "./valves/butterfly-valve";
import { controlValve2Way } from "./valves/control-valve-2way";
import { controlValve3Way } from "./valves/control-valve-3way";
import { balancingValve } from "./valves/balancing-valve";

// ─── Dampers ─────────────────────────────────────────────────────────────────
import { motorizedDamper } from "./dampers/motorized-damper";
import { manualDamper } from "./dampers/manual-damper";
import { nonReturnDamper } from "./dampers/non-return-damper";

// ─── Filters ─────────────────────────────────────────────────────────────────
import { preFilter } from "./filters/pre-filter";
import { fineFilter } from "./filters/fine-filter";

// ─── Instruments ─────────────────────────────────────────────────────────────
import { temperatureTransmitter } from "./instruments/temperature-transmitter";
import { pressureTransmitter } from "./instruments/pressure-transmitter";
import { humidityTransmitter } from "./instruments/humidity-transmitter";
import { co2Transmitter } from "./instruments/co2-transmitter";
import { flowTransmitter } from "./instruments/flow-transmitter";
import { differentialPressureTransmitter } from "./instruments/differential-pressure-transmitter";
import { levelTransmitter } from "./instruments/level-transmitter";
import { dcsIndicator } from "./instruments/dcs-indicator";

import type { PidSymbolDefinition } from "../types";

// ─── Named re-exports (for consumers who import individual symbols) ───────────
export {
  centrifugalFan,
  axialFan,
  centrifugalPump,
  rotaryHeatWheel,
  plateHeatExchanger,
  heatingCoil,
  coolingCoil,
  gateValve,
  ballValve,
  checkValve,
  butterflyValve,
  controlValve2Way,
  controlValve3Way,
  balancingValve,
  motorizedDamper,
  manualDamper,
  nonReturnDamper,
  preFilter,
  fineFilter,
  temperatureTransmitter,
  pressureTransmitter,
  humidityTransmitter,
  co2Transmitter,
  flowTransmitter,
  differentialPressureTransmitter,
  levelTransmitter,
  dcsIndicator,
};

// ─── Symbol registry ─────────────────────────────────────────────────────────

/** All built-in P&ID symbol definitions */
export const ALL_PID_SYMBOLS: PidSymbolDefinition[] = [
  // Fans (Ventilatorer)
  centrifugalFan,
  axialFan,

  // Pumps (Pumper)
  centrifugalPump,

  // Heat Exchangers (Varmevekslere)
  rotaryHeatWheel,
  plateHeatExchanger,
  heatingCoil,
  coolingCoil,

  // Valves (Ventiler)
  gateValve,
  ballValve,
  checkValve,
  butterflyValve,
  controlValve2Way,
  controlValve3Way,
  balancingValve,

  // Dampers (Spjeld)
  motorizedDamper,
  manualDamper,
  nonReturnDamper,

  // Filters (Filtre)
  preFilter,
  fineFilter,

  // Instruments (Instrumenter)
  temperatureTransmitter,
  pressureTransmitter,
  humidityTransmitter,
  co2Transmitter,
  flowTransmitter,
  differentialPressureTransmitter,
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

/** Fast lookup of symbol definitions by id — used by the state engine */
export const PID_SYMBOLS_BY_ID = new Map<string, PidSymbolDefinition>(
  ALL_PID_SYMBOLS.map((s) => [s.id, s]),
);
