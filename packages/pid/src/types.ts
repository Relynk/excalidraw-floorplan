/**
 * Core type definitions for the P&ID symbol library.
 *
 * P&ID symbols are groups of standard excalidraw elements with rich customData
 * that describes typed connection ports, variable bindings, and symbol metadata.
 * No new excalidraw element types are required.
 */

// ---------------------------------------------------------------------------
// Port types
// ---------------------------------------------------------------------------

/**
 * String identifier for a connection medium type.
 * Built-in values: "pipe", "steam-pipe", "electrical-24v", "signal-4-20mA", "instrument-air"
 * Custom values are freely defined — any string is valid.
 */
export type PortType = string;

/** Well-known port type constants to reduce magic strings */
export const PORT_TYPES = {
  PIPE: "pipe",
  STEAM_PIPE: "steam-pipe",
  ELECTRICAL_24V: "electrical-24v",
  SIGNAL_4_20MA: "signal-4-20mA",
  INSTRUMENT_AIR: "instrument-air",
} as const;

/** A typed connection point on a P&ID symbol */
export interface PidPort {
  /** Unique within this symbol */
  id: string;
  /** Human-readable label, e.g. "Inlet" */
  label: string;
  /**
   * Horizontal position relative to symbol bounding box, 0 = left edge, 1 = right edge.
   * Used when `x` is not provided.
   */
  relativeX: number;
  /**
   * Vertical position relative to symbol bounding box, 0 = top edge, 1 = bottom edge.
   * Used when `y` is not provided.
   */
  relativeY: number;
  /**
   * Absolute X pixel offset from the body origin (min x of elements with role "body*").
   * When provided, takes priority over relativeX.
   * Use this for precise placement independent of decorator elements (stems, labels).
   *
   * @example
   * // Gate valve body spans x=0..40. Inlet at left edge of body:
   * x: 0
   * // Outlet at right edge:
   * x: 40
   */
  x?: number;
  /**
   * Absolute Y pixel offset from the body origin (min y of elements with role "body*").
   * When provided, takes priority over relativeY.
   */
  y?: number;
  /**
   * Which port types can connect to this port.
   * An untyped line (null pipeType) can connect to any port and inherits the
   * first acceptsType as its pipeType.
   */
  acceptsTypes: PortType[];
  direction?: "in" | "out" | "bidirectional";
}

// ---------------------------------------------------------------------------
// Symbol definition (used at authoring time, not stored on canvas elements)
// ---------------------------------------------------------------------------

/**
 * Template for a single element within a symbol definition.
 * Coordinates are relative to the symbol's local origin (top-left).
 */
export interface PidElementTemplate {
  type: "line" | "rectangle" | "ellipse" | "diamond" | "text";
  /** X offset from symbol origin */
  x: number;
  /** Y offset from symbol origin */
  y: number;
  width: number;
  height: number;
  /** For line elements: array of [x, y] relative to the element's own x/y */
  points?: [number, number][];
  // Style
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: "hachure" | "cross-hatch" | "solid" | "zigzag";
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  roughness?: number;
  opacity?: number;
  // Text-specific
  text?: string;
  fontSize?: number;
  /**
   * Role within the symbol. Used by the state engine to target specific
   * elements for property changes (e.g. "indicator", "label", "value").
   */
  role?: string;
}

/** A complete P&ID symbol definition, used to generate LibraryItems */
export interface PidSymbolDefinition {
  /** Unique identifier, e.g. "valve-gate", "pump-centrifugal" */
  id: string;
  /** Display name shown in the library, e.g. "Gate Valve" */
  name: string;
  /** Category for grouping in the library, e.g. "Valves", "Pumps", "Instruments" */
  category: string;
  /** Visual elements that compose the symbol */
  elements: PidElementTemplate[];
  /** Typed connection points */
  ports: PidPort[];
}

// ---------------------------------------------------------------------------
// Variable bindings
// ---------------------------------------------------------------------------

/** Which element property can be driven by an external variable */
export type BindableProperty =
  | "strokeColor"
  | "backgroundColor"
  | "opacity"
  | "visible"
  | "text";

/**
 * Maps an external variable to a visual property change on a specific element
 * within a placed symbol.
 *
 * @example
 * // Discrete state → color mapping
 * {
 *   variableId: "pump_01.status",
 *   targetElementRole: "indicator",
 *   property: "backgroundColor",
 *   mapping: { running: "#22c55e", stopped: "#ef4444", fault: "#f97316" }
 * }
 *
 * @example
 * // Numeric value → text display
 * {
 *   variableId: "tag_TT_01.value",
 *   targetElementRole: "value",
 *   property: "text",
 *   mapping: { "*": "${value} °C" }
 * }
 */
export interface VariableBinding {
  /** The external variable identifier (e.g. OPC-UA node ID, tag name) */
  variableId: string;
  /**
   * Role string matching PidElementTemplate.role on the target sub-element.
   * Used to find the target element within the symbol group on the canvas.
   */
  targetElementRole: string;
  property: BindableProperty;
  /**
   * Maps variable values (as strings) to property values.
   * - Exact key match takes priority.
   * - "*" is a wildcard/default. For text properties, "${value}" in the
   *   mapped string is replaced with the actual value.
   */
  mapping: Record<string, string | number | boolean>;
}

// ---------------------------------------------------------------------------
// customData schemas for placed canvas elements
// ---------------------------------------------------------------------------

/**
 * customData on the root/representative element of a placed P&ID symbol group.
 * The root element is whichever element in the group has `pidSymbol: true`.
 */
export interface PidSymbolCustomData {
  /** Discriminator — identifies this element as a P&ID symbol root */
  pidSymbol: true;
  /** References PidSymbolDefinition.id */
  symbolId: string;
  /** Port definitions, copied from the symbol definition at placement time */
  ports: PidPort[];
  /**
   * Variable bindings configured per instance after placement.
   * Not set by the library — host app sets these via scene.mutateElement().
   */
  bindings?: VariableBinding[];
}

/**
 * customData on every sub-element within a placed P&ID symbol group.
 * Allows the state engine to find elements by role.
 */
export interface PidElementCustomData {
  /** Role within the symbol, e.g. "body", "label", "indicator", "value" */
  pidElementRole: string;
  /** The element id of the symbol's root element (the one with pidSymbol: true) */
  pidRootId: string;
}

/**
 * customData on line elements that connect two P&ID ports.
 * Written by App.tsx when a line snaps to a port.
 */
export interface PidConnectionCustomData {
  pidConnection: {
    startPort?: { elementId: string; portId: string };
    endPort?: { elementId: string; portId: string };
    /**
     * The pipe/medium type for this connection.
     * Inherited from the first port that was connected.
     */
    pipeType: PortType;
  };
}

// ---------------------------------------------------------------------------
// Resolved port (runtime, not stored on canvas)
// ---------------------------------------------------------------------------

/** A port with its absolute canvas position resolved from element transform */
export interface ResolvedPort {
  port: PidPort;
  /** Absolute canvas coordinates */
  x: number;
  y: number;
  /** The element id of the symbol root that owns this port */
  ownerElementId: string;
}
