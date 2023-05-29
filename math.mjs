//@ts-check
/**/

class Capture {
  constructor(json) {
    this._inner = json;
  }
  frameFeatures(id) {
    return Object.entries(this._inner["frames"][id]);
  }
}

export const CAPTURE = {
  "frames": {
    0: {
      "width": 4032,
      "height": 3024,
      "features": {
        2: [1244.64, 1305.36, 2787.36, 1615.23],
        0: [200.2, 1068.54, 248.97, 321.83],
        3: [2538.03, 1153.55, 340.05, 309.69],
        4: [843.87, 388.44, 437.2, 904.77]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 181.0156632,
        "latlon": [-33.883153, 151.200911],
        "elevation": 0.0,
        "timestamp": new Date("2023/04/22 16:44:27.897+10:00").valueOf(),
      }
    },
    1: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1791.14, 1481.46, 607.23, 959.42],
        2: [2210.13, 1226.42, 1821.87, 795.47],
        1: [2750.56, 959.24, 315.76, 425.06],
        3: [1135.34, 1311.43, 303.61, 382.56]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 133.1238785,
        "latlon": [-33.883097, 151.200822],
        "timestamp": new Date("2023/04/22 16:44:42.486+10:00").valueOf(),
      }
    },
    2: {
      "width": 4032,
      "height": 3024,
      "features": {
        3: [1657.55, 1317.5, 303.62, 418.99],
        1: [449.17, 1092.83, 370.41, 382.55],
        2: [1621.12, 1165.7, 898.7, 340.04],
        0: [3218.13, 1074.61, 127.52, 151.81]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 265.9196625,
        "latlon": [-33.883041, 151.200731],
        "timestamp": new Date("2023/04/22 16:44:56.974+10:00").valueOf(),
      }
    },
    3: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1876.15, 1183.91, 115.38, 145.69],
        3: [1104.97, 1517.89, 485.79, 613.3],
        2: [0.0, 1329.65, 1001.74, 552.58],
        4: [3436.73, 388.44, 595.27, 1420.92]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 324.5359498,
        "latlon": [-33.883022, 151.200775],
        "timestamp": new Date("2023/04/22 16:45:10.275+10:00").valueOf(),
      }
    },
    4: {
      "width": 4032,
      "height": 3024,
      "features": {
        4: [2811.29, 358.08, 455.42, 1135.52],
        3: [2865.94, 1554.32, 661.88, 904.77],
        0: [1013.89, 1068.54, 170.02, 230.75]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 22.92895508,
        "latlon": [-33.883061, 151.200822],
        "timestamp": new Date("2023/04/22 16:45:22.805+10:00").valueOf(),
      }
    }
  },
  "features": {
    0: {
      "description": "bag"
    },
    1: {
      "amenity": "waste_basket"
    },
    2: {
      "amenity": "table"
    },
    3: {
      "amenity": "chair"
    },
    4: {
      "man_made": "planter"
    },
  }
};

export const CAPTURETEST = {
  "frames": {
    0: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [360.874, 1462, 100, 100],
        1: [3447.626, 1462, 100, 100]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 0,
        "latlon": [-1, 0],
        "elevation": 0.0,
        "timestamp": new Date("2023/04/22 16:44:27.897+10:00").valueOf(),
      }
    },
    1: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1904.25, 1400.25, 223.5, 223.5]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 0,
        "latlon": [0, -1],
        "timestamp": new Date("2023/04/22 16:44:42.486+10:00").valueOf(),
      }
    },
    2: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1904.25, 1400.25, 223.5, 223.5]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 90,
        "latlon": [1, 0],
        "timestamp": new Date("2023/04/22 16:44:56.974+10:00").valueOf(),
      }
    },
    3: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1904.25, 1400.25, 223.5, 223.5]
      },
      "metadata": {
        "fov": [69.4, 52.05], 
        "heading": 0,
        "latlon": [0, 1],
        "timestamp": new Date("2023/04/22 16:45:10.275+10:00").valueOf(),
      }
    }
  },
  "features": {
    0: {
      "description": "bag"
    },
    1: {
      "amenity": "waste_basket"
    },
  }
};

