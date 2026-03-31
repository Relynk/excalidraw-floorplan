import React from "react";

import { getElementAbsoluteCoords } from "@excalidraw/element";
import { sceneCoordsToViewportCoords } from "@excalidraw/common";

import type {
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { AppState, ReactEmbedOptionDef } from "../types";
import type { Scene } from "@excalidraw/element";

const PICKER_WIDTH = 320;
const PICKER_PADDING = 8;
const SPACE_BOTTOM = 16;

const getCoordsForPicker = (
  element: NonDeletedExcalidrawElement,
  appState: AppState,
  elementsMap: ElementsMap,
) => {
  const [x1, y1] = getElementAbsoluteCoords(element, elementsMap);
  const { x: viewportX, y: viewportY } = sceneCoordsToViewportCoords(
    { sceneX: x1 + element.width / 2, sceneY: y1 },
    appState,
  );
  const x = viewportX - appState.offsetLeft - PICKER_WIDTH / 2;
  const y = viewportY - appState.offsetTop - SPACE_BOTTOM;
  return { x, y };
};

interface ReactEmbedPickerProps {
  element: NonDeletedExcalidrawElement;
  appState: AppState;
  elementsMap: ElementsMap;
  scene: Scene;
  setAppState: React.Component<unknown, AppState>["setState"];
  options: ReactEmbedOptionDef[];
}

export const ReactEmbedPicker = ({
  element,
  appState,
  elementsMap,
  scene,
  setAppState,
  options,
}: ReactEmbedPickerProps) => {
  if (
    appState.contextMenu ||
    appState.selectedElementsAreBeingDragged ||
    appState.resizingElement ||
    appState.isRotating ||
    appState.viewModeEnabled
  ) {
    return null;
  }

  const { x, y } = getCoordsForPicker(element, appState, elementsMap);

  const handleSelect = (opt: ReactEmbedOptionDef) => {
    const w = opt.defaultWidth ?? element.width;
    const h = opt.defaultHeight ?? element.height;
    const aspectRatio = h > 0 ? w / h : undefined;

    // Determine new position: keep element centre fixed when resizing
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const newX = centerX - w / 2;
    const newY = centerY - h / 2;

    scene.mutateElement(element, {
      x: newX,
      y: newY,
      width: w,
      height: h,
      customData: {
        ...(element.customData ?? {}),
        componentKey: opt.key,
        aspectRatio,
        // Copy port definitions from the option so the element can participate
        // in the pipe-draw snap system independently of the options array.
        ports: opt.ports ?? [],
      },
    });
    setAppState({ showReactEmbedPicker: false });
  };

  const handleDismiss = () => {
    setAppState({ showReactEmbedPicker: false });
  };

  return (
    <div
      className="excalidraw__react-embed-picker"
      style={{
        top: `${y}px`,
        left: `${x}px`,
        width: PICKER_WIDTH,
        padding: PICKER_PADDING,
        transform: "translateY(-100%)",
      }}
      // Prevent canvas pointer events from firing through the picker
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="excalidraw__react-embed-picker__header">
        <span>Choose widget</span>
        <button
          className="excalidraw__react-embed-picker__close"
          onClick={handleDismiss}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
      <div className="excalidraw__react-embed-picker__grid">
        {options.length === 0 ? (
          <div className="excalidraw__react-embed-picker__empty">
            No widgets configured. Pass <code>reactEmbedOptions</code> to
            Excalidraw.
          </div>
        ) : (
          options.map((opt) => (
            <button
              key={opt.key}
              className="excalidraw__react-embed-picker__option"
              onClick={() => handleSelect(opt)}
              title={opt.description}
            >
              <span className="excalidraw__react-embed-picker__option-label">
                {opt.label}
              </span>
              {opt.description && (
                <span className="excalidraw__react-embed-picker__option-desc">
                  {opt.description}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
