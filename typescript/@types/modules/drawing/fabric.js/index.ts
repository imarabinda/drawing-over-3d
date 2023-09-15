export type FabricJsSingleObject = {
  type: string;
  version: string;
  originX: string;
  originY: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill: any;
  stroke: string;
  strokeWidth: number;
  strokeDashArray: any;
  strokeLineCap: string;
  strokeDashOffset: number;
  strokeLineJoin: string;
  strokeUniform: boolean;
  strokeMiterLimit: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  shadow: any;
  visible: boolean;
  backgroundColor: string;
  fillRule: string;
  paintFirst: string;
  globalCompositeOperation: string;
  skewX: number;
  skewY: number;
  path: any[][];
};
export type FabricJsLegacyDataType = {
  version: string;
  objects: FabricJsSingleObject[];
};