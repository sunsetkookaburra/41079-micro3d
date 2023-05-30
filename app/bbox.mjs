/**
 * cvat_json_to_html
 * @returns {string}
 * @param {{ width: number, height: number }} frame
 * @param {{ x: number, y: number, w: number, h: number }[]} bboxes
 */
export function bboxToSvg(frame, bboxes) {
  let svg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${frame.width} ${frame.height}"
    style="background-color:black;border:2px inset"
    width="200"
  >\n`;
  for (const bbox of bboxes) {
    svg += `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.w}" height="${bbox.h}" fill="none" stroke="#fff" stroke-width="20"/>\n`;
  }
  svg += `</svg>`;
  return svg;
}
