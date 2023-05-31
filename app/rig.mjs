//@ts-check

import * as L from "../lib/leaflet-src.esm.js";
import { wgs84Inverse, wgs84Navigate, turnBetween } from "./util.mjs";

export class Frame {
  /** @type {{remove(): void} | null} */
  _layer = null

  /**
   *
   * @param {{
   *  width: number,
   *  height: number,
   *  fov: { h: number, v: number},
   *  heading: number,
   *  coords: import("./util.mjs").Coords
   * }} state
   */
  constructor(state) {
    this.state = state;
  }

  /**
   *
   * @param {Feature} feature
   */
  navigateToward(feature) {
    const { bearing, distance } = wgs84Inverse({
      from: this.state.coords,
      to: feature.coords
    });
    const turn = turnBetween({
      from: this.state.heading,
      to: bearing,
    });
    return {
      visible: Math.abs(turn) < this.state.fov.h / 2,
      bearing,
      turn,
      distance,
    };
  }
}

export class Feature {
  /** @type {{remove(): void} | null} */
  _layer = null
  coords = { lat: 0, lon: 0 }
  tags = {}
  /**
   *
   * @param {import("./util.mjs").Coords} coords
   * @param {Record<string,string>} tags
   */
  constructor(coords, tags = {}) {
    this.coords = coords;
    this.tags = tags;
  }

  /**
   * @returns {Map<Frame, import("./util.mjs").Bbox>}
   * @param {Frame[]} allFrames
   */
  findSelf(allFrames) {
    /** @type {Map<Frame, import("./util.mjs").Bbox>} */
    const bboxes = new Map();
    let minDistance = Infinity;
    let maxDistance = -Infinity;
    /** @type {{ frame: Frame, distance: number, turn: number }[]} */
    const seenFromFrames = [];
    for (const frame of allFrames) {
      const { visible, distance, turn } = frame.navigateToward(this);
      if (visible) {
        if (distance < minDistance) minDistance = distance;
        if (distance > maxDistance) maxDistance = distance;
        seenFromFrames.push({ frame, distance, turn });
      }
    }
    for (const { frame, distance, turn } of seenFromFrames) {
      /** 0.75 -> 0 at ifty */
      const relativeSize = 0.75 * (minDistance / (distance + 0.0001));
      const minDimension = Math.min(frame.state.width, frame.state.height);
      const bboxSize = relativeSize * minDimension;
      const destX = frame.state.width * (turn / frame.state.fov.h + 0.5);
      bboxes.set(
        frame,
        {
          x: destX - bboxSize / 2,
          y: frame.state.height / 2 - bboxSize / 2,
          w: bboxSize,
          h: bboxSize
        }
      );
    }
    return bboxes;
  }
}

