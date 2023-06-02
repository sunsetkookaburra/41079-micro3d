//@ts-check

import "../lib/geographiclib-geodesic.min.js";

/**
 * @typedef {{lat:number,lon:number}} Coords
 *
 * @typedef {{x:number,y:number,w:number,h:number}} Bbox
 *
 * @typedef {{
 *  frames: {
 *    [frame_id: string]: {
 *      width: number,
 *      height: number,
 *      features: {
 *        [feature_id: string]: Bbox
 *      },
 *      coords: Coords,
 *      fov: { h: number, v: number },
 *      heading: number,
 *      elevation?: number,
 *      gps_error?: number,
 *      timestamp?: number,
 *    },
 *  },
 *  features: {
 *    [feature_id: string]: {
 *      [osmTagKey: string]: string,
 *    },
 *  },
 * }} Capture
 *
 * @typedef {{
 *   features: {
 *     [feature_id: string]: {
 *       coords: Coords,
 *       tags: {
 *         [osmTagKey: string]: string
 *       }
 *     },
 *   },
 *   frames: {
 *     [frame_id: string]: {
 *       coords: Coords
 *     },
 *   },
 * }} Positioned
 */

/**
 *
 * @param {{from: number, to: number}} headings
 * @returns {number}
 */
export function turnBetween({from, to}) {
  const left = from - to + Number(from - to < 0) * 360;
  const right = to - from + Number(to - from < 0) * 360;
  if (left < right) return -left;
  else return right;
}

/**
 *
 * @param {{from: Coords, to: Coords}} points
 * @returns {{bearing: number, distance: number}}
 */
export function wgs84Inverse({from, to}) {
  //@ts-expect-error (geodesic from side-effect import)
  const result = geodesic.Geodesic.WGS84.Inverse(
    from.lat, from.lon,
    to.lat, to.lon
  );
  return {
    bearing: (result.azi1 + 360) % 360,
    distance: result.s12,
  };
}

/**
 *
 * @param {{from: Coords, heading: number, distance: number}} points
 * @returns {Coords}
 */
export function wgs84Navigate({from, heading, distance}) {
  //@ts-expect-error (geodesic from side-effect import)
  const result = geodesic.Geodesic.WGS84.Direct(
    from.lat, from.lon,
    (heading - 360) % 360,
    distance
  );
  return {
    lat: result.lat2,
    lon: result.lon2,
  };
}

/**
 *
 * @param {(Coords & { weight?: number })[]} points
 */
export function centroid(points) {
  let sumLat = 0, sumLatWeight = 0;
  let sumLon = 0, sumLonWeight = 0;
  for (const { lat, lon, weight } of points) {
    sumLat += lat * (weight ?? 1);
    sumLatWeight += weight ?? 1;
    sumLon += lon * (weight ?? 1);
    sumLonWeight += weight ?? 1;
  }
  return {
    lat: sumLat / sumLatWeight,
    lon: sumLon / sumLonWeight,
  };
}

/**
 *
 * @param {Coords} from
 * @param {Coords[]} points
 */
export function meanDistance(from, points) {
  let sumDist = 0;
  for (const point of points) {
    sumDist += wgs84Inverse({ from, to: point }).distance;
  }
  return sumDist / points.length;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function bearingAcuteAngle(a, b) {
  const dif = Math.abs(a - b);
  return dif > 180 ? 360 - dif : dif;
}

/** Angle to point, +X Right, +Y Up (cartesian)
 * @param {{x:number,y:number}} point
 * @param {{x:number,y:number}} frame
 * @param {{x:number,y:number}} fov
*/
export function angleTo(point, frame, fov) {
  return {
    x: point.x / frame.x * fov.x - fov.x / 2,
    y: -(point.y / frame.y * fov.y - fov.y / 2),
  };
}
