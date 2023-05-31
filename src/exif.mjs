import "../lib/exif-reader.js";

function dmsToDec([deg, min, sec]) {
  return deg + min / 60 + sec / 3600;
}

function fractional([numerator, denominator]) {
  return numerator / denominator;
}

export function extractEXIF(imageBuffer) {
  const exifTags = ExifReader.load(imageBuffer);
  const width = exifTags["Image Width"]["value"];
  const height = exifTags["Image Height"]["value"];
  const focal35mm = exifTags["FocalLengthIn35mmFilm"]["value"];
  const lat = dmsToDec(exifTags["GPSLatitude"]["value"].map(fractional)) *
    (exifTags["GPSLatitudeRef"]["value"][0] == "N" ? 1 : -1);
  const lon = dmsToDec(exifTags["GPSLongitude"]["value"].map(fractional)) *
    (exifTags["GPSLongitudeRef"]["value"][0] == "E" ? 1 : -1);
  const elevation = fractional(exifTags["GPSAltitude"]["value"]) *
    (exifTags["GPSAltitudeRef"]["value"] == 0 ? 1 : -1);
  const heading = fractional(exifTags["GPSImgDirection"]["value"]);
  const gps_error = fractional(exifTags["GPSHPositioningError"]["value"]);
  const timestamp = new Date(
    exifTags["DateTimeOriginal"]["value"][0].split(" ")[0].replaceAll(
      ":",
      "-",
    ) + "T" +
      exifTags["DateTimeOriginal"]["value"][0].split(" ")[1] +
      (exifTags["SubSecTimeOriginal"] &&
          "." + exifTags["SubSecTimeOriginal"]["value"] || "") +
      exifTags["OffsetTimeOriginal"]["value"],
  ).valueOf();

  // Unsure about how to change 36 for non 3:2 images
  let hfov = 2 * Math.atan2(36, 2 * focal35mm);
  let vfov = 2 * Math.atan2((height / width) * 36, 2 * focal35mm); // 24mm in 3:2

  // TODO: Adjust for sensor crop with image vs 35mm ratio / orientation

  return {
    width,
    height,
    fov: { h: hfov * 180 / Math.PI, v: vfov * 180 / Math.PI },
    coords: { lat, lon },
    heading,
    elevation,
    gps_error,
    timestamp,
  };
}
