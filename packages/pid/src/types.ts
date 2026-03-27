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
  /** Air duct connection — supply, return, extract, or exhaust air */
  DUCT: "duct",
  /** Heating water circuit (e.g. from boiler or district heating) */
  HEATING_WATER: "heating-water",
  /** Chilled water circuit (from chiller or cooling source) */
  CHILLED_WATER: "chilled-water",
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
  /**
   * Named input slots that this symbol accepts.
   * Callers bind external variables to these inputs by name.
   * Defined alongside the symbol so callers don't need knowledge of internal roles.
   */
  inputs?: PidSymbolInput[];
  /**
   * JavaScript renderer function that maps input values to visual updates.
   * Called by the state engine whenever bound variable values change.
   *
   * Takes priority over stateRules when both are defined.
   * Use this for any logic that benefits from conditionals, arithmetic, or
   * updating multiple sub-elements together.
   *
   * @see PidStateRenderer
   */
  stateRenderer?: PidStateRenderer;

  /**
   * Declarative fallback for simple value→property mappings.
   * Used when stateRenderer is absent.
   * @deprecated Prefer stateRenderer for new symbols.
   */
  stateRules?: PidStateRule[];
}

// ---------------------------------------------------------------------------
// Symbol inputs and state renderer (symbol-internal logic)
// ---------------------------------------------------------------------------

/**
 * Declares a named input slot on a P&ID symbol.
 * Inputs describe what external data a symbol can accept, without coupling
 * the symbol definition to specific variable IDs or external systems.
 *
 * @example
 * { id: "status", label: "Equipment Status", type: "discrete",
 *   allowedValues: ["running", "stopped", "fault"], defaultValue: "stopped" }
 */
export interface PidSymbolInput {
  /** Unique within this symbol, e.g. "status", "value", "setpoint" */
  id: string;
  /** Human-readable label for UI, e.g. "Equipment Status" */
  label: string;
  /** Data type hint for validation and UI rendering */
  type: "discrete" | "numeric" | "text";
  /** For discrete inputs: the set of accepted values (for UI and validation) */
  allowedValues?: string[];
  /** Default visual state when no external variable is bound */
  defaultValue?: string | number | boolean;
}

/**
 * Visual properties that can be updated on a symbol sub-element by a renderer.
 * Pass a subset — only specified properties are changed; the rest are untouched.
 */
export interface PidVisualProps {
  /** CSS colour string, e.g. "#22c55e" or "transparent" */
  strokeColor?: string;
  /** CSS colour string */
  backgroundColor?: string;
  /** 0 (transparent) – 100 (fully opaque) */
  opacity?: number;
  /** false = hidden (not rendered), true = visible */
  visible?: boolean;
  /** Replaces the text content; only effective on text elements */
  text?: string;
}

/**
 * Context object passed to a symbol's stateRenderer.
 * Provides typed helpers for updating sub-element visuals by role name.
 */
export interface PidSymbolContext {
  /**
   * Update one or more visual properties on the sub-element with the given role.
   * Only provided properties are changed; others are left untouched.
   *
   * @example
   * ctx.update('indicator', { backgroundColor: '#22c55e', opacity: 100 });
   */
  update(role: string, props: PidVisualProps): void;

  /**
   * Shorthand for updating a single property.
   * Equivalent to ctx.update(role, { [property]: value }).
   *
   * @example
   * ctx.set('body-left', 'strokeColor', '#22c55e');
   */
  set(
    role: string,
    property: keyof PidVisualProps,
    value: string | number | boolean,
  ): void;
}

