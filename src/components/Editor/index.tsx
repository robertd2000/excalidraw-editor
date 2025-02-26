import React, { useEffect, useRef, useCallback } from "react";
import {
  Excalidraw,
  useHandleLibrary,
  MIME_TYPES,
} from "@excalidraw/excalidraw";
import {
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import initialData from "./initialData";
import {
  NonDeletedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { resolvablePromise } from "../../utils";
import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";
import { RenderMenu } from "./RenderMenu";
import { useSettingsContext } from "../../store/settings";
import { useExcalidrawContext } from "../../store/excalidraw";

declare global {
  interface Window {
    ExcalidrawLib: any;
  }
}

export default function Editor() {
  const appRef = useRef<any>(null);
  const {
    settings: { viewMode, zenMode, gridMode, theme },
  } = useSettingsContext();

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const { excalidrawAPI, setExcalidrawAPI } = useExcalidrawContext();

  useHandleLibrary({ excalidrawAPI });

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }
    const fetchData = async () => {
      const res = await fetch("/rocket.jpeg");
      const imageData = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(imageData);

      reader.onload = function () {
        const imagesArray: BinaryFileData[] = [
          {
            id: "rocket" as BinaryFileData["id"],
            dataURL: reader.result as BinaryFileData["dataURL"],
            mimeType: MIME_TYPES.jpg,
            created: 1644915140367,
            lastRetrieved: 1644915140367,
          },
        ];

        //@ts-ignore
        initialStatePromiseRef.current.promise.resolve(initialData);
        excalidrawAPI.addFiles(imagesArray);
      };
    };
    fetchData();
  }, [excalidrawAPI]);

  const onLinkOpen = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>
    ) => {
      const link = element.link!;
      const { nativeEvent } = event.detail;
      const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const isNewWindow = nativeEvent.shiftKey;
      const isInternalLink =
        link.startsWith("/") || link.includes(window.location.origin);
      if (isInternalLink && !isNewTab && !isNewWindow) {
        event.preventDefault();
      }
    },
    []
  );

  return (
    <div className='App' ref={appRef}>
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
