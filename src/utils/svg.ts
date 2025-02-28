import { svg2pdf } from "svg2pdf.js";
import { jsPDF } from "jspdf";

export function getPathsFromSVG(svgElement: SVGSVGElement) {
  const paths = svgElement.querySelectorAll("path");

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

//   const page = pdfDoc.addPage([600, 400]);

//   SVGtoPDF(page, svgString, 0, 0, { width: 600, height: 400 }); // Укажите размеры

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
  const updatedSvgString = replaceSymbolsWithImages(svgString);

  const svgContainer = document.createElement("div");
  svgContainer.innerHTML = updatedSvgString;
  document.body.appendChild(svgContainer);

  const svgElement = svgContainer.querySelector("svg");

  if (!svgElement) {
    throw new Error("SVG element not found");
  }

  // Инициализируем jsPDF
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    // format: [1200, 800],
    format: [
      svgElement.width.baseVal.value * 2,
      svgElement.height.baseVal.value * 2,
    ],
  });

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
  });

  pdf.save(filename);

  document.body.removeChild(svgContainer);
}

function replaceSymbolsWithImages(svgString: string): string {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, "image/svg+xml");

  const styleElements = svgDoc.querySelectorAll("style");
  styleElements.forEach((style) => {
    let styleContent = style.textContent || "";
    styleContent = styleContent.replace(/@import url\(.*?\);/g, "");
    style.textContent = styleContent;
  });

  const symbols = svgDoc.querySelectorAll("symbol");
  symbols.forEach((symbol) => {
    const symbolId = symbol.getAttribute("id");
    const uses = svgDoc.querySelectorAll(`use[href="#${symbolId}"]`);
    uses.forEach((use) => {
      const x = use.getAttribute("x") || "0";
      const y = use.getAttribute("y") || "0";
      const width = use.getAttribute("width") || "100%";
      const height = use.getAttribute("height") || "100%";
      const image = symbol.querySelector("image");
      if (image) {
        const newImage = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );
        newImage.setAttribute("x", x);
        newImage.setAttribute("y", y);
        newImage.setAttribute("width", width);
        newImage.setAttribute("height", height);
        newImage.setAttribute("href", image.getAttribute("href") || "");
        use.replaceWith(newImage);
      }
    });
    symbol.remove();
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgDoc);
}
