//@ts-check

import { centroid, meanDistance, bearingAcuteAngle, angleTo } from "./util.mjs";

/**
 *
 * @param {number} distance
 * @param {number} heading
 * @returns
 */
function navigate(distance, heading) {
  const theta = heading * Math.PI / 180;
  return [
    distance * Math.cos(theta),
    distance * Math.sin(theta),
  ];
}

/**
 * @returns {import("./util.mjs").Positioned}
 * @param {import("./util.mjs").Capture} capture
 */
export function correlate(capture) {
  // (1) Build one graph for each feature:

  /**
   * @type {Map<string, { frame_id: string, scale: number, heading: number }[]>}
   * feature_id :: ...
   */
  const groupedFeatures = new Map();

  for (const [frame_id, frame] of Object.entries(capture["frames"])) {
    for (const [feature_id, bbox] of Object.entries(frame["features"])) {
      if (!groupedFeatures.has(feature_id)) {
        groupedFeatures.set(feature_id, []);
      }
      const angles = angleTo(
        { x: bbox.x + bbox.w / 2, y: bbox.y + bbox.h / 2 },
        { x: frame.width, y: frame.height },
        { x: frame.fov.h, y: frame.fov.v },
      );
      groupedFeatures.get(feature_id)?.push({
        frame_id,
        scale: bbox.h,
        heading: frame.heading + angles.x,
      });
    }
  }
  // filter for features with more than 2 occurences only
  for (const [feature_id, group] of groupedFeatures) {
    if (group.length <= 1) groupedFeatures.delete(feature_id);
  }

  if (groupedFeatures.size == 0) {
    // throw new Error("Not enough frames to correlate");
    return { features: {}, frames: {} };
  }
  /**
   * @type {{
   *  feature_id: string,
   *  graph: { [frame_id: string]: number },
   *  frameDistanceRatios: { [frame_i_j_edge: string]: number }
   * }[]}
   */
  const featureGraphs = [];
  for (const [feature_id, group] of groupedFeatures) {
    /** @type {{ [frame_id: string]: number }} */
    const graph = {};
    // relative distances from frames to feature
    //
    for (let i = 0; i < group.length; ++i) {
        graph[group[i].frame_id] = group[0].scale / group[i].scale;
    }
    // relative distances between frames
    /** @type {{ [frame_i_j_edge: string]: number }} */
    const frameDistanceRatios = {};
    for (let i = 0; i < group.length; ++i) {
      for (let j = i + 1; j < group.length; ++j) {
        const iId = group[i].frame_id;
        const jId = group[j].frame_id;
        const iRatio = graph[iId];
        const jRatio = graph[jId];
        frameDistanceRatios[`${iId}:${jId}`] = Math.sqrt(
          iRatio ** 2 +
            jRatio ** 2 -
            2 * iRatio * jRatio *
              Math.cos(
                bearingAcuteAngle(group[i].heading, group[j].heading) *
                  Math.PI / 180,
              ),
        );
      }
    }
    featureGraphs.push({ feature_id, graph, frameDistanceRatios });
  }

  // normalise ratios across all features
  /** @type {{ [frame_i_j_edge: string]: number }} */
  const relativeDistances = {}
  for (const edge in featureGraphs[0].frameDistanceRatios) {
    relativeDistances[edge] = featureGraphs[0].frameDistanceRatios[edge];
  }
  let adjusted = ["0"];
  let changed = true;

  while (adjusted.length != featureGraphs.length && changed == true) {
    changed = false;
    // check if in ratios then adjust
    for (const { feature_id, graph, frameDistanceRatios } of featureGraphs) {
      if (!adjusted.includes(feature_id)) {
        /** @type {number[]} */
        const factors = [];
        for (const edge in frameDistanceRatios) {
          if (edge in relativeDistances) {
            factors.push(relativeDistances[edge] / frameDistanceRatios[edge]);
          }
        }
        if (factors.length > 0) {
          const avgFactor = factors.reduce((acc, x) => acc + x, 0) / factors.length;
          for (var edge in frameDistanceRatios) {
            frameDistanceRatios[edge] *= avgFactor;
            relativeDistances[edge] = frameDistanceRatios[edge];
          }
          for (var edge in graph) {
            graph[edge] *= avgFactor;
          }
          adjusted.push(feature_id);
          changed = true;
        }
      }
    }
  }

  if (adjusted.length != featureGraphs.length) {
    for (const { feature_id } of featureGraphs) {
      if (!adjusted.includes(feature_id)) {
        console.log("Overlap required between feature " + feature_id + " and features " + adjusted);
      }
    }
    return { features: {}, frames: {} };
  }


  // Now construct graphs into coordinates
  /** @type {{ [feature_id: string]: { [frame_id: string]: import("./util.mjs").Coords } }} */
  const featureCoords = {};
  for (const { feature_id, graph } of featureGraphs) {
    /** @type {{ [frame_id: string]: import("./util.mjs").Coords }} */
    const coords = {};
    for (const { frame_id, heading } of groupedFeatures.get(feature_id) ?? []) {
      const ratio = graph[frame_id];
      const coord = navigate(ratio, (heading + 180) % 360);
      coords[frame_id] = { lat: coord[0], lon: coord[1] };
    }
    featureCoords[feature_id] = coords;
  }

  /** @type {{[frame_id: string]: (typeof featureCoords)[string][string]}} */
  const framecoords = {};
  for (const [frame_id, coords] of Object.entries(featureCoords[featureGraphs[0].feature_id])) {
    framecoords[frame_id] = { lat: coords.lat, lon: coords.lon };
  }
  adjusted = ["0"];
  changed = true;
  // keep iterating for unadjusted, due to side effects of adjusting (or prerequisite adjustments)
  while (changed == true) {
    changed = false;
    // check if in framecoords then adjust
    for (var feature_id in featureCoords) {
      if (!adjusted.includes(feature_id)) {
        const displacements = [];
        // see if it can be adjusted:
        for (var frame_id in featureCoords[feature_id]) {
          if (frame_id in framecoords) {
            displacements.push(
              [framecoords[frame_id].lat-featureCoords[feature_id][frame_id].lat,
              framecoords[frame_id].lon-featureCoords[feature_id][frame_id].lon]
            )
          }
        }
        // if it can be adjusted, do so!
        if (displacements.length!=0) {
          var avgdisplacement = [0,0];
          for (var i in displacements) {
            avgdisplacement[0] += displacements[i][0];
            avgdisplacement[1] += displacements[i][1];
          }
          avgdisplacement[0] /= displacements.length;
          avgdisplacement[1] /= displacements.length;
          for (var frame_id in  featureCoords[feature_id]) {
            featureCoords[feature_id][frame_id].lat += avgdisplacement[0];
            featureCoords[feature_id][frame_id].lon += avgdisplacement[1];
            framecoords[frame_id] = featureCoords[feature_id][frame_id];
          }
          adjusted.push(feature_id);
          changed = true
        }
      }
    }
  }

  /** @type {{[feature_id: string]: [number, number, number]}} */
  const featurecoords = {};
  for (const { feature_id } of featureGraphs) {
    featurecoords[feature_id] = [0, 0, 0];
  }
  for (const { feature_id, graph } of featureGraphs) {
    for (const { frame_id, heading } of groupedFeatures.get(feature_id) ?? []) {
      const ratio = graph[frame_id];
      const vector = navigate(ratio, heading);
      featurecoords[feature_id][0] += framecoords[frame_id].lat + vector[0];
      featurecoords[feature_id][1] += framecoords[frame_id].lon + vector[1];
      featurecoords[feature_id][2]++;
    }
  }
  /** @type {{[feature_id: string]: import("./util.mjs").Coords}} */
  const finalFeatureCoords = {};
  for (const { feature_id } of featureGraphs) {
    finalFeatureCoords[feature_id] = {
      lat: featurecoords[feature_id][0] / featurecoords[feature_id][2],
      lon: featurecoords[feature_id][1] / featurecoords[feature_id][2]
    }
  }
  const finalFrameCoords = framecoords;

  // Prepare Centroid / Mean Distance
  const relativeCentre = centroid(Object.values(finalFrameCoords));
  const baseError = Math.max(...Object.values(capture.frames).map(frame => frame.gps_error ?? 0));
  const gpsCentre = centroid(
    Object.values(capture.frames).map(frame => ({
      ...frame.coords,
      weight: 1 + baseError / ((frame.gps_error ?? 0) + 0.00001)
    }))
  );
  const scaleup = (
    meanDistance(gpsCentre, Object.values(capture.frames).map(frame => frame.coords))
    /
    meanDistance(relativeCentre, Object.values(finalFrameCoords))
  );

  // Relative to Absolute Position Shift + Scaling

  // Shift to align relative frames centroid on 0,0 (null-island)
  for (const point of [...Object.values(finalFeatureCoords), ...Object.values(finalFrameCoords)]) {
    point.lat -= relativeCentre.lat;
    point.lon -= relativeCentre.lon;
  }

  // Scale up to real size
  for (const point of [...Object.values(finalFeatureCoords), ...Object.values(finalFrameCoords)]) {
    point.lat *= scaleup;
    point.lon *= scaleup;
  }

  // Shift to align frames to gps centroid
  for (const point of [...Object.values(finalFeatureCoords), ...Object.values(finalFrameCoords)]) {
    point.lat += gpsCentre.lat;
    point.lon += gpsCentre.lon;
  }

  const out = { features: {}, frames: {} };
  for (const [id, coords] of Object.entries(finalFeatureCoords)) {
    out.features[id] = {
      coords,
      tags: capture.features[id],
    };
  }
  for (const [id, coords] of Object.entries(framecoords)) {
    out.frames[id] = { coords };
  }
  return out;
}
