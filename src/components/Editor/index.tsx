import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  exportToSvg,
  exportToBlob,
  Excalidraw,
  useHandleLibrary,
  MIME_TYPES,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import {
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import { jsPDF } from "jspdf";
import initialData from "./initialData";
import {
  NonDeletedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { resolvablePromise } from "../../utils";
import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";
import { convertPngBlobToPdf } from "../../utils/blob";
import { RenderMenu } from "./RenderMenu";
import { useSettingsContext } from "../../store/settings";

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

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

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

  const handleExportPDF = async () => {
    if (excalidrawAPI) {
      try {
        if (!excalidrawAPI) {
          return;
        }
        const canvas = await exportToCanvas({
          elements: excalidrawAPI.getSceneElements(),
          appState: {
            ...initialData.appState,
          },
          files: excalidrawAPI.getFiles(),
        });
        const ctx = canvas.getContext("2d")!;
        ctx.font = "30px Virgil";
        ctx.strokeText("My custom text", 50, 60);

        const imageData = canvas.toDataURL("image/png");

        const pdf = new jsPDF();

        pdf.addImage(imageData, "PNG", 10, 10, 180, 160);

        pdf.save("excalidraw-export.pdf");
      } catch (error) {
        console.error("Ошибка при экспорте в PDF:", error);
      }
    }
  };

  const handleExportToSVG = async () => {
    if (!excalidrawAPI) {
      return;
    }
    const svg = await exportToSvg({
      elements: excalidrawAPI?.getSceneElements(),
      appState: {
        ...initialData.appState,
        width: 300,
        height: 100,
      },
      files: excalidrawAPI?.getFiles(),
    });

    const blob = new Blob([svg.outerHTML], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "excalidraw-export.svg";
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportToBlob = async () => {
    if (!excalidrawAPI) {
      return;
    }
    const blob = await exportToBlob({
      elements: excalidrawAPI?.getSceneElements(),
      mimeType: "image/png",
      appState: {
        ...initialData.appState,
      },
      files: excalidrawAPI?.getFiles(),
    });
    // setBlobUrl(window.URL.createObjectURL(blob));
    convertPngBlobToPdf(blob);
  };

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
