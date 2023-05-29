class TestingRig {
  CAMERA_ID = 0;
  CAMERAS = [];
  FEATURE_ID = 0;
  FEATURES = [];

  constructor(elementOrId, onUpdate = (_capture) => {}) {
    this.ON_UPDATE = onUpdate;
    this.ROOT = typeof elementOrId == "string" ? document.getElementById(elementOrId) : elementOrId;
    this.ROOT.insertAdjacentHTML(
      "beforeend",
      `<fieldset>
        <legend>Testing Rig</legend>
        <button>📸 Add Camera 📸</button>
        <button>🪴 Add Feature 🪴</button>
        <button>🗑️ Clear All 🗑️</button>
        |
        <label>FOV:</label>
        <input type="number"/>
        <hr/>
        <div style="width: 600px; height: 400px;"></div>
      </fieldset>`
    );
    this.MAP = L.map(this.ROOT.querySelector("div"))
    .setView([0, 0], 7)//.setView([-33.8831, 151.2008], 20)
      .addLayer(L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxNativeZoom: 19, maxZoom: 21 },
      ));
    // Add Camera
    this.ROOT.querySelector("button:nth-of-type(1)").addEventListener("click", () => {
      this.addCamera(this.MAP.getCenter(), { fov: this.ROOT.querySelector("input").value || 69.4 });
      this.ON_UPDATE(this.createCapture());
    });
    // Add Feature
    this.ROOT.querySelector("button:nth-of-type(2)").addEventListener("click", () => {
      this.addFeature(this.MAP.getCenter());
      this.ON_UPDATE(this.createCapture());
    });
    // Clear All
    this.ROOT.querySelector("button:nth-of-type(3)").addEventListener("click", () => {
      this.clear();
    });
    // Initial Event
    this.ON_UPDATE(this.createCapture());
  }

  wgs84Inverse({from, to}) {
    const result = geodesic.Geodesic.WGS84.Inverse(
      from.lat, from.lng,
      to.lat, to.lng
    );
    return {
      bearing: (result.azi1 + 360) % 360,
      distance: result.s12,
    };
  }

  wgs84Navigate({from, heading, distance}) {
    const result = geodesic.Geodesic.WGS84.Direct(
      from.lat, from.lng,
      (heading - 360) % 360,
      distance
    );
    return L.latLng([result.lat2, result.lon2]);
  }

  fovBounds({from, heading, fov, distance}) {
    // console.log(heading + fov / 2, distance)
    const pRight = this.wgs84Navigate({from, heading: heading + fov / 2, distance});
    const pLeft = this.wgs84Navigate({from, heading: heading - fov / 2, distance});
    return [from, pRight, pLeft];
  }

  addCamera(coords, { fov = 39.6, heading = 0 } = {}) {
    const distance = 4;
    const latlng = L.latLng(coords);
    const marker = L.marker(latlng, { riseOnHover: true, draggable: true });
    const node = L.marker(
      this.wgs84Navigate({ from: latlng, heading, distance }),
      {
        draggable: true,
        icon: L.icon({
          iconSize: [20, 20],
          iconUrl: `data:image/svg+xml,${encodeURIComponent(
            `<svg viewBox="-1.5 -1.5 3 3" xmlns="http://www.w3.org/2000/svg">
              <circle r="1" fill="#fffa" stroke="#000" stroke-width="0.5"/>
            </svg>`
          )}`,
        }),
      },
    );
    const area = L.polygon(this.fovBounds({ from: latlng, fov, heading, distance: distance / Math.cos((fov * Math.PI / 180) / 2) }));
    const group = L.layerGroup([
      area,
      node,
      marker,
    ]);
    this.MAP.on("zoom", () => {
      if (this.MAP.getZoom() < 17) { node.remove() }
      else { node.addTo(group); }
    });
    const updateEditNode = (ev) => {
      this.ON_UPDATE(this.createCapture());
      heading = this.wgs84Inverse({ from: marker.getLatLng(), to: ev.latlng }).bearing;
      node.setLatLng(this.wgs84Navigate({ from: marker.getLatLng(), heading, distance }));
      area.setLatLngs(this.fovBounds({ from: marker.getLatLng(), fov, heading, distance: distance / Math.cos((fov * Math.PI / 180) / 2) }));
    };
    node.on("drag", updateEditNode);
    marker.on("drag", ev => {
      this.ON_UPDATE(this.createCapture());
      node.setLatLng(this.wgs84Navigate({ from: ev.latlng, heading, distance }));
      area.setLatLngs(this.fovBounds({ from: ev.latlng, fov, heading, distance: distance / Math.cos((fov * Math.PI / 180) / 2) }));
    });
    marker.bindPopup(() => {
      const close = document.createElement("button");
      close.innerText = "Remove";
      close.addEventListener("click", () => group.remove());
      return close;
    });
    marker.bindTooltip(`id:${this.CAMERA_ID}`);
    group.addTo(this.MAP);
    const camera = {
      id: this.CAMERA_ID++,
      fov,
      getLatLon: () => marker.getLatLng(),
      getHeading: () => heading,
      _layer: group,
    };
    this.CAMERAS.push(camera);
    this.ON_UPDATE(this.createCapture());
    return camera;
  }

  addFeature(coords, { tags = {} } = {}) {
    const latlng = L.latLng(coords);
    const marker = L.marker(latlng, { draggable: true, riseOnHover: true, icon: new L.Icon.Default({ className: "obj" }) }).addTo(this.MAP);
    marker.on("drag", () => {
      this.ON_UPDATE(this.createCapture());
    });
    marker.bindTooltip(`id:${this.FEATURE_ID} | ${JSON.stringify(tags)}`);
    marker.bindPopup(() => {
      const close = document.createElement("button");
      close.innerText = "Remove";
      close.addEventListener("click", () => marker.remove());
      return close;
    });
    const feature = {
      id: this.FEATURE_ID++,
      getLatLon: () => marker.getLatLng(),
      tags,
      _layer: marker,
    };
    this.FEATURES.push(feature);
    this.ON_UPDATE(this.createCapture());
    return feature;
  }

  createCapture() {
    const fieldDataCapture = { "frames": {}, "features": {} };

    // calculate min/max distance to features (for largest/smallest bbox)
    let maxDistance = -Infinity;
    let minDistance = Infinity;
    for (const camera of this.CAMERAS) {
      for (const feature of this.FEATURES) {
        const { distance } = this.wgs84Inverse({ from: camera.getLatLon(), to: feature.getLatLon() });
        if (distance > maxDistance) maxDistance = distance;
        if (distance < minDistance) minDistance = distance;
      }
    }

    // calculate bboxes, etc
    for (const camera of this.CAMERAS) {
      fieldDataCapture["frames"][camera.id] = {
        "width": 3000,
        "height": 2000,
        "features": {},
        "metadata": {
          fov: [camera.fov, 2/3 * camera.fov],
          heading: camera.getHeading(),
          latlon: [camera.getLatLon().lat, camera.getLatLon().lng],
        },
      };
      for (const feature of this.FEATURES) {
        const { distance, bearing: featureBearing } = this.wgs84Inverse({ from: camera.getLatLon(), to: feature.getLatLon() });
        // Check if feature in-view
        if (Math.abs(camera.getHeading() - featureBearing) < camera.fov / 2) {
          const width = 1400 * (distance - minDistance) / (maxDistance - minDistance) + 400;
          const height = 1400 * (distance - minDistance) / (maxDistance - minDistance) + 400;
          fieldDataCapture["frames"][camera.id]["features"][feature.id] = [
            1500 * (featureBearing - camera.getHeading()) + 1500 - width / 2,
            1000 - height / 2,
            width,
            height,
          ];
        }
      }
    }

    for (const feature of this.FEATURES) {
      fieldDataCapture["features"][feature.id] = feature.tags;
    }

    return fieldDataCapture;
  }

  clear() {
    this.FEATURE_ID = 0;
    for (const f of this.FEATURES) {
      f._layer.remove();
    }
    this.CAMERA_ID = 0;
    for (const c of this.CAMERAS) {
      c._layer.remove();
    }
  }
}