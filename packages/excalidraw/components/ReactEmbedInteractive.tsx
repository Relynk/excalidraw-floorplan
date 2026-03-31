import React from "react";

/**
 * Wrap any interactive element inside a reactEmbed widget with this component.
 *
 * In view mode the reactEmbed container forwards pointer events to the canvas
 * so that non-interactive areas still pan the canvas. Wrapping an element with
 * <ReactEmbedInteractive> stops that forwarding so the wrapped element receives
 * the event normally (click, input, etc.).
 *
 * In edit mode this component has no effect — reactEmbed overlays are fully
 * non-interactive regardless.
 *
 * Usage:
 *   <ReactEmbedInteractive>
 *     <button onClick={...}>Click me</button>
 *   </ReactEmbedInteractive>
 */
export const ReactEmbedInteractive = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <div
      className={className}
      style={{
        display: "contents",
        // Restore user-select so text inputs and labels inside interactive
        // areas remain selectable (the __inner div sets user-select: none).
        userSelect: "auto",
        // Override the grab cursor set on the container back to default
        // so interactive children show a normal pointer/text cursor.
        cursor: "default",
        ...style,
      }}
      // Stop pointerdown from bubbling to the container's pan-forwarding
      // handler so the canvas does not steal the event.
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};
