import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Theme } from "@excalidraw/excalidraw/types/element/types";
import { RenderMenu } from "../RenderMenu";
import { useSettingsContext } from "../../store/settings";
import { useEditor } from "./hooks/useEditor";
import FontSelector from "../FontSelector";

declare global {
  interface Window {
    ExcalidrawLib: any;
  }
}

export default function Editor() {
  const {
    settings: { viewMode, zenMode, gridMode, theme },
  } = useSettingsContext();

  const {
    appRef,
    initialStatePromiseRef,
    setExcalidrawAPI,
    onLinkOpen,
    handleFontChange,
  } = useEditor();

  return (
    <div className='App' ref={appRef}>
      <div className='p-4 bg-gray-100 border-b'>
        <FontSelector onChange={handleFontChange} />
      </div>
      <div className='excalidraw-wrapper'>
        <Excalidraw
          excalidrawAPI={(api: ExcalidrawImperativeAPI) =>
            setExcalidrawAPI(api)
          }
          initialData={initialStatePromiseRef.current.promise}
          viewModeEnabled={viewMode}
          zenModeEnabled={zenMode}
          gridModeEnabled={gridMode}
          name='Custom name of drawing'
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
          onLinkOpen={onLinkOpen}
          theme={theme as Theme}
        >
          <RenderMenu />
        </Excalidraw>
      </div>
    </div>
  );
}
