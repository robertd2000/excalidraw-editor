import { exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../../../store/excalidraw";
import initialData from "../../../constants/initialData";
import { convertPngBlobToPdf, getSceneBoundingBox } from "../../../utils/blob";
import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";

export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

  const handleExportPDF = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();

    const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    const width = maxX - minX;
    const height = maxY - minY;

    const svg = await exportToSvg({
      elements: elements,
      appState: {
        ...initialData.appState,
        width,
        height,
        exportBackground: false,
      },
      files: excalidrawAPI?.getFiles(),
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: [width + 50, height + 50],
    });

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg.outerHTML, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    // Use svg2pdf to convert SVG to PDF with correct function call
    svg2pdf(svgElement, pdf, {
      x: 0,
      y: 0,
    }).then(() => {
      // Save PDF
      pdf.save("vector-design.pdf");
    });
  };

  const handleExportToSVG = async () => {
    if (!excalidrawAPI) {
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    const svg = await exportToSvg({
      elements: elements,
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
    const elements = excalidrawAPI.getSceneElements();
    const blob = await exportToBlob({
      elements,
      mimeType: "image/png",
      appState: {
        ...initialData.appState,
      },
      files: excalidrawAPI?.getFiles(),
    });
    const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    const width = maxX - minX;
    const height = maxY - minY;
    // setBlobUrl(window.URL.createObjectURL(blob));
    convertPngBlobToPdf(blob, { width, height });
  };

  return {
    handleExportPDF,
    handleExportToSVG,
    handleExportToBlob,
  };
}
