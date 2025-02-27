import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

import { Template } from "@pdfme/common";

export function transformExcalidrawToTemplate(
  elements: readonly NonDeletedExcalidrawElement[]
): Template {
  const basePdf = { width: 800, height: 600, padding: [20, 10, 20, 10] } as {
    width: number;
    height: number;
    padding: [number, number, number, number];
  };
  const schemas = [
    elements.map((element, index) => ({
      type: element.type,
      position: { x: element.x, y: element.y },
      width: element.width,
      height: element.height,
      rotate: element.angle || 0,
      opacity: element.opacity || 1,
      borderWidth: element.strokeWidth || 1,
      borderColor: element.strokeColor || "#000000",
      color: element.backgroundColor || "",
      readOnly: true,
      required: false,
      name: `field${index}`,
    })),
  ];

  return { basePdf, schemas, pdfmeVersion: "5.3.8" };
}
