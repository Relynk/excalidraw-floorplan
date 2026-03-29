import { updateActiveTool } from "@excalidraw/common";

import { CaptureUpdateAction } from "@excalidraw/element";

import { setCursorForShape } from "../cursor";

import { register } from "./register";

export const actionSetReactEmbedAsActiveTool = register({
  name: "setReactEmbedAsActiveTool",
  trackEvent: { category: "toolbar" },
  target: "Tool",
  label: "toolBar.reactEmbed",
  perform: (elements, appState, _, app) => {
    const nextActiveTool = updateActiveTool(appState, {
      type: "reactEmbed",
    });

    setCursorForShape(app.canvas, {
      ...appState,
      activeTool: nextActiveTool,
    });

    return {
      elements,
      appState: {
        ...appState,
        activeTool: updateActiveTool(appState, {
          type: "reactEmbed",
        }),
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
});
