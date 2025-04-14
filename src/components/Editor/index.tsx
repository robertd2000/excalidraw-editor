import {Excalidraw} from "@excalidraw/excalidraw";
import {ExcalidrawImperativeAPI} from "@excalidraw/excalidraw/types/types";
import {Theme} from "@excalidraw/excalidraw/types/element/types";
import {RenderMenu} from "../RenderMenu";
import {useSettingsContext} from "../../store/settings";
import {useEditor} from "./hooks/useEditor";

declare global {
    interface Window {
        ExcalidrawLib: never;
    }
}

export default function Editor() {
    const {
        settings: {viewMode, zenMode, gridMode, theme},
    } = useSettingsContext();

    const {appRef, initialStatePromiseRef, setExcalidrawAPI, onLinkOpen} =
        useEditor();

    return (
        <div className='App' ref={appRef}>
            <div className={`excalidraw-wrapper ${theme === 'dark' ? 'bg-zinc-900' : ''}`}>
                <Excalidraw
                    excalidrawAPI={(api: ExcalidrawImperativeAPI) =>
                        setExcalidrawAPI(api)
                    }
                    initialData={{
                        ...initialStatePromiseRef.current.promise,
                        appState: {
                            viewBackgroundColor: "#f5f5f5", // Цвет фона холста
                            currentItemStrokeColor: "#000", // Цвет обводки элементов
                        }
                    }}
                    viewModeEnabled={viewMode}
                    zenModeEnabled={zenMode}
                    gridModeEnabled={gridMode}
                    name='Custom name of drawing'
                    UIOptions={{
                        canvasActions: {loadScene: false},
                    }}
                    onLinkOpen={onLinkOpen}
                    theme={theme as Theme}
                >
                    <RenderMenu/>
                </Excalidraw>
            </div>
        </div>
    );
}
