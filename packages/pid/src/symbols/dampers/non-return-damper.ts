import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Non-Return Damper / Backdraft Damper (Bakstrømsventil / Returspjeld)
 *
 * Body: rectangle x=0..60, y=0..30.
 * A fixed stop bar at x=30 and a hinged flap to the right that only
 * opens when airflow goes left-to-right, preventing backflow.
 * Typically gravity-operated — no actuator required.
 *
 * Common on extract fan outlets and AHU connections to prevent
 * air recirculation when a unit is off.
 *
 * Port x/y from body origin (0,0):
 *   air-in  = left  mid: x=0,  y=15  (one-way)
 *   air-out = right mid: x=60, y=15
 */
export const nonReturnDamper: PidSymbolDefinition = {
  id: "damper-non-return",
  name: "Non-Return Damper",
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
    // Fixed pivot/stop bar — vertical line at mid-duct
    {
      type: "line",
      x: 28,
      y: 3,
      width: 0,
      height: 24,
      points: [
        [0, 0],
        [0, 24],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "pivot",
    },
    // Upper flap (opens right with forward flow, hangs vertical at rest)
    {
      type: "line",
      x: 28,
      y: 3,
      width: 20,
      height: 12,
      points: [
        [0, 0],
        [20, 12],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "flap-upper",
    },
    // Lower flap (mirror of upper flap)
    {
      type: "line",
      x: 28,
      y: 15,
      width: 20,
      height: 12,
      points: [
        [0, 12],
        [20, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "flap-lower",
    },
  ],
  ports: [
    {
      id: "air-in",
      label: "Air Inlet (Luft inn — énveis)",
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
