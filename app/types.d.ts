type FeatureId = number;
type FrameId = number;

interface Capture {
  frames: Record<number, Frame>;
  features: Record<FrameId, OsmTags>;
}

interface Frame {
  width: number;
  height: number;
  features: Record<FeatureId, Bbox>;
  metadata: Metadata;
}

interface Metadata {
  fov: [hfov: number, vfov: number];
  heading: number;
  latlon: [lat: number, lon: number];
  timestamp: number;
  [key: string]: unknown;
}

interface OsmTags {
  [key: string]: string;
}

type Bbox = [x: number, y: number, w: number, h: number];

interface Feature {
  id: number;
  tags: OsmTags;
  latlon: [lat: number, lon: number];
  [key: string]: unknown;
}
