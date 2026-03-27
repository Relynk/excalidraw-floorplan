# Room Draw Tool

## Files

| File | Purpose |
| --- | --- |
| `packages/common/src/constants.ts:465` | Tool type constant `"room-freedraw"` |
| `packages/excalidraw/components/shapes.tsx:119` | Toolbar registration (icon, label) |
| `packages/excalidraw/types.ts:161` | Union type for `activeTool.type` |
| `packages/excalidraw/actions/actionRoomProperties.tsx` | `actionChangeRoomName` action + panel |
| `packages/excalidraw/components/App.tsx` | All pointer event handling for the tool |

## How It Works

The room-freedraw tool draws a multi-point `line` element (same as Excalidraw's built-in line tool). When the user closes the loop, `actionFinalize` sets `polygon: true` and closes the last point to the first. The element is tagged with `customData.roomTool = "room-freedraw"` so it can be identified later.

### Pointer flow in App.tsx

| Event | Location | What happens |
| --- | --- | --- |
| Pointer-move (hover, no element) | ~`App.tsx:6833` | `getSnapLinesAtPointer` runs, result stored in `originSnapOffset` state |
| Pointer-down (first click) | ~`App.tsx:9289` | `originSnapOffset` applied to starting coordinates so first vertex lands on a snap |
| Pointer-move (drawing) | ~`App.tsx:6973` | `snapLinearElementPoint` called, moves rubber-band segment endpoint |
| Pointer-down (each subsequent click) | ~`App.tsx:9385` | Snapped coords recorded; on start, `customData.roomTool = "room-freedraw"` written |
| Finalize (double-click or close-loop) | `actionFinalize.tsx:243` | Loop detection closes polygon |

### customData on the element

```ts
{
  roomTool: "room-freedraw",   // identifies as room element
  roomName: string,            // set by actionChangeRoomName
}
```

## Room Properties Action

`packages/excalidraw/actions/actionRoomProperties.tsx`

`isRoomElement(el)` — checks `customData.roomTool` is a string.

`actionChangeRoomName` — registered action that renders a "Room name" text input in the sidebar when one or more room elements are selected. Updates `customData.roomName` on all selected room elements.

To add more room properties, add additional `register()`-ed actions in the same file and import them in `packages/excalidraw/components/Actions.tsx`.

## Snapping During Draw

Uses `snapLinearElementPoint` (see `snapping.md`). The element being drawn is excluded from the snap reference list so vertices don't snap to themselves. The `SnapCache` is populated lazily on first pointer-move after drawing starts and is destroyed on pointer-up.

## Identifying Room Elements

```ts
import { isRoomElement } from "../actions/actionRoomProperties";
isRoomElement(el); // true if el.customData.roomTool is a string
```
