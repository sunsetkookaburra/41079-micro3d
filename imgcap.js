// const OUT = document.getElementById("out");
const CAPTURES = document.getElementById("captures");

// document.addEventListener("DOMContentLoaded", async () => {
  // console.log(btoa("hello"));
  // console.log(new TextDecoder().decode(base64Encode(new TextEncoder().encode("hello"))));
// });

function getSplitByte(bitOffset, array) {
  const i = Math.trunc(bitOffset / 8);
  const offset = bitOffset % 8;
  return (
    ((array[i] << offset) & 0xFF)
    | ((array[i + 1] ?? 0) & 0xFF) >> (8 - offset)
  );
}

function base64Encode(buffer) {
  const oracle = new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
  const out = new Uint8Array(4 * Math.ceil(buffer.byteLength / 3));
  const tail = out.subarray(out.byteLength - 3);
  // = sign padding
  tail[0] = 61;
  tail[1] = 61;
  tail[2] = 61;
  for (let bit = 0; bit < buffer.length * 8; bit += 6) {
    out[Math.trunc(bit / 6)] = oracle[(getSplitByte(bit, buffer) >> 2) & 0x3F];
  }
  return out;
}

function getCoordinates() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coordinatesToJSON(coords)),
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/**
 *
 * @param {GeolocationPosition} coords
 */
function coordinatesToJSON(coords) {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: coords.altitude,
    accuracy: coords.accuracy,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
  };
}

/**
 *
 * @param {File} file
 */
async function createCapture(file) {
  const tasks = [];

  // Image
  const img = new Image();
  img.src = URL.createObjectURL(file);
  console.log(new TextDecoder().decode(base64Encode(new Uint8Array(await file.arrayBuffer()))));

  // Timestamp
  const time = new Date();

  // Location
  tasks.push(getCoordinates());

  // Acceleration

  // Orientation

  // Compass

  const [coords] = await Promise.all(tasks);
  return {
    img, time, coords
  };
}

/**
 *
 * @param {HTMLFormElement} form
 * @returns
 */
async function handleCapture(form) {
  const files = form.photo.files ?? [];
  if (files.length < 1) return;

  const capture = await createCapture(files[0]);

  const figure = document.createElement("figure");
  figure.append(capture.img);
  const caption = document.createElement("figcaption");
  caption.innerText = `\
    Time: ${capture.time}\n\
    Coords: ${JSON.stringify(capture.coords)}`;

  figure.append(caption);
  document.getElementById("captures").append(figure);

  form.reset();
}
