import { Theme } from "@excalidraw/excalidraw/types/element/types";
import { useSettingsContext } from "../../store/settings";
import { useExcalidrawContext } from "../../store/excalidraw";
import {
  exportToBlob,
  exportToCanvas,
  exportToSvg,
} from "@excalidraw/excalidraw";
import { jsPDF } from "jspdf";
import { convertPngBlobToPdf } from "../../utils/blob";
import initialData from "../Editor/initialData";

export function Navbar() {
  const {
    setSettings,
    settings: { viewMode, zenMode, gridMode, theme },
  } = useSettingsContext();

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

  const { excalidrawAPI } = useExcalidrawContext();

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
    <div className='flex justify-between p-5 bg-indigo-300 items-center'>
      <div className='flex justify-between gap-2 items-center'>
        <div className='flex items-center'>
          <input
            id='view-checkbox'
            type='checkbox'
            checked={viewMode}
            onChange={() =>
              setSettings((prev) => ({ ...prev, viewMode: !viewMode }))
            }
            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          />
          <label htmlFor='view-checkbox' className='ms-2 text-sm font-medium'>
            View mode
          </label>
        </div>

        <div className='flex items-center'>
          <input
            id='zen-checkbox'
            type='checkbox'
            checked={zenMode}
            onChange={() =>
              setSettings((prev) => ({ ...prev, zenMode: !zenMode }))
            }
            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
          />
          <label htmlFor='zen-checkbox' className='ms-2 text-sm font-medium'>
            Zen mode
          </label>
        </div>

        <div className='flex items-center'>
          <input
            id='grid-checkbox'
            type='checkbox'
            checked={gridMode}
            onChange={() =>
              setSettings((prev) => ({ ...prev, gridMode: !gridMode }))
            }
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
              setSettings((prev) => ({ ...prev, theme: newTheme as Theme }));
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
            onClick={handleExportToSVG}
          >
            Export to SVG
          </button>

          <button
            className='border-1 border-black p-2 rounded-md cursor-pointer bg-white'
            onClick={handleExportToBlob}
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
  );
}