/**
 * A JavaScript function that maps current input values to visual updates on
 * the symbol's sub-elements. Called by the state engine whenever any bound
 * variable changes.
 *
 * The function is called with all input values resolved from the bound
 * variables. Inputs not bound to any variable arrive as `undefined`; the
 * renderer can choose to skip, reset, or handle them.
 *
 * @example
 * // Pump: colour-code the indicator by equipment status
 * stateRenderer(inputs, ctx) {
 *   const color =
 *     inputs.status === 'running' ? '#22c55e' :
 *     inputs.status === 'fault'   ? '#ef4444' : '#94a3b8';
 *   ctx.set('indicator', 'backgroundColor', color);
 * }
 *
 * @example
 * // Gate valve: same colour applied to both body triangles
 * stateRenderer(inputs, ctx) {
 *   const color = inputs.status === 'open' ? '#22c55e' : '#ef4444';
 *   ctx.update('body-left',  { strokeColor: color });
 *   ctx.update('body-right', { strokeColor: color });
 * }
 *
 * @example
 * // Temperature transmitter: formatted value text + alarm highlight
 * stateRenderer(inputs, ctx) {
 *   const val = inputs.value;
 *   if (val === undefined) return;
 *   ctx.set('value', 'text', `${val} °C`);
 *   ctx.update('body', { strokeColor: Number(val) > 80 ? '#ef4444' : '#1e1e1e' });
 * }
 */
export type PidStateRenderer = (
  inputs: Record<string, string | number | boolean | undefined>,
  ctx: PidSymbolContext,
) => void;

/**
 * Maps an input value to a visual property change on a specific sub-element.
 * @deprecated Prefer stateRenderer for new symbols. stateRules remain
 *             supported as a fallback when stateRenderer is absent.
 */
export interface PidStateRule {
  /** References PidSymbolInput.id on this symbol */
  inputId: string;
  /**
   * Role of the target sub-element.
   * A single inputId can have multiple rules targeting different sub-elements.
   */
  targetElementRole: string;
  property: BindableProperty;
  /**
   * Maps input values (as strings) to property values.
   * - Exact key match takes priority.
   * - "*" is a wildcard/default. For text properties, "${value}" is interpolated.
   */
  mapping: Record<string, string | number | boolean>;
}

/**
 * Maps an input value to a visual property change on a specific sub-element.
 * State rules are part of the symbol definition — they encode the symbol's
 * internal display logic so callers don't need to know about roles or mappings.
 *
 * @example
 * // Pump running/stopped/fault → indicator color
 * { inputId: "status", targetElementRole: "indicator", property: "backgroundColor",
 *   mapping: { running: "#22c55e", stopped: "#94a3b8", fault: "#ef4444" } }
 *
 * @example
 * // Numeric value → formatted text
 * { inputId: "value", targetElementRole: "value", property: "text",
 *   mapping: { "*": "${value} °C" } }
 */
export interface PidStateRule {
  /** References PidSymbolInput.id on this symbol */
  inputId: string;
  /**
   * Role string matching PidElementTemplate.role on the target sub-element.
   * A single inputId can have multiple rules targeting different sub-elements.
   */
  targetElementRole: string;
  property: BindableProperty;
  /**
   * Maps input values (as strings) to property values.
   * - Exact key match takes priority.
   * - "*" is a wildcard/default. For text properties, "${value}" is interpolated.
   */
  mapping: Record<string, string | number | boolean>;
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
 * Connects an external variable to a symbol input (preferred) or directly
 * targets a sub-element (legacy/custom override).
 *
 * **Preferred: input-based binding**
 * Binds a variable to a named input slot defined on the symbol. The state
 * engine resolves the visual changes automatically using the symbol's
 * stateRules — the caller only needs to know the input name, not internal
 * roles or mappings.
 *
 * @example
 * { variableId: "pump_01.status", inputId: "status" }
 *
 * **Legacy: direct element targeting**
 * Directly specifies the target role, property, and mapping. Use this for
 * custom per-instance overrides or when working with symbols that have no
 * stateRules defined.
 *
 * @example
 * { variableId: "pump_01.status", targetElementRole: "indicator",
 *   property: "backgroundColor",
 *   mapping: { running: "#22c55e", stopped: "#ef4444" } }
 */
export type VariableBinding =
  | {
      /** The external variable identifier (e.g. OPC-UA node ID, tag name) */
      variableId: string;
      /**
       * References PidSymbolInput.id on the symbol definition.
       * The state engine looks up matching stateRules to drive visual changes.
       */
      inputId: string;
    }
  | {
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
    };

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
