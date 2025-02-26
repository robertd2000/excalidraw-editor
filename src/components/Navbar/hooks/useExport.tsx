import {
  exportToBlob,
  exportToCanvas,
  exportToSvg,
} from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../../../store/excalidraw";
import { jsPDF } from "jspdf";
import initialData from "../../Editor/initialData";
import { convertPngBlobToPdf } from "../../../utils/blob";

export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

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

  return {
    handleExportPDF,
    handleExportToSVG,
    handleExportToBlob,
  };
}