export const CAPTURETEST2 = {
  "frames": {
    0: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1966, 1462, 300, 300],
        1: [1966, 1462, 100, 100]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 0,
        "latlon": [-1, 0],
        "elevation": 0.0,
        "timestamp": new Date("2023/04/22 16:44:27.897+10:00").valueOf(),
      }
    },
    1: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1966, 1462, 100, 100],
        1: [17.1, 1462, 83.2, 83.2]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 90,
        "latlon": [0, -1],
        "timestamp": new Date("2023/04/22 16:44:42.486+10:00").valueOf(),
      }
    },
    2: {
      "width": 4032,
      "height": 3024,
      "features": {
        1: [1966, 1462, 300, 300]
      },
      "metadata": {
        "fov": [69.4, 52.05],
        "heading": 0,
        "latlon": [1, 0],
        "timestamp": new Date("2023/04/22 16:44:56.974+10:00").valueOf(),
      }
    },
    3: {
      "width": 4032,
      "height": 3024,
      "features": {
        0: [1966, 1462, 100, 100],
        1: [3931.7, 1462, 83.2, 83.2]
      },
      "metadata": {
        "fov": [69.4, 52.05], 
        "heading": 270,
        "latlon": [0, 3],
        "timestamp": new Date("2023/04/22 16:45:10.275+10:00").valueOf(),
      }
    }
  },
  "features": {
    0: {
      "description": "bag"
    },
    1: {
      "amenity": "waste_basket"
    },
  }
};
// const FINAL_CAPTURE = {
//   frames: {
//     0: {
//       features: {
//         0: {
//           vfovAtHorizon: 0,
//           vfovAtGround: 0,
//         }
//       }
//     }
//   }
// };

// class DistanceEstimator {
//   /**
//    * @param {typeof CAPTURE} capture
//    */
//   constructor(capture) {
//     this._capture = capture;
//   }
// }

export function bearingAcuteAngle(a, b) {
  const dif = Math.abs(a - b);
  return dif > 180 ? 360 - dif : dif;
}

/**
 * @param {typeof CAPTURE["frames"][number]["features"][number]} a
 */
function frameFeatureScale(a) {
  a.bbox[3];
}

/**
 * @param {typeof CAPTURE["frames"][number]["features"][number]} a
 * @param {typeof CAPTURE["frames"][number]["features"][number]} b
 */
function frameRelativeSize(a, b) {
  frameFeatureScale(a)
}

/**
 * for a single feature
 * @param {{ frame_id: string, feature_heading: number, feature_scale: number }[]} featureFrames
 */
function relativeDistanceGraph(featureFrames) {
  console.log("Basis Frame", featureFrames[0].frame_id);
  const featureRatios = { [featureFrames[0].frame_id]: 1 };
  // (3/4) Ratios to feature
  for (let i = 1; i < featureFrames.length; ++i) {
    featureRatios[featureFrames[i].frame_id] = featureFrames[0].feature_scale / featureFrames[i].feature_scale;
  }
  console.log(featureRatios);
  // (5) Compute ratios between frames
  const frameRatios = {};
  for (let i = 0; i < featureFrames.length; ++i) {
    for (let j = i + 1; j < featureFrames.length; ++j) {
      const iId = featureFrames[i].frame_id;
      const jId = featureFrames[j].frame_id;
      const iRatio = featureRatios[iId];
      const jRatio = featureRatios[jId];
      frameRatios[`${iId}:${jId}`] = 5.178 * Math.sqrt(
        iRatio ** 2
        + jRatio ** 2
        - 2 * iRatio * jRatio * Math.cos(bearingAcuteAngle(featureFrames[i].feature_heading, featureFrames[j].feature_heading) * Math.PI / 180)
      );
    }
  }

  return frameRatios;
}

