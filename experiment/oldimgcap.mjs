/*
Sensor
Accelerometer
LinearAccelerationSensor
GravitySensor
Gyroscope
RelativeOrientationSensor
AbsoluteOrientationSensor
GeolocationSensor
*/

import {
  Accelerometer
} from "./motion-sensors.js";

// const OUT = document.getElementById("out");
const CAPTURES = document.getElementById("captures");

class CaptureSession {
  constructor() {

  }
}

// window.addEventListener("load", async () => {
//   console.log(btoa("hello"));
//   console.log(new TextDecoder().decode(base64Encode(new TextEncoder().encode("hello"))));
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

function getAcceleration() {
  const acl = new Accelerometer();
  return new Promise((resolve, reject) => {
    acl.addEventListener("reading", () => {
      resolve([acl.x, acl.y, acl.z]);
    });
    acl.start();
  }).then(v => {
    setTimeout(()=>{acl.stop();}, 500);
    return v;
  });
}

async function getExifData(img) {
  if (img instanceof Image && !img.complete) {
    console.log("HERE");
    await new Promise(res => {
      img.addEventListener("load", () => res());
    });
  }

  return await new Promise(res => {
    EXIF.getData(img, function () {
      res(EXIF.getAllTags(this));
    });
  });
}

// /**
//  *
//  * @param {GeolocationPosition} coords
//  */
// function coordinatesToJSON(coords) {
//   return {
//     latitude: coords.latitude,
//     longitude: coords.longitude,
//     altitude: coords.altitude,
//     accuracy: coords.accuracy,
//     altitudeAccuracy: coords.altitudeAccuracy,
//     heading: coords.heading,
//     speed: coords.speed,
//   };
// }

// /**
//  *
//  * @param {File} file
//  */
// async function createCapture(file) {
//   const tasks = [];

//   // Image
//   const img = new Image();
//   img.src = URL.createObjectURL(file);
//   // console.log(new TextDecoder().decode(base64Encode(new Uint8Array(await file.arrayBuffer()))));

//   // EXIF
//   tasks.push(getExifData(img));

//   // Timestamp
//   const time = new Date();

//   // Location
//   tasks.push(getCoordinates().catch(v => ({})));

//   // Acceleration
//   const acl = new Accelerometer()
//   acl.addEventListener("reading", () => {
//     console.log(acl.x, acl.y, acl.z);
//     acl.stop();
//   });
//   acl.start();

//   // Orientation

//   // Compass

//   const [exif, coords] = await Promise.all(tasks);
//   return {
//     img, time, coords, exif
//   };
// }

// /**
//  *
//  * @param {HTMLFormElement} form
//  * @returns
//  */
// globalThis.handleCapture = async function handleCapture(form) {
//   const files = form.photo.files ?? [];
//   if (files.length < 1) return;

//   const capture = await createCapture(files[0]);

//   const figure = document.createElement("figure");
//   figure.append(capture.img);
//   const caption = document.createElement("figcaption");
//   caption.innerText = `\
//     Time: ${capture.time}\n\
//     Coords: ${JSON.stringify(capture.coords)}\n\
//     EXIF: ${JSON.stringify(capture.exif)}`;

//   figure.append(caption);
//   document.getElementById("captures").append(figure);

//   form.reset();
// }

window.addEventListener("load", () => {
  const logger = document.getElementById("logger");
  const output = document.getElementById("captures");

});
