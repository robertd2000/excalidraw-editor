import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  exportToSvg,
  exportToBlob,
  exportToClipboard,
  Excalidraw,
  useHandleLibrary,
  MIME_TYPES,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
  MainMenu,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  PointerDownState as ExcalidrawPointerDownState,
} from "@excalidraw/excalidraw/types/types";
import { jsPDF } from "jspdf";
import initialData from "./initialData";
import { Canvg } from "canvg";
import {
  NonDeletedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { nanoid } from "nanoid";
import {
  resolvablePromise,
  withBatchedUpdates,
  withBatchedUpdatesThrottled,
  distance2d,
} from "../../utils";
import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";

declare global {
  interface Window {
    ExcalidrawLib: any;
  }
}

type Comment = {
  x: number;
  y: number;
  value: string;
  id?: string;
};

type PointerDownState = {
  x: number;
  y: number;
  hitElement: Comment;
  onMove: any;
  onUp: any;
  hitElementOffsets: {
    x: number;
    y: number;
  };
};

const COMMENT_ICON_DIMENSION = 32;
const COMMENT_INPUT_HEIGHT = 50;
const COMMENT_INPUT_WIDTH = 150;

export default function Editor() {
  const appRef = useRef<any>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [theme, setTheme] = useState("light");
  const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
    {}
  );
  const [comment, setComment] = useState<Comment | null>(null);
  const isCollaborating = false;
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
        // signal that we're handling the redirect ourselves
        event.preventDefault();
        // do a custom redirect, such as passing to react-router
        // ...
      }
    },
    []
  );

  const onCopy = async (type: "png" | "svg" | "json") => {
    if (!excalidrawAPI) {
      return false;
    }
    await exportToClipboard({
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      type,
    });
    window.alert(`Copied to clipboard as ${type} successfully`);
  };

  const onPointerDown = (
    activeTool: AppState["activeTool"],
    pointerDownState: ExcalidrawPointerDownState
  ) => {
    if (activeTool.type === "custom" && activeTool.customType === "comment") {
      const { x, y } = pointerDownState.origin;
      setComment({ x, y, value: "" });
    }
  };

  const rerenderCommentIcons = () => {
    if (!excalidrawAPI) {
      return false;
    }
    const commentIconsElements = appRef.current.querySelectorAll(
      ".comment-icon"
    ) as HTMLElement[];
    commentIconsElements.forEach((ele) => {
      const id = ele.id;
      const appstate = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcons[id].x, sceneY: commentIcons[id].y },
        appstate
      );
      ele.style.left = `${
        x - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetLeft
      }px`;
      ele.style.top = `${
        y - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetTop
      }px`;
    });
  };

  const onPointerMoveFromPointerDownHandler = (
    pointerDownState: PointerDownState
  ) => {
    return withBatchedUpdatesThrottled((event) => {
      if (!excalidrawAPI) {
        return false;
      }
      const { x, y } = viewportCoordsToSceneCoords(
        {
          clientX: event.clientX - pointerDownState.hitElementOffsets.x,
          clientY: event.clientY - pointerDownState.hitElementOffsets.y,
        },
        excalidrawAPI.getAppState()
      );
      setCommentIcons({
        ...commentIcons,
        [pointerDownState.hitElement.id!]: {
          ...commentIcons[pointerDownState.hitElement.id!],
          x,
          y,
        },
      });
    });
  };
  const onPointerUpFromPointerDownHandler = (
    pointerDownState: PointerDownState
  ) => {
    return withBatchedUpdates((event) => {
      window.removeEventListener("pointermove", pointerDownState.onMove);
      window.removeEventListener("pointerup", pointerDownState.onUp);
      excalidrawAPI?.setActiveTool({ type: "selection" });
      const distance = distance2d(
        pointerDownState.x,
        pointerDownState.y,
        event.clientX,
        event.clientY
      );
      if (distance === 0) {
        if (!comment) {
          setComment({
            x: pointerDownState.hitElement.x + 60,
            y: pointerDownState.hitElement.y,
            value: pointerDownState.hitElement.value,
            id: pointerDownState.hitElement.id,
          });
        } else {
          setComment(null);
        }
      }
    });
  };
  const saveComment = () => {
    if (!comment) {
      return;
    }
    if (!comment.id && !comment.value) {
      setComment(null);
      return;
    }
    const id = comment.id || nanoid();
    setCommentIcons({
      ...commentIcons,
      [id]: {
        x: comment.id ? comment.x - 60 : comment.x,
        y: comment.y,
        id,
        value: comment.value,
      },
    });
    setComment(null);
  };

  const renderCommentIcons = () => {
    return Object.values(commentIcons).map((commentIcon) => {
      if (!excalidrawAPI) {
        return false;
      }
      const appState = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcon.x, sceneY: commentIcon.y },
        excalidrawAPI.getAppState()
      );
      return (
        <div
          id={commentIcon.id}
          key={commentIcon.id}
          style={{
            top: `${y - COMMENT_ICON_DIMENSION / 2 - appState!.offsetTop}px`,
            left: `${x - COMMENT_ICON_DIMENSION / 2 - appState!.offsetLeft}px`,
            position: "absolute",
            zIndex: 1,
            width: `${COMMENT_ICON_DIMENSION}px`,
            height: `${COMMENT_ICON_DIMENSION}px`,
            cursor: "pointer",
            touchAction: "none",
          }}
          className='comment-icon'
          onPointerDown={(event) => {
            event.preventDefault();
            if (comment) {
              commentIcon.value = comment.value;
              saveComment();
            }
            const pointerDownState: any = {
              x: event.clientX,
              y: event.clientY,
              hitElement: commentIcon,
              hitElementOffsets: { x: event.clientX - x, y: event.clientY - y },
            };
            const onPointerMove =
              onPointerMoveFromPointerDownHandler(pointerDownState);
            const onPointerUp =
              onPointerUpFromPointerDownHandler(pointerDownState);
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);

            pointerDownState.onMove = onPointerMove;
            pointerDownState.onUp = onPointerUp;

            excalidrawAPI?.setActiveTool({
              type: "custom",
              customType: "comment",
            });
          }}
        >
          <div className='comment-avatar'>
            <img src='doremon.png' alt='doremon' />
          </div>
        </div>
      );
    });
  };

  const renderComment = () => {
    if (!comment) {
      return null;
    }
    const appState = excalidrawAPI?.getAppState()!;
    const { x, y } = sceneCoordsToViewportCoords(
      { sceneX: comment.x, sceneY: comment.y },
      appState
    );
    let top = y - COMMENT_ICON_DIMENSION / 2 - appState.offsetTop;
    let left = x - COMMENT_ICON_DIMENSION / 2 - appState.offsetLeft;

    if (
      top + COMMENT_INPUT_HEIGHT <
      appState.offsetTop + COMMENT_INPUT_HEIGHT
    ) {
      top = COMMENT_ICON_DIMENSION / 2;
    }
    if (top + COMMENT_INPUT_HEIGHT > appState.height) {
      top = appState.height - COMMENT_INPUT_HEIGHT - COMMENT_ICON_DIMENSION / 2;
    }
    if (
      left + COMMENT_INPUT_WIDTH <
      appState.offsetLeft + COMMENT_INPUT_WIDTH
    ) {
      left = COMMENT_ICON_DIMENSION / 2;
    }
    if (left + COMMENT_INPUT_WIDTH > appState.width) {
      left = appState.width - COMMENT_INPUT_WIDTH - COMMENT_ICON_DIMENSION / 2;
    }

    return (
      <textarea
        className='comment'
        style={{
          top: `${top}px`,
          left: `${left}px`,
          position: "absolute",
          zIndex: 1,
          height: `${COMMENT_INPUT_HEIGHT}px`,
          width: `${COMMENT_INPUT_WIDTH}px`,
        }}
        ref={(ref) => {
          setTimeout(() => ref?.focus());
        }}
        placeholder={comment.value ? "Reply" : "Comment"}
        value={comment.value}
        onChange={(event) => {
          setComment({ ...comment, value: event.target.value });
        }}
        onBlur={saveComment}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            saveComment();
          }
        }}
      />
    );
  };

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

        // Создаем новый PDF
        const pdf = new jsPDF();

        // Добавляем изображение в PDF
        pdf.addImage(imageData, "PNG", 10, 10, 180, 160); // Параметры: (изображение, формат, x, y, ширина, высота)

        // Сохраняем PDF
        pdf.save("excalidraw-export.pdf");
        // setCanvasUrl(canvas.toDataURL());
      } catch (error) {
        console.error("Ошибка при экспорте в PDF:", error);
      }
    }
  };

  const renderMenu = () => {
    return (
      <MainMenu>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        <MainMenu.Separator />
        <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={isCollaborating}
          onSelect={() => window.alert("You clicked on collab button")}
        />
        <MainMenu.Group title='Excalidraw links'>
          <MainMenu.DefaultItems.Socials />
        </MainMenu.Group>
        <MainMenu.Separator />
        <MainMenu.DefaultItems.Help />
      </MainMenu>
    );
  };

  return (
    <div className='App' ref={appRef}>
      <div className='flex justify-between p-5 bg-indigo-300 items-center'>
        <div className='flex justify-between gap-2 items-center'>
          <div className='flex items-center mb-4'>
            <input
              id='view-checkbox'
              type='checkbox'
              checked={viewModeEnabled}
              onChange={() => setViewModeEnabled(!viewModeEnabled)}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
            <label htmlFor='view-checkbox' className='ms-2 text-sm font-medium'>
              View mode
            </label>
          </div>

          <div className='flex items-center mb-4'>
            <input
              id='zen-checkbox'
              type='checkbox'
              checked={zenModeEnabled}
              onChange={() => setZenModeEnabled(!zenModeEnabled)}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
            <label htmlFor='zen-checkbox' className='ms-2 text-sm font-medium'>
              Zen mode
            </label>
          </div>

          <div className='flex items-center mb-4'>
            <input
              id='grid-checkbox'
              type='checkbox'
              checked={gridModeEnabled}
              onChange={() => setGridModeEnabled(!gridModeEnabled)}
              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
            />
            <label htmlFor='grid-checkbox' className='ms-2 text-sm font-medium'>
              Grid mode
            </label>
          </div>
        </div>

        <div className='flex justify-between gap-4'>
          <label className='inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              className='sr-only peer'
              checked={theme === "dark"}
              onChange={() => {
                let newTheme = "light";
                if (theme === "light") {
                  newTheme = "dark";
                }
                setTheme(newTheme);
              }}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className='ms-3 text-sm font-medium '>
              Switch to Dark Theme
            </span>
          </label>

          <div className='flex justify-between gap-2'>
            <button
              className='border-1 border-black p-2 rounded-md cursor-pointer bg-white'
              onClick={async () => {
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
              }}
            >
              Export to SVG
            </button>

            <button
              className='border-1 border-black p-2 rounded-md cursor-pointer bg-white'
              onClick={async () => {
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
                setBlobUrl(window.URL.createObjectURL(blob));
              }}
            >
              Export to Blob
            </button>

            <button
              className='border-1 border-black p-2 rounded-md cursor-pointer bg-white'
              onClick={handleExportPDF}
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>
      <div className='excalidraw-wrapper'>
        <Excalidraw
          excalidrawAPI={(api: ExcalidrawImperativeAPI) =>
            setExcalidrawAPI(api)
          }
          initialData={initialStatePromiseRef.current.promise}
          onChange={(elements, state) => {
            console.info("Elements :", elements, "State : ", state);
          }}
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
          name='Custom name of drawing'
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
          onLinkOpen={onLinkOpen}
          onPointerDown={onPointerDown}
          onScrollChange={rerenderCommentIcons}
          theme={theme as Theme}
        >
          {renderMenu()}
        </Excalidraw>
        {Object.keys(commentIcons || []).length > 0 && renderCommentIcons()}
        {comment && renderComment()}
      </div>
    </div>
  );
}
