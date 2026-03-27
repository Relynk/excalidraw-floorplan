import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Balancing Valve / Double-Regulating Valve
 * (Innreguleringsventil / Balanseringsventil)
 *
 * Body: two opposing triangles (gate valve body) x=0..40, y=0..40.
 * A small filled square at the pinch point marks the adjustable orifice.
 * Short stem with cross-head adjustment screw on top.
 * Manually set during system commissioning to balance hydronic circuits.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left  mid: x=0,  y=20
 *   outlet = right mid: x=40, y=20
 */
export const balancingValve: PidSymbolDefinition = {
  id: "valve-balancing",
  name: "Balancing Valve",
  category: "Valves",
  elements: [
    // Left triangle
    {
      type: "line",
      x: 0,
      y: 0,
      width: 20,
      height: 40,
      points: [
        [0, 0],
        [20, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-left",
    },
    // Right triangle
    {
      type: "line",
      x: 20,
      y: 0,
      width: 20,
      height: 40,
      points: [
        [0, 0],
        [-20, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-right",
    },
    // Adjustable orifice marker — filled square at pinch point
    {
      type: "rectangle",
      x: 17,
      y: 17,
      width: 6,
      height: 6,
      strokeColor: "#1e1e1e",
      backgroundColor: "#1e1e1e",
      fillStyle: "solid",
      strokeWidth: 1,
      roughness: 0,
      role: "orifice",
    },
    // Short stem
    {
      type: "line",
      x: 20,
      y: -10,
      width: 0,
      height: 10,
      points: [
        [0, 0],
        [0, 10],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "stem",
    },
    // Adjustment cross — horizontal bar of cross-head screw
    {
      type: "line",
      x: 12,
      y: -10,
      width: 16,
      height: 0,
      points: [
        [0, 0],
        [16, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "adjustment-h",
    },
    // Adjustment cross — vertical bar
    {
      type: "line",
      x: 20,
      y: -14,
      width: 0,
      height: 8,
      points: [
        [0, 0],
        [0, 8],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "adjustment-v",
    },
  ],
  ports: [
    {
      id: "inlet",
      label: "Inlet (Innløp)",
      relativeX: 0,
      relativeY: 0.5,
      x: 0,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "in",
    },
    {
      id: "outlet",
      label: "Outlet (Utløp)",
      relativeX: 1,
      relativeY: 0.5,
      x: 40,
      y: 20,
      acceptsTypes: [
        PORT_TYPES.PIPE,
        PORT_TYPES.HEATING_WATER,
        PORT_TYPES.CHILLED_WATER,
      ],
      direction: "out",
    },
  ],
};
