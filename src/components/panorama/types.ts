export interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  targetPanorama: string;
  title: string;
  description?: string;
}

export interface Panorama {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}