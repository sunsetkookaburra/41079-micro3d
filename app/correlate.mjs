import {angleTo,bearingAcuteAngle} from "../math.mjs";
import { _CAPTURE } from "./util.mjs";
//@ts-check

function navigate(distance, heading) {
  const theta = heading * Math.PI / 180;// changed from (Math.PI / 2) - (heading * Math.PI / 180); -Keegan
  return [
    distance * Math.cos(theta),
    distance * Math.sin(theta),
  ];
}

/**
 *
 * @param {typeof _CAPTURE} capture
 */
export function correlate(capture) {
  // (1) Build one graph for each feature:

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
      groupedFeatures.get(feature_id).push({
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
    throw new Error("Not enough frames to correlate");
  }
  const featureGraphs = [];
  for (const [feature_id, group] of groupedFeatures) {
    const graph = {};
    // relative distances from frames to feature
    //
    for (let i = 0; i < group.length; ++i) {
        graph[group[i].frame_id] = group[0].scale / group[i].scale;
    }
    // relative distances between frames
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
  const ratios = {}
  for (var edge in featureGraphs[0].frameDistanceRatios) {
    ratios[edge] = featureGraphs[0].frameDistanceRatios[edge];
  }
  var adjusted = ["0"];
  var changed = true;

  while (adjusted.length!=featureGraphs.length && changed == true) {
    changed = false;
    // check if in ratios then adjust
    for (const { feature_id} of featureGraphs) {
      var frameDistanceRatios = featureGraphs[feature_id].frameDistanceRatios;
      var graph = featureGraphs[feature_id].graph;
      if (!adjusted.includes(feature_id)) {
        const factors = [];
        for (var edge in frameDistanceRatios) {
          if (edge in ratios) {
            factors.push(ratios[edge] / frameDistanceRatios[edge]);
          }
        }
        if (factors.length!=0) {

          var avgfactor = 0;
          for (var i in factors) {
            avgfactor += factors[i];
          }
          avgfactor /= factors.length;
          for (var edge in frameDistanceRatios) {
            featureGraphs[feature_id].frameDistanceRatios[edge] *= avgfactor;
            ratios[edge] = featureGraphs[feature_id].frameDistanceRatios[edge];
          }
          for (var edge in graph) {
            featureGraphs[feature_id].graph[edge] *= avgfactor;
          }
          adjusted.push(feature_id);
          changed = true;
        }
      }
    }
  }
  if (adjusted.length!=featureGraphs.length) {
    for (const { feature_id } of featureGraphs) {
      if (!adjusted.includes(feature_id)) {
        console.log("Overlap required between feature " + feature_id + " and features " + adjusted);
      }
    }
    throw new Error("More overlap required");
  }


  // Now construct graphs into coordinates
  const featureCoords = {};
  for (const { feature_id, graph } of featureGraphs) {
    const coords = {};
    let x = 0, y = 0, n = 0;
    for (const { frame_id, heading } of groupedFeatures.get(feature_id)) {
      const ratio = graph[frame_id];
      const coord = navigate(ratio, (heading + 180) % 360);
      coords[frame_id] = coord;
      x += coord[0];
      y += coord[1];
      ++n;
    }
    featureCoords[feature_id] = coords;
  }

  // console.log(featureCoords)
  // let numFrames = Object.keys(capture["frames"]).length;
  const framecoords = {};
  for (var frame_id in featureCoords[0]) {
    framecoords[frame_id] = featureCoords[0][frame_id];
  }
  adjusted = ["0"];
  var changed = true;
  while (adjusted.length!=featureCoords.length && changed == true) {
    changed = false;
    // check if in framecoords then adjust
    for (var feature_id in featureCoords) {
      if (!adjusted.includes(feature_id)) {
        const displacements = [];
        for (var frame_id in featureCoords[feature_id]) {
          if (frame_id in framecoords) {
            displacements.push(
              [framecoords[frame_id][0]-featureCoords[feature_id][frame_id][0],
              framecoords[frame_id][1]-featureCoords[feature_id][frame_id][1]]
            )
          }
        }
        if (displacements.length!=0) {
          var avgdisplacement = [0,0];
          for (var i in displacements) {
            avgdisplacement[0] += displacements[i][0];
            avgdisplacement[1] += displacements[i][1];
          }
          avgdisplacement[0] /= displacements.length;
          avgdisplacement[1] /= displacements.length;
          for (var frame_id in  featureCoords[feature_id]) {
            featureCoords[feature_id][frame_id][0] += avgdisplacement[0];
            featureCoords[feature_id][frame_id][1] += avgdisplacement[1];
            framecoords[frame_id] = featureCoords[feature_id][frame_id];
          }
          adjusted.push(feature_id);
          changed = true
        }
      }
    }
  }
  const finalFrameCoords = framecoords;


  const featurecoords = {};
  for (let i = 0; i < featureGraphs.length; ++i) {
    featurecoords[i] = [0, 0, 0];
  }
  for (const { feature_id, graph } of featureGraphs) {
    for (const { frame_id, heading } of groupedFeatures.get(feature_id)) {
      const ratio = graph[frame_id];
      const vector = navigate(ratio, heading);
      featurecoords[feature_id][0] += finalFrameCoords[frame_id][0] + vector[0];
      featurecoords[feature_id][1] += finalFrameCoords[frame_id][1] + vector[1];
      featurecoords[feature_id][2]++;
    }
  }
  const finalFeatureCoords = {};
  for (let i = 0; i < featureGraphs.length; ++i) {
    finalFeatureCoords[i] = [
      featurecoords[i][0] / featurecoords[i][2],
      featurecoords[i][1] / featurecoords[i][2],
    ];
  }

  return [finalFrameCoords,finalFeatureCoords]


  // // then recalculate distances to objects by AAS (sine rule) or using scales again?? then averaging endpoint of line to by angle/distance
  // // distance to feature as ratio relative to average size, then find centrepoint of navigating
  // // TODO: use initial frame/point as reference heading based on averaged headings etc
}
