import {
  exportToBlob,
  exportToSvg,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../../../store/excalidraw";
import initialData from "../../../constants/initialData";
import { convertPngBlobToPdf } from "../../../utils/blob";
import { jsPDF } from "jspdf";

export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

  const handleExportPDF = async () => {
    const scaleFactor = 4;

    const canvas = await exportToCanvas({
      elements: excalidrawAPI?.getSceneElements()!,
      appState: {
        ...initialData.appState,
        exportScale: scaleFactor,
      },
      files: excalidrawAPI?.getFiles()!,
    });
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png", 1.0),
      "PNG",
      10,
      10,
      imgWidth,
      imgHeight
    );

    pdf.save("canvas-export.pdf");
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
