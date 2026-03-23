import { CaptureUpdateAction, newElementWith } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { register } from "./register";

// ---------------------------------------------------------------------------
// Helper: identify elements that belong to a room tool
// ---------------------------------------------------------------------------

export const isRoomElement = (element: ExcalidrawElement): boolean =>
  typeof element.customData?.roomTool === "string";

// ---------------------------------------------------------------------------
// Action: changeRoomName
// Updates the `customData.roomName` field on all selected room elements.
// ---------------------------------------------------------------------------

export const actionChangeRoomName = register({
  name: "changeRoomName",
  label: "Room name",
  trackEvent: false,

  perform: (elements, appState, value: unknown) => {
    const roomName = typeof value === "string" ? value : "";
    return {
      elements: elements.map((el) =>
        appState.selectedElementIds[el.id] && isRoomElement(el)
          ? newElementWith(el, {
              customData: {
                ...el.customData,
                roomName,
              },
            })
          : el,
      ),
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },

  PanelComponent: ({ elements, appState, updateData }) => {
    const targetElements = elements.filter(
      (el) => appState.selectedElementIds[el.id] && isRoomElement(el),
    );

    if (targetElements.length === 0) {
      return null;
    }

    // Show mixed placeholder when multiple elements have different names
    const firstValue = targetElements[0].customData?.roomName ?? "";
    const isMixed = targetElements.some(
      (el) => (el.customData?.roomName ?? "") !== firstValue,
    );

    return (
      <fieldset>
        <legend>Room name</legend>
        <input
          type="text"
          className="TextInput"
          placeholder={isMixed ? "Mixed" : "Unnamed room"}
          value={isMixed ? "" : firstValue}
          onChange={(e) => updateData(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </fieldset>
    );
  },
});
