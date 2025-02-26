import { jsPDF } from "jspdf";

export const convertPngBlobToPdf = async (pngBlob: Blob) => {
  const reader = new FileReader();

  reader.onload = () => {
    const imageData = reader.result as string;

    const pdf = new jsPDF();
    pdf.addImage(imageData, "PNG", 10, 10, 180, 160);
    pdf.save("excalidraw-export.pdf");
  };

  reader.readAsDataURL(pngBlob);
};
