import {
  exportToBlob,
  exportToSvg,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../../../store/excalidraw";
import initialData from "../../../constants/initialData";
import { convertPngBlobToPdf, getSceneBoundingBox } from "../../../utils/blob";
import { jsPDF } from "jspdf";

export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

  const handleExportPDF = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();

    // Вычисляем bounding box
    const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    const width = maxX - minX;
    const height = maxY - minY;

    // Экспортируем рисунок в PNG
    const blob = await exportToBlob({
      elements,
      appState: {
        exportBackground: true,
        exportScale: 3, // Увеличиваем масштаб для лучшего качества
      },
      files: excalidrawAPI.getFiles(),
    });

    // Преобразуем Blob в Data URL
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;

      // Создаем PDF с динамическими размерами
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });

      // Добавляем изображение в PDF
      pdf.addImage(imageData, "PNG", 0, 0, width, height);

      // Сохраняем PDF
      pdf.save("drawing.pdf");
    };
    reader.readAsDataURL(blob);
    // const scaleFactor = 4;

    // const canvas = await exportToCanvas({
    //   elements: excalidrawAPI?.getSceneElements()!,
    //   appState: {
    //     ...initialData.appState,
    //     exportScale: scaleFactor,
    //   },
    //   files: excalidrawAPI?.getFiles()!,
    // });
    // const pdf = new jsPDF("p", "mm", "a4");

    // const imgWidth = 190;
    // const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // pdf.addImage(
    //   canvas.toDataURL("image/png", 1.0),
    //   "PNG",
    //   10,
    //   10,
    //   imgWidth,
    //   imgHeight
    // );

    // pdf.save("canvas-export.pdf");
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