export class CaptureRig {
  haveMoved = true;
  /** @type {Frame[]} */
  FRAMES = [];
  /** @type {Feature[]} */
  FEATURES = [];
  /**
   *
   * @param {HTMLElement | string} elementOrId
   * @param {*} onUpdate
   */
  constructor(elementOrId, onUpdate = (_capture) => {}) {
    this.ON_UPDATE = onUpdate;
    this.ROOT = typeof elementOrId == "string" ? document.getElementById(elementOrId) : elementOrId;
    if (this.ROOT === null) throw new Error(`No such element with id #${elementOrId}`);
    this.ROOT?.insertAdjacentHTML(
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
    .setView([-33.8831, 151.2008], 20)
      .addLayer(L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxNativeZoom: 19, maxZoom: 21 },
      ));
    // Add Camera
    this.ROOT.querySelector("button:nth-of-type(1)")?.addEventListener("click", () => {
      if (!this.haveMoved) return;
      this.haveMoved = false;
      const center = this.MAP.getCenter();
      this.addCamera({ lat: center.lat, lon: center.lng }, { fov: Number(this.ROOT.querySelector("input")?.value) || 69.4, heading: 0 });
      // this.ON_UPDATE(this.createCapture());
    });
    // Add Feature
    this.ROOT.querySelector("button:nth-of-type(2)")?.addEventListener("click", () => {
      const center = this.MAP.getCenter();
      this.addFeature({ lat: center.lat, lon: center.lng });
      // this.ON_UPDATE(this.createCapture());
    });
    // Clear All
    this.ROOT.querySelector("button:nth-of-type(3)")?.addEventListener("click", () => {
      this.clear();
    });
    // Initial Event
    this.ON_UPDATE(this.createCapture());
  }

  fovBounds({from, heading, fov, distance}) {
    // console.log(heading + fov / 2, distance)
    const pRight = wgs84Navigate({from, heading: heading + fov / 2, distance});
    const pLeft = wgs84Navigate({from, heading: heading - fov / 2, distance});
    return [
      from,
      L.latLng([pRight.lat, pRight.lon]),
      L.latLng([pLeft.lat, pLeft.lon]),
    ];
  }

  /**
   *
   * @param {import("./util.mjs").Coords} coords
   * @param {{fov: number, heading: number}} param1
   * @returns
   */
  addCamera(coords, { fov, heading }) {
    fov ??= 69.4;
    heading ??= 0;

    const distance = 4;
    const marker = L.marker(L.latLng([coords.lat, coords.lon]), { riseOnHover: true, draggable: true });
    const nodeCoords = wgs84Navigate({ from: coords, heading, distance : distance });
    const node = L.marker(
      [nodeCoords.lat, nodeCoords.lon],
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
    const area = L.polygon(this.fovBounds({ from: coords, fov, heading, distance: distance / Math.cos((fov * Math.PI / 180) / 2) }));
    const group = L.layerGroup([
      area,
      node,
      marker,
    ]);

    const camera = new Frame({
      width: 3000,
      height: 2000,
      fov: { h: fov, v: 2/3 * fov},
      heading: heading,
      coords,
    });

    this.MAP.on("zoom", () => {
      if (this.MAP.getZoom() < 17) { node.remove() }
      else { node.addTo(group); }
    });

    const updateEditNode = (ev) => {
      this.ON_UPDATE(this.createCapture());
      const markerPos = marker.getLatLng();
      const from = { lat: markerPos.lat, lon: markerPos.lng };
      const to = { lat: ev.latlng.lat, lon: ev.latlng.lng };
      camera.state.heading = wgs84Inverse({ from, to }).bearing;
      const newPos = wgs84Navigate({ from, heading: camera.state.heading, distance });
      node.setLatLng([newPos.lat, newPos.lon]);
      area.setLatLngs(this.fovBounds({ from, fov: camera.state.fov.h, heading: camera.state.heading, distance: distance / Math.cos((camera.state.fov.h * Math.PI / 180) / 2) }));
    };
    node.on("drag", updateEditNode);
    marker.on("drag", ev => {
      this.haveMoved = true;
      this.ON_UPDATE(this.createCapture());
      const from = { lat: ev.latlng.lat, lon: ev.latlng.lng };
      const newPos = wgs84Navigate({ from, heading: camera.state.heading, distance });
      node.setLatLng([newPos.lat, newPos.lon]);
      area.setLatLngs(this.fovBounds({ from, fov: camera.state.fov.h, heading: camera.state.heading, distance: distance / Math.cos((camera.state.fov.h * Math.PI / 180) / 2) }));
      camera.state.coords = from;
    });
    marker.bindPopup(() => {
      const close = document.createElement("button");
      close.innerText = "Remove";
      close.addEventListener("click", () => {
        group.remove();
        this.FRAMES = this.FRAMES.filter(v => v === camera);
      });
      return close;
    });
    marker.bindTooltip(`id:${this.FRAMES.length}`);
    group.addTo(this.MAP);
    camera._layer = group;

    this.FRAMES.push(camera);
    this.ON_UPDATE(this.createCapture());
    return camera;
  }

  /**
   *
   * @param {import("./util.mjs").Coords} coords
   * @param {Record<string,string>} tags
   * @returns
   */
  addFeature(coords, tags = {}) {
    const feature = new Feature(coords, tags);

    const latlng = L.latLng([coords.lat, coords.lon]);
    // @ts-expect-error (leaflet default icon)
    const marker = L.marker(latlng, { draggable: true, riseOnHover: true, icon: new L.Icon.Default({ className: "obj" }) }).addTo(this.MAP);
    marker.on("drag", ev =>  {
      this.ON_UPDATE(this.createCapture());
      feature.coords = { lat: ev.latlng.lat, lon: ev.latlng.lng };
    });
    marker.bindTooltip(`id:${this.FEATURES.length} | ${JSON.stringify(tags)}`);
    marker.bindPopup(() => {
      const close = document.createElement("button");
      close.innerText = "Remove";
      close.addEventListener("click", () => {
        marker.remove();
        this.FEATURES = this.FEATURES.filter(v => v === feature);
      });
      return close;
    });
    feature._layer = marker;

    this.FEATURES.push(feature);
    this.ON_UPDATE(this.createCapture());
    return feature;
  }

  createCapture() {
    const fieldDataCapture = { "frames": {}, "features": {} };
    const featureIds = new Map(this.FEATURES.map((v, i) => [v, i]));

    // Fill-in frame data
    for (let frameId = 0; frameId < this.FRAMES.length; ++frameId) {
      fieldDataCapture.frames[frameId] = {
        ...this.FRAMES[frameId].state,
        features: {},
      };
    }

    // calculate bboxes
    for (let featureId = 0; featureId < this.FEATURES.length; ++featureId) {
      const feature = this.FEATURES[featureId];
      for (const [frame, bbox] of feature.findSelf(this.FRAMES)) {
        fieldDataCapture.frames[this.FRAMES.indexOf(frame)].features[featureId] = bbox;
      }
    }

    for (const feature of this.FEATURES) {
      fieldDataCapture["features"][featureIds.get(feature)] = feature.tags;
    }

    return fieldDataCapture;
  }

  clear() {
    for (const f of this.FEATURES) {
      f._layer?.remove();
    }
    this.FEATURES = [];
    for (const c of this.FRAMES) {
      c._layer?.remove();
    }
    this.FRAMES = [];
    this.ON_UPDATE(this.createCapture());
  }
}
