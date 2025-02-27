import {
  exportToBlob,
  exportToCanvas,
  exportToSvg,
} from "@excalidraw/excalidraw";
import { useExcalidrawContext } from "../store/excalidraw";
import initialData from "../constants/initialData";
import { convertPngBlobToPdf, getSceneBoundingBox } from "../utils/blob";
import { exportCanvasToPDF } from "../utils/canvas";
import { transformExcalidrawToTemplate } from "../utils/transform";
import {
  Template,
  Font,
  checkTemplate,
  getInputFromTemplate,
  getDefaultFont,
} from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { getPlugins } from "../plugins";
export function useExport() {
  const { excalidrawAPI } = useExcalidrawContext();

  const handleExportPDF = async () => {
    if (!excalidrawAPI) return;

    const elements = excalidrawAPI.getSceneElements();
    const template = transformExcalidrawToTemplate(elements);

    console.log(elements);
    const inputs = getInputFromTemplate(template);

    console.log("template", template, inputs);

    const pdf = await generate({
      template,
      inputs,
      options: {
        title: "pdfme",
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob));

    //

    // const files = excalidrawAPI.getFiles();

    // const canvas = await exportToCanvas({
    //   elements,
    //   appState: {
    //     exportBackground: true,
    //     exportScale: 4, // Увеличиваем масштаб для лучшего качества
    //   },
    //   files,
    //   getDimensions: () => {
    //     return { width: 500, height: 500, scale: 2 };
    //   },
    // });
    // exportCanvasToPDF(canvas, "excalidraw-export.pdf");

    // const pdf = new jsPDF({
    //   orientation: "landscape",
    //   unit: "pt",
    //   format: [width + 50, height + 50],
    // });

    // // const parser = new DOMParser();
    // // const svgDoc = parser.parseFromString(svg.outerHTML, "image/svg+xml");
    // // const svgElement = svgDoc.documentElement;

    // const tempContainer = document.createElement("div");
    // tempContainer.style.position = "absolute";
    // tempContainer.style.left = "-9999px";
    // document.body.appendChild(tempContainer);

    // tempContainer.appendChild(svg);

    // const svgElement = tempContainer.querySelector("svg");

    // if (svgElement)
    //   svg2pdf(svgElement, pdf, {
    //     x: 0,
    //     y: 0,
    //   }).then(() => {
    //     pdf.save("vector-design.pdf");
    //   });
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
        // width: 300,
        // height: 100,
        exportBackground: false,
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
    const { minX, minY, maxX, maxY } = getSceneBoundingBox(elements);
    const width = maxX - minX;
    const height = maxY - minY;

    const blob = await exportToBlob({
      elements,
      mimeType: "image/png",
      appState: {
        ...initialData.appState,
        exportBackground: false,
      },
      getDimensions: () => {
        return { width: width * 4, height: height * 4, scale: 2 };
      },
      files: excalidrawAPI?.getFiles(),
    });

    // setBlobUrl(window.URL.createObjectURL(blob));
    convertPngBlobToPdf(blob, { width, height });
  };

  return {
    handleExportPDF,
    handleExportToSVG,
    handleExportToBlob,
  };
}
