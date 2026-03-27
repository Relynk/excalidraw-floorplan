import { PORT_TYPES } from "../../types";
import type { PidSymbolDefinition } from "../../types";

/**
 * Check Valve / Non-Return Valve (Tilbakeslagsventil)
 *
 * Body: upright barrier line on the inlet side (x=0) plus a rightward-pointing
 * triangle — ISA 5.1 / ISO 10628-2 check valve symbol. Flow is permitted
 * left-to-right only.
 *
 * Body bbox: x=0..40, y=0..40.
 *
 * Port x/y from body origin (0,0):
 *   inlet  = left  mid: x=0,  y=20
 *   outlet = right mid: x=40, y=20
 */
export const checkValve: PidSymbolDefinition = {
  id: "valve-check",
  name: "Check Valve",
  category: "Valves",
  elements: [
    // Barrier line at inlet (prevents reverse flow)
    {
      type: "line",
      x: 0,
      y: 0,
      width: 0,
      height: 40,
      points: [
        [0, 0],
        [0, 40],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body-barrier",
    },
    // Rightward-pointing triangle — allowed flow direction
    {
      type: "line",
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      points: [
        [0, 0],
        [40, 20],
        [0, 40],
        [0, 0],
      ],
      strokeColor: "#1e1e1e",
      strokeWidth: 2,
      roughness: 0,
      role: "body",
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
