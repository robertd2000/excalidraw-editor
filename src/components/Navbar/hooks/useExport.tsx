import {
  exportToBlob,
  exportToSvg,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../../../store/excalidraw";
import initialData from "../../../constants/initialData";
import { convertPngBlobToPdf, getSceneBoundingBox } from "../../../utils/blob";
import { jsPDF } from "jspdf";
import { generate } from "@pdfme/generator";
import { BLANK_PDF } from "@pdfme/common";
import { text, barcodes, image } from "@pdfme/schemas";
import { PDFDocument } from "pdf-lib";
import { getPathsFromSVG } from "../../../utils/svg";

export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

  const handleExportPDF = async () => {
    if (!excalidrawAPI) return;

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

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const svgPath = getPathsFromSVG(svg);
    page.drawSvgPath(svgPath, { scale: 0.5 });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    const blobPdf = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blobPdf);
    link.download = "drawing-high-dpi.pdf";
    link.click();
    // const elements = excalidrawAPI.getSceneElements();

    // // Вычисляем bounding box
    // const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    // const width = maxX - minX;
    // const height = maxY - minY;

    // // Увеличиваем масштаб для высокого разрешения
    // const exportScale = 3; // Увеличиваем в 3 раза

    // // Экспортируем рисунок в PNG с высоким разрешением
    // const blob = await exportToBlob({
    //   elements,
    //   appState: {
    //     exportBackground: true,
    //     exportScale: exportScale,
    //   },
    //   files: excalidrawAPI.getFiles(),
    // });

    // // Преобразуем Blob в ArrayBuffer
    // const arrayBuffer = await blob.arrayBuffer();

    // // Создаем PDF с высоким DPI
    // const pdfDoc = await PDFDocument.create();
    // const page = pdfDoc.addPage([width * exportScale, height * exportScale]);

    // // Вставляем изображение
    // const image = await pdfDoc.embedPng(arrayBuffer);
    // page.drawImage(image, {
    //   x: 0,
    //   y: 0,
    //   width: width * exportScale,
    //   height: height * exportScale,
    // });

    // // Сохраняем PDF
    // const pdfBytes = await pdfDoc.save();
    // const blobPdf = new Blob([pdfBytes], { type: "application/pdf" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blobPdf);
    // link.download = "drawing-high-dpi.pdf";
    // link.click();

    // const elements = excalidrawAPI.getSceneElements();

    // // Вычисляем bounding box
    // const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    // const width = maxX - minX;
    // const height = maxY - minY;

    // // Экспортируем рисунок в SVG
    // const svg = await exportToSvg({
    //   elements,
    //   appState: {
    //     exportBackground: true,
    //   },
    //   files: excalidrawAPI.getFiles(),
    // });

    // // Преобразуем SVG в Data URL
    // const svgString = new XMLSerializer().serializeToString(svg);
    // const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

    // // Создаем шаблон для PDF с динамическими размерами
    // const template = {
    //   basePdf: BLANK_PDF,
    //   schemas: [
    //     {
    //       image: {
    //         type: "image",
    //         position: { x: 0, y: 0 },
    //         width,
    //         height,
    //       },
    //     },
    //   ],
    // };

    // const plugins = {
    //   "QR Code": barcodes.qrcode,
    //   Image: image,
    // };

    // // Создаем PDF
    // const inputs = [{ image: svgDataUrl }];
    // const pdf = await generate({ template, inputs, plugins });

    // // Сохраняем PDF
    // const blob = new Blob([pdf.buffer], { type: "application/pdf" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = "drawing-high-quality.pdf";
    // link.click();

    //

    // const elements = excalidrawAPI.getSceneElements();

    // // Вычисляем bounding box
    // const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    // const width = maxX - minX;
    // const height = maxY - minY;

    // // Экспортируем рисунок в PNG
    // const blob = await exportToBlob({
    //   elements,
    //   appState: {
    //     exportBackground: true,
    //     exportScale: 3, // Увеличиваем масштаб для лучшего качества
    //   },
    //   files: excalidrawAPI.getFiles(),
    // });

    // // Преобразуем Blob в Data URL
    // const reader = new FileReader();
    // reader.onload = () => {
    //   const imageData = reader.result as string;

    //   // Создаем PDF с динамическими размерами
    //   const pdf = new jsPDF({
    //     orientation: width > height ? "landscape" : "portrait",
    //     unit: "px",
    //     format: [width, height],
    //   });

    //   // Добавляем изображение в PDF
    //   pdf.addImage(imageData, "PNG", 0, 0, width, height);

    //   // Сохраняем PDF
    //   pdf.save("drawing.pdf");
    // };
    // reader.readAsDataURL(blob);

    //

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
