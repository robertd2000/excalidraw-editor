import { PDFDocument } from "pdf-lib";
import SVGtoPDF from "svg-to-pdfkit";
import { svg2pdf } from "svg2pdf.js";
import { jsPDF } from "jspdf";

/**
 * Extracts all path data from an SVG element as a single string.
 *
 * @param svgElement - The SVG element to extract path data from.
 * @returns A string containing all the path data from the SVG element.
 */
export function getPathsFromSVG(svgElement: SVGSVGElement) {
  // Находим все элементы <path> внутри SVG
  const paths = svgElement.querySelectorAll("path");

  // Извлекаем атрибут `d` из каждого <path>
  const pathData: string[] = [];
  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (d) {
      pathData.push(d);
    }
  });

  return pathData.join(" ");
}

// export async function exportSVGToPDF(
//   svgString: string,
//   filename: string = "vector-drawing.pdf"
// ) {
//   const pdfDoc = await PDFDocument.create();

//   // Добавляем страницу
//   const page = pdfDoc.addPage([600, 400]);

//   // Преобразуем SVG в PDF
//   SVGtoPDF(page, svgString, 0, 0, { width: 600, height: 400 }); // Укажите размеры

//   // Сохраняем PDF
//   const pdfBytes = await pdfDoc.save();
//   const blob = new Blob([pdfBytes], { type: "application/pdf" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = filename;
//   link.click();
// }

export async function exportSVGToPDF(
  svgString: string,
  filename: string = "vector-drawing.pdf"
) {
  // Создаем контейнер для SVG
  const svgContainer = document.createElement("div");
  svgContainer.innerHTML = svgString;
  document.body.appendChild(svgContainer);

  // Получаем элемент SVG
  const svgElement = svgContainer.querySelector("svg");

  if (!svgElement) {
    throw new Error("SVG element not found");
  }

  // Инициализируем jsPDF
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [1200, 800],
    // format: [svgElement.width.baseVal.value, svgElement.height.baseVal.value],
  });

  // Преобразуем SVG в PDF
  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
  });

  // Сохраняем PDF
  pdf.save(filename);

  // Удаляем контейнер
  document.body.removeChild(svgContainer);
}

export function exportSvgToPDF(svgElement: SVGSVGElement) {}
