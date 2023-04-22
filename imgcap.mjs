//@ts-check

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
  AbsoluteOrientationSensor,
  LinearAccelerationSensor,
  Gyroscope,
  Accelerometer,
} from "./motion-sensors.js";


// window.addEventListener("load", async () => {
//   console.log(btoa("hello"));
//   console.log(new TextDecoder().decode(base64Encode(new TextEncoder().encode("hello"))));
// });

// function getSplitByte(bitOffset, array) {
//   const i = Math.trunc(bitOffset / 8);
//   const offset = bitOffset % 8;
//   return (
//     ((array[i] << offset) & 0xFF)
//     | ((array[i + 1] ?? 0) & 0xFF) >> (8 - offset)
//   );
// }

// function base64Encode(buffer) {
//   const oracle = new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
//   const out = new Uint8Array(4 * Math.ceil(buffer.byteLength / 3));
//   const tail = out.subarray(out.byteLength - 3);
//   // = sign padding
//   tail[0] = 61;
//   tail[1] = 61;
//   tail[2] = 61;
//   for (let bit = 0; bit < buffer.length * 8; bit += 6) {
//     out[Math.trunc(bit / 6)] = oracle[(getSplitByte(bit, buffer) >> 2) & 0x3F];
//   }
//   return out;
// }

// function getCoordinates() {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       ({ coords }) => resolve(coordinatesToJSON(coords)),
//       reject,
//       { enableHighAccuracy: true, timeout: 10000 },
//     );
//   });
// }

// function getAcceleration() {
//   const acl = new Accelerometer();
//   return new Promise((resolve, reject) => {
//     acl.addEventListener("reading", () => {
//       resolve([acl.x, acl.y, acl.z]);
//     });
//     acl.start();
//   }).then(v => {
//     setTimeout(()=>{acl.stop();}, 500);
//     return v;
//   });
// }

// async function getExifData(img) {
//   if (img instanceof Image && !img.complete) {
//     console.log("HERE");
//     await new Promise(res => {
//       img.addEventListener("load", () => res());
//     });
//   }

//   return await new Promise(res => {
//     EXIF.getData(img, function () {
//       res(EXIF.getAllTags(this));
//     });
//   });
// }

function quatToEuler([x, y, z, w]) {
  return [
    Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
    2 * Math.atan2(1 + 2 * (w * y - x * z), 1 - 2 * (w * y - x * z)),
    Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)),
  ];
}

class CaptureSession {
  constructor() {
    /** @type {HTMLDivElement} */
    //@ts-ignore
    this.output = document.getElementById("captures");
    this.accelerometer = new LinearAccelerationSensor();
    this.orientation = new AbsoluteOrientationSensor();
    this.gyroscope = new Gyroscope();
    this.readings = {
      /** @type any[] */
      accelerometer: [],
      /** @type any[] */
      orientation: [],
      /** @type any[] */
      gyroscope: [],
    };
    this.accelerometer.addEventListener("reading", () => {
      this.readings.accelerometer.push([
        Date.now(),
        this.accelerometer.x,
        this.accelerometer.y,
        this.accelerometer.z,
      ]);
      this.updateText();
    });
    this.orientation.addEventListener("reading", () => {
      this.readings.orientation.push([
        Date.now(),
        ...quatToEuler(this.orientation.quaternion)
      ]);
      this.updateText();
    });
    this.gyroscope.addEventListener("reading", () => {
      this.readings.gyroscope.push([
        Date.now(),
        this.gyroscope.x,
        this.gyroscope.y,
        this.gyroscope.z,
      ]);
      this.updateText();
    });
  }
  start() {
    this.accelerometer.start();
    this.orientation.start();
    this.gyroscope.start();
  }
  stop() {
    this.accelerometer.stop();
    this.orientation.stop();
    this.gyroscope.stop();
  }
  updateText() {
    this.output.innerText = `Samples\n\
      Rot=${JSON.stringify(quatToEuler(this.orientation.quaternion).map(v=>v.toFixed(2)), null, 2)}\n\
      A=${this.readings.accelerometer.length} \
      O=${this.readings.orientation.length} \
      G=${this.readings.gyroscope.length}`;
  }
}

window.addEventListener("load", () => {
  /** @type {HTMLInputElement} */
  //@ts-ignore
  const logger = document.getElementById("logger");
  /** @type {HTMLButtonElement} */
  //@ts-ignore
  const exportButton = document.getElementById("export");
  logger.checked = false;
  const session = new CaptureSession();
  logger.addEventListener("change", () => {
    DeviceMotionEvent["requestPermission"]?.();
    DeviceOrientationEvent["requestPermission"]?.();
    if (logger.checked) {
      session.start();
    }
    else {
      session.stop();
      exportButton.disabled = false;
      //@ts-ignore
      document.getElementById("captures")["href"] = `data:application/json,${JSON.stringify(session.readings)}`;
    }
  });

  window.addEventListener("dblclick", ev => {
    ev.preventDefault();
  });
});
