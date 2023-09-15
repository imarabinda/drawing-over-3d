export type Easing =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo";

export interface PerfectFreehandDrawStyles {
  size: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  easing: Easing;
  thinning: number;
  streamline: number;
  smoothing: number;
  taperStart: number | boolean;
  taperEnd: number | boolean;
  capStart: boolean;
  capEnd: boolean;
  easingStart: Easing;
  easingEnd: Easing;
  isFilled: boolean;
}

//imported from @tldraw/core
export interface TLShape {
  id: string;
  type: string;
  parentId: string;
  childIndex: number;
  name: string;
  point: number[];
  rotation?: number;
  children?: string[];
  isGhost?: boolean;
  isHidden?: boolean;
  isLocked?: boolean;
  isGenerated?: boolean;
  isAspectRatioLocked?: boolean;
}
export interface PerfectFreehandDrawShape extends TLShape {
  type: "drawing";
  points: number[][];
  style: PerfectFreehandDrawStyles;
  isDone: boolean;
}
export type PerfectFreehandDrawingDataType = {
  shapes: Record<string, PerfectFreehandDrawShape>;
  viewport?: {
    boundingInfo?: DOMRect;
    scale: number;
  };
};