/** @param {typeof CAPTURE} capture */
function correlateDistances(capture) {
  // (1) Find most occuring feature
  const featureOccurences = {};
  const mostSeen = { id: "-1", count: -1 };
  for (const [frame_id, frame] of Object.entries(capture.frames)) {
    for (const [feature_id, feature] of Object.entries(frame.features)) {
      featureOccurences[feature_id] ??= 0;
      const count = ++featureOccurences[feature_id];
      if (count > mostSeen.count) {
        mostSeen.id = feature_id;
        mostSeen.count = count;
      }
    }
  }

  // // (2) Pick two frames containing that feature that have the largest size difference
  // let minSized = { frame: -1, size: Infinity };
  // let maxSized = { frame: -1, size: -Infinity };
  // for (const frame of capture.frames) {
  //   for (const feature of frame.features) {
  //     if (feature.id == mostSeen && feature.bbox[3] < minSized.size) {
  //       minSized.frame = frame.id;
  //       minSized.size = feature.bbox[3];
  //     }
  //     if (feature.id == mostSeen && feature.bbox[3] > maxSized.size) {
  //       maxSized.frame = frame.id;
  //       maxSized.size = feature.bbox[3];
  //     }
  //   }
  // }

  const mostSeenList = [];
  for (const [frame_id, frame] of Object.entries(capture.frames)) {
    for (const [feature_id, bbox] of Object.entries(frame.features)) {
      if (mostSeen.id == feature_id) {
        const angles = angleTo(
          { x: bbox[0] + bbox[2] / 2, y: bbox[1] + bbox[3] / 2},
          { x: bbox[0], y: bbox[1]},
          { x: frame.metadata.fov[0], y: frame.metadata.fov[1] }
        );
        mostSeenList.push({
          frame_id,
          feature_scale: bbox[3] / (1 - Math.abs(angles.y) / 90),
          feature_heading: frame.metadata.heading + angles.x
        });
      }
    }
  }

  // console.log(mostSeen.id, mostSeen.count);
  // console.log(mostSeenList);
  console.log("Basis Feature", mostSeen.id);
  console.log(relativeDistanceGraph(mostSeenList));
}

if ('Deno' in globalThis) {
  const orientation = JSON.parse(globalThis.Deno.readTextFileSync("alumnigardenrectify.json"))["orientation"];
  for (const [id, frame] of Object.entries(CAPTURE.frames)) {
    let heading;
    for (const [t, x, y, z] of orientation) {
      if (t > frame.metadata.timestamp) {
        heading = (360 - z / Math.PI * 180) % 360
        break;
      };
    }
    frame.metadata.heading = heading || 0;
  }

  console.log(CAPTURE);
  correlateDistances(CAPTURE);
}

// console.log(relativeDistanceGraph([
//   { frame_id: "0", feature_scale: 1, feature_heading: 45 },
//   { frame_id: "1", feature_scale: 1, feature_heading: 135 },
//   { frame_id: "2", feature_scale: 1, feature_heading: 225 },
//   { frame_id: "3", feature_scale: 1, feature_heading: 315 },
// ]))

function dmsToDec([deg, min, sec]) {
  return deg + min / 60 + sec / 3600;
}

function fractional([numerator, denominator]) {
  return numerator / denominator;
}

export function captureParameters(exifTags) {
  const width = exifTags["Image Width"]["value"];
  const height = exifTags["Image Height"]["value"];
  const focal35mm = exifTags["FocalLengthIn35mmFilm"]["value"];
  const lat = dmsToDec(exifTags["GPSLatitude"]["value"].map(fractional)) * (exifTags["GPSLatitudeRef"]["value"][0] == "N" ? 1 : -1);
  const lon = dmsToDec(exifTags["GPSLongitude"]["value"].map(fractional)) * (exifTags["GPSLongitudeRef"]["value"][0] == "E" ? 1 : -1);
  const ele = fractional(exifTags["GPSAltitude"]["value"]) * (exifTags["GPSAltitudeRef"]["value"] == 0 ? 1 : -1);
  const head = fractional(exifTags["GPSImgDirection"]["value"]);
  const err = fractional(exifTags["GPSHPositioningError"]["value"]);
  const time = new Date(
    exifTags["DateTimeOriginal"]["value"][0].split(" ")[0].replaceAll(":", "-") + "T" +
    exifTags["DateTimeOriginal"]["value"][0].split(" ")[1] +
    (exifTags["SubSecTimeOriginal"] && "."+exifTags["SubSecTimeOriginal"]["value"] || "") +
    exifTags["OffsetTimeOriginal"]["value"]
  );

  let hfov = 2 * Math.atan2(36, 2 * focal35mm);
  let vfov = 2 * Math.atan2(24, 2 * focal35mm);

  // TODO: Adjust for sensor crop with image vs 35mm ratio

  // hfov *= 180 / Math.PI;
  // vfov *= 180 / Math.PI;

  return {
    frame: { x: width, y: height },
    fov: { x: hfov, y: vfov },
    nav: { lat, lon, ele, head, err },
    time,
  };
}

