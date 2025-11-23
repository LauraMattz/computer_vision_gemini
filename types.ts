export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  color?: string;
}

export interface AnalysisResult {
  objects: DetectedObject[];
  timestamp: number;
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
}

// Reduced to 50ms. Since the camera logic prevents overlapping requests,
// this effectively creates a "as fast as possible" loop without a fixed delay between calls.
export const SCAN_INTERVAL_MS = 50;