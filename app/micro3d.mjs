export function extractEXIF(imageBuffer) {
  const exifTags = ExifReader.load(imageBuffer);
  const width = exifTags["Image Width"]["value"];
  const height = exifTags["Image Height"]["value"];
  const focal35mm = exifTags["FocalLengthIn35mmFilm"]["value"];
  const lat = dmsToDec(exifTags["GPSLatitude"]["value"].map(fractional)) * (exifTags["GPSLatitudeRef"]["value"][0] == "N" ? 1 : -1);
  const lon = dmsToDec(exifTags["GPSLongitude"]["value"].map(fractional)) * (exifTags["GPSLongitudeRef"]["value"][0] == "E" ? 1 : -1);
  const elevation = fractional(exifTags["GPSAltitude"]["value"]) * (exifTags["GPSAltitudeRef"]["value"] == 0 ? 1 : -1);
  const heading = fractional(exifTags["GPSImgDirection"]["value"]);
  const gps_error = fractional(exifTags["GPSHPositioningError"]["value"]);
  const timestamp = new Date(
    exifTags["DateTimeOriginal"]["value"][0].split(" ")[0].replaceAll(":", "-") + "T" +
    exifTags["DateTimeOriginal"]["value"][0].split(" ")[1] +
    (exifTags["SubSecTimeOriginal"] && "."+exifTags["SubSecTimeOriginal"]["value"] || "") +
    exifTags["OffsetTimeOriginal"]["value"]
  ).valueOf();

  let hfov = 2 * Math.atan2(36, 2 * focal35mm);
  let vfov = 2 * Math.atan2(24, 2 * focal35mm);

  // TODO: Adjust for sensor crop with image vs 35mm ratio / orientation

  return {
    width,
    height,
    metadata: {
      fov: [hfov, vfov],
      latlon: [lat, lon],
      heading,
      elevation,
      gps_error,
      timestamp,
    },
  };
}

function navigate(distance, heading) {
  const theta = (Math.PI / 2) - (heading * Math.PI / 180);
  return [
    distance * Math.cos(theta),
    distance * Math.sin(theta),
  ];
}

// frames need to calculate bearing from centroid

// used coordinate points instead
// map with common frame number to adjust scaling

