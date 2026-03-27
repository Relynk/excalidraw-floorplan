import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Plate Heat Exchanger (Platevarmeveksler)
 *
 * Body: rectangle x=0..50, y=0..70.
 * Two crossing diagonal lines inside represent the two fluid paths in
 * counter-flow configuration — standard ISO 10628-2 plate HX symbol.
 *
 * Primary use: district heating (fjernvarme) substation — transfers
 * heat from the district heating supply to the building's heating circuit.
 *
 * Port x/y from body origin (0,0):
 *   primary-in   = right upper: x=50, y=10  (DH supply in)
 *   primary-out  = right lower: x=50, y=60  (DH return out)
 *   secondary-out = left upper: x=0,  y=10  (building supply out)
 *   secondary-in  = left lower: x=0,  y=60  (building return in)
 */
export const plateHeatExchanger: PidSymbolDefinition = {
  id: "hx-plate",
  name: "Plate Heat Exchanger",
  category: "Heat Exchangers",
  elements: [
    // Plate pack body
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 50,
      height: 70,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Primary flow path: top-right → bottom-left (hot side)
    {
      type: "line",
      x: 5,
      y: 5,
      width: 40,
      height: 60,
      points: [
        [40, 0],
        [0, 60],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "flow-primary",
    },
    // Secondary flow path: top-left → bottom-right (cold side, counter-flow)
    {
      type: "line",
      x: 5,
      y: 5,
      width: 40,
      height: 60,
      points: [
        [0, 0],
        [40, 60],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 1.5,
      roughness: 0,
      role: "flow-secondary",
    },
  ],
  ports: [
    {
      id: "primary-in",
      label: "Primary Inlet — DH Supply (Primær inn)",
      relativeX: 1,
      relativeY: 0.14,
      x: 50,
      y: 10,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
      direction: "in",
    },
    {
      id: "primary-out",
      label: "Primary Outlet — DH Return (Primær ut)",
      relativeX: 1,
      relativeY: 0.86,
      x: 50,
      y: 60,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
      direction: "out",
    },
    {
      id: "secondary-out",
      label: "Secondary Outlet — Building Supply (Sekundær ut)",
      relativeX: 0,
      relativeY: 0.14,
      x: 0,
      y: 10,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
      direction: "out",
    },
    {
      id: "secondary-in",
      label: "Secondary Inlet — Building Return (Sekundær inn)",
      relativeX: 0,
      relativeY: 0.86,
      x: 0,
      y: 60,
      acceptsTypes: [PORT_TYPES.HEATING_WATER, PORT_TYPES.PIPE],
      direction: "in",
    },
  ],
};
