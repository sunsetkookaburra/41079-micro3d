/**
 * cvat_json_to_html
 * @returns {string}
 * @param {import("./util.mjs").Capture["frames"][string] & { url?: string }} frame
 */
export function bboxToSvg(frame) {
  let svg = `<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${frame.width} ${frame.height}"
    style="background-color:black;border:2px inset"
    width="200"
  >\n`;
  if (frame.url) {
    svg += `<image width="${frame.height}" height="${frame.width}" href="${frame.url}"/>\n`;
  }
  for (const [id, bbox] of Object.entries(frame.features)) {
    svg += `<text x="${bbox.x}" y="${bbox.y}" fill="#fff" style="font-size:${(frame.height / 7).toFixed(0)}px">id:${id}</text>\n`
    svg += `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.w}" height="${bbox.h}" fill="none" stroke="#fff" stroke-width="20"/>\n`;
  }
  svg += `</svg>`;
  return svg;
}
