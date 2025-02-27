import { jsPDF } from "jspdf";

export function exportCanvasToPDF(
  canvas: HTMLCanvasElement,
  filename: string = "excalidraw-export.pdf"
): void {
  const imageData = canvas.toDataURL("image/png", 2.0);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}
