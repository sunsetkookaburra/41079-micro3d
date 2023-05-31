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
    sumLat += lat;
    sumLatWeight += weight ?? 1;
    sumLon += lon;
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
