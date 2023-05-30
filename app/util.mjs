//@ts-check

import "../lib/geographiclib-geodesic.min.js";

export const _COORD = { lat: 0, lon: 0 };
export const _BBOX = { x: 0, y: 0, w: 0, h: 0 };
export const _CAPTURE = {
 frames: {
    0: {
      width: 0,
      height: 0,
      features: {
        0: _BBOX
      },
      coords: _COORD,
      fov: { h: 0, v: 0 },
      heading: 0,
      elevation: 0,
      gps_error: 0,
      timestamp: 0,
    }},
  features: {
    0: { "ref": "" }
  },
};

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
 * @param {{from: typeof _COORD, to: typeof _COORD}} points
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
 * @param {{from: typeof _COORD, heading: number, distance: number}} points
 * @returns {typeof _COORD}
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
