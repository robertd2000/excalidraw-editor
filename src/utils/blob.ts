import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { jsPDF } from "jspdf";

export const convertPngBlobToPdf = async (
  blob: Blob,
  {
    width,
    height,
  }: {
    width: number;
    height: number;
  }
) => {
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
};

export function getSceneBoundingBox(
  elements: readonly NonDeletedExcalidrawElement[]
) {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 }; // Возвращаем размеры по умолчанию
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((element) => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });

  return { minX, minY, maxX, maxY };
}