export function correlateDistances(capture) {
  // (1) Build one graph for each feature:

  const groupedFeatures = new Map();

  for (const [frame_id, frame] of Object.entries(capture["frames"])) {
    for (const [feature_id, bbox] of Object.entries(frame["features"])) {
      if (!groupedFeatures.has(feature_id)) {
        groupedFeatures.set(feature_id, []);
      }
      const angles = angleTo(
        { x: bbox[0] + bbox[2] / 2, y: bbox[1] + bbox[3] / 2},
        { x: bbox[0], y: bbox[1]},
        { x: frame.metadata.fov[0], y: frame.metadata.fov[1] }
      );
      groupedFeatures.get(feature_id).push({
        frame_id,
        scale: bbox[3],
        heading: frame.metadata.heading + angles.x,
      });
    }
  }

  // filter for features with more than 2 occurences only
  for (const [feature_id, group] of groupedFeatures) {
    if (group.length <= 1) groupedFeatures.delete(feature_id);
  }

  if (groupedFeatures.size == 0) throw new Error("Not enough frames to correlate");

  const featureGraphs = [];
  for (const [feature_id, group] of groupedFeatures) {
    const graph = {};
    // relative distances from frames to feature
    for (let i = 1; i < group.length; ++i) {
      graph[group[i].frame_id] = group[0].scale / group[i].scale;
    }
    // relative distances between frames
    for (let i = 0; i < group.length; ++i) {
      for (let j = i + 1; j < group.length; ++j) {
        const iId = group[i].frame_id;
        const jId = group[j].frame_id;
        const iRatio = graph[iId];
        const jRatio = group[jId];
        // Maybe TODO: calulate heading to each point/frame
        graph[`${iId}:${jId}`] = Math.sqrt(
          iRatio ** 2
          + jRatio ** 2
          - 2 * iRatio * jRatio * Math.cos(bearingAcuteAngle(group[i].heading, group[j].heading) * Math.PI / 180)
        );
      }
    }
    featureGraphs.push({ feature_id, graph });
  }

  // normalise ratios across all features
  for (let i = 1; i < featureGraphs.length; ++i) {
    const { feature_id, graph } = featureGraphs[i];
    let found = false;
    for (const [edge, length] of Object.entries(graph)) {
      if (edge in featureGraphs[0].graph) {
        // calculate adjustment
        const factor = featureGraphs[0].graph[edge] / length;
        for (const edge in graph) {
          graph[edge] *= factor;
        }
        found = true;
        break;
      }
    }
    if (!found) throw new Error("Disconnected graph on feature " + feature_id);
  }


  // Now construct graphs into coordinates
  const featureCoords = {};
  //const frame2feature = {};
  //for (let i = 0; i < featureGraphs.length; ++i) {
  //  frame2feature[i] = {};
  //}
  //const featureFrameNavigate = new Map();
  for (const { feature_id, graph } of featureGraphs) {
    const coords = {};
    let x = 0, y = 0, n = 0;
    for (const { frame_id, heading } of groupedFeatures.get(feature_id)) {
      const ratio = graph[frame_id];
      const coord = navigate(ratio, (heading + 180) % 360);
      //frame2feature[frame_id][feature_id] = {ratio, heading};
      //if (!featureFrameNavigate.has(feature_id)) {
      //   featureFrameNavigate.set(feature_id, []);
      //}
      //featureFrameNavigate.push({})
      x += coord[0];
      y += coord[1];
      ++n;
    }
    // recenter on centroid
    const center = [x / n, y / n];
    for (const frame_id in coords) {
      coords[frame_id][0] -= center[0];
      coords[frame_id][1] -= center[1];
    }

    featureCoords[feature_id] = coords;
  }

  let numFrames = Object.keys(capture["frames"]).length;
  const coords = {};
  for (let i = 0; i < numFrames; ++i) {
    coords[i] = [0,0,0];
  }
  for (const {feature_id, graph} in featureCoords) {
    for (const {frame_id, graphCoords} in graph) {
      coords[frame_id][0] += graphCoords[0];
      coords[frame_id][1] += graphCoords[1];
      coords[frame_id][2]++;
    }
  }

  finalFrameCoords = {};
  for (let i = 0; i < numFrames; ++i) {
    finalFrameCoords[i] = [coords[i][0]/coords[i][2], coords[i][1]/coords[i][2]];
  }
   
  for (let i = 0; i < featureGraphs.length; ++i) {
    coords[i] = [0,0,0];
  }
  for (const { feature_id, graph } of featureGraphs) {

    for (const { frame_id, heading } of groupedFeatures.get(feature_id)) {
      const ratio = graph[frame_id];
      const vector = navigate(ratio, heading);
      coords[feature_id][0] += finalFrameCoords[frame_id][0]+vector[0]
      coords[feature_id][1] += finalFrameCoords[frame_id][1]+vector[1]
      coords[feature_id][2]++;
    }
  }

  finalFeatureCoords = {};
  for (let i = 0; i < featureGraphs.length; ++i) {
    finalFrameCoords[i] = [coords[i][0]/coords[i][2], coords[i][1]/coords[i][2]];
  }



  

  // // ratio of feature distance relative to average size (sum of all non-feature edges) of graph
  // // [feature_id] => { [frame_id] => ratio }
  // const featureDistanceRatios = {};
  // for (const { feature_id, graph } of featureGraphs) {
  //   // average edge length * ratio = feature distance
  //   let avgEdgeSize = 0;
  //   let n = 0;
  //   for (const edge in graph) {
  //     if (edge.includes(":")) {
  //       avgEdgeSizeRatio += graph[edge];
  //       ++n;
  //     }
  //   }
  //   avgEdgeSize /= n;
  //   for (const edge in graph) {
  //     if (!edge.includes(":")) {
  //       featureDistanceRatios[feature_id] ??= {};
  //       featureDistanceRatios[feature_id][edge] = graph[edge] / avgEdgeSize;
  //     }
  //   }
  // }

  // // average ratios between frames
  // const averageGraph = {};
  // for (const { graph } of featureGraphs) {
  //   for (let i = 0; i < Object.keys(capture["frames"]).length; ++i) {
  //     for (let j = i + 1; j < Object.keys(capture["frames"]).length; ++j) {
  //       const edge = `${i}:${j}`;
  //       averageGraph[edge] ??= [0, 0];
  //       if (graph[edge] !== undefined) {
  //         averageGraph[edge][0] += graph[edge];
  //         ++averageGraph[edge][1];
  //       }
  //     }
  //   }
  // }
  // // then recalculate distances to objects by AAS (sine rule) or using scales again?? then averaging endpoint of line to by angle/distance
  // // distance to feature as ratio relative to average size, then find centrepoint of navigating
  // // TODO: use initial frame/point as reference heading based on averaged headings etc
}