/** Angle to point, +X Right, +Y Up (cartesian) */
export function angleTo(point, frame, fov) {
  return {
    x: point.x / frame.x * fov.x - fov.x / 2,
    y: -(point.y / frame.y * fov.y - fov.y / 2),
  };
}

// export function area(bbox) {
//   return bbox[2] * bbox[3];
// }

// // Distance to bboxOther, assuming bboxBase is 1 unit.
// export function bboxRelativeDistance(bboxBase, bboxOther) {
//   return Math.sqrt(area(bboxOther) / area(bboxBase));
// }

// class DistanceEstimator {
//   constructor(feature, bbox) {
//     this._featureDistances = {
//       [feature]: { area: area(bbox), distance: 1 },
//     };
//   }
//   add(feature, bbox) {
//     if (feature in this._featureDistances) {

//     }
//   }
// }

/**
 * https://rotations.berkeley.edu/reconstructing-the-motion-of-a-tossed-iphone/
 */
// class InertialNavigation {
//   _psi = 0;
//   _theta = 0;
//   _phi = 0;
//   /**
//    * @param {DeviceMotionEvent} ev
//   */
//   motion(ev) {
//     const dPsi = (
//       Math.sin(this._phi0) / Math.cos(this._theta0) * ev.rotationRate.gamma
//       + Math.cos(this._phi0) / Math.cos(this._theta0) * ev.rotationRate.alpha
//     );
//     const dTheta = (
//       Math.cos(this._theta0) * ev.rotationRate.gamma
//       - Math.sin(this._theta0) * ev.rotationRate.alpha
//     );
//     const dPhi = (
//       ev.rotationRate.beta
//       + Math.sin(this.phi0) * Math.tan(this._theta0) * ev.rotationRate.gamma
//       + Math.cos(this.phi0) * Math.tan(this._theta0) * ev.rotationRate.gamma
//     );
//   }
// }


// function bearingAcuteAngle(a, b) {
//   const big = Math.max(a, b);
//   const little = Math.min(a, b);
//   const delta = 2 * Math.PI - big;
//   return (big + delta) % (2 * Math.PI) - (little + delta);
// }

// export function correlationTriangle(frame1Bearing1, frame1Bearing2, frame2Bearing1, frame2Bearing2) {
//   const object1Acute = bearingAcuteAngle(frame1Bearing1, frame2Bearing1);
//   const object2Acute = bearingAcuteAngle(frame1Bearing2, frame2Bearing2);
//   // Interior angles sum
//   const frame1delta = Math.abs(frame1Bearing1 - frame1Bearing2);
//   const frame2delta = Math.abs(frame2Bearing1 - frame2Bearing2);
// }

// export function range(arr) {
//   let min = Infinity;
//   let max = -Infinity;
//   for (const x of arr) {
//     if (x < min) min = x;
//     if (x > max) max = x;
//   }
//   return { min, max };
// }

// class Complex {
//   constructor(re = 0, im = 0) {
//     this.re = re;
//     this.im = im;
//   }
// }

// class Matrix extends Array {
//   constructor(rows, cols = rows) {
//     super();
//     this.rows = rows;
//     this.cols = cols;
//     this.storage = [];
//   }
//   from(rows, cols, fn) {
//     const m = new Matrix(rows, cols);
//     for (let i = 0; i < this.rows; ++i) {
//       for (let j = 0; j < this.cols; ++j) {
//         m.storage[i][j] = fn(i, j);
//       }
//     }
//   }
// }
