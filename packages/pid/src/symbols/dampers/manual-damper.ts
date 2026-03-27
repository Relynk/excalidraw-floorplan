import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Manual Damper (Manuelt spjeld / Regulerspjeld)
 *
 * Body: rectangle x=0..60, y=0..30.
 * A single diagonal blade with a T-bar handle for manual adjustment.
 * Used for fixed airflow balancing — set during commissioning.
 *
 * Port x/y from body origin (0,0):
 *   air-in  = left  mid: x=0,  y=15
 *   air-out = right mid: x=60, y=15
 */
export const manualDamper: PidSymbolDefinition = {
  id: "damper-manual",
  name: "Manual Damper",
  category: "Dampers",
  elements: [
    // Duct section body
    {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 60,
      height: 30,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
    },
    // Damper blade — diagonal, showing partially-open position
    {
      type: "line",
      x: 8,
      y: 4,
      width: 44,
      height: 22,
      points: [
        [0, 22],
        [44, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "blade",
    },
    // Pivot shaft (blade centre to handle)
    {
      type: "line",
      x: 30,
      y: -8,
      width: 0,
      height: 8,
      points: [
        [0, 0],
        [0, 8],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "shaft",
    },
    // T-bar adjustment handle
    {
      type: "line",
      x: 20,
      y: -8,
      width: 20,
      height: 0,
      points: [
        [0, 0],
        [20, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "handle",
    },
  ],
  ports: [
    {
      id: "air-in",
      label: "Air Inlet (Luft inn)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 15,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "in",
    },
    {
      id: "air-out",
      label: "Air Outlet (Luft ut)",
      relativeX: 1,
      relativeY: 0.5,
      x: 60,
      y: 15,
      acceptsTypes: [PORT_TYPES.DUCT],
      direction: "out",
    },
  ],
};
