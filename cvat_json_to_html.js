
if (import.meta.main) {
  if (Deno.args.length !== 1) Deno.exit(1);

  const json = JSON.parse(Deno.readTextFileSync(Deno.args[0]));
  const outputFile = Deno.createSync("experiment/bbox.html");

  const output = new TextEncoderStream();
  const w = output.writable.getWriter();


  const labels = {};
  for (const { id, name } of json["categories"]) labels[id] = name;

  const images = {};
  for (const { id, file_name, width, height } of json["images"]) images[id] = { file_name, width, height };

  const labelled = {};

  for (const { image_id, category_id, bbox } of json["annotations"]) {
    const file_name = images[image_id].file_name;
    labelled[file_name] ??= [];
    labelled[file_name].width = images[image_id].width;
    labelled[file_name].height = images[image_id].height;
    labelled[file_name].push({
      bbox,
      label: labels[category_id],
    });
  }

  w.write("<!DOCTYPE html><html><body>\n");
  for (const file_name in labelled) {
    const boxes = labelled[file_name];
    w.write(`<svg viewBox="0 0 ${boxes.width} ${boxes.height}">\n`);
    w.write(`  <image href="../img/${file_name}"/>\n`);
    for (const { bbox, label } of boxes)
    w.write(`  <rect x="${bbox[0]}" y="${bbox[1]}" width="${bbox[2]}" height="${bbox[3]}" fill="none" stroke="#ff0" stroke-width="10"/>\n`);
    w.write(`</svg>`);
  }
  w.write("</body></html>\n");

  w.close();
  await output.readable.pipeTo(outputFile.writable);
}
