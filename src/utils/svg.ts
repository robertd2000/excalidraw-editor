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
