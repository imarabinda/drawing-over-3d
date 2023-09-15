import { FabricJsLegacyDataType } from "./fabric.js/index.js";
import { PerfectFreehandDrawingDataType } from "./perfectFreehand/index.js";

export enum DrawingLibrariesEnum {
  fabric = "fabric",
  perfectFreehand = "perfectFreehand",
}
export type DrawingLibrariesType = EnumToPipes<DrawingLibrariesEnum, string>;

export enum DrawingCompressionLibrariesEnum {
  pako = "pako",
  none = "none",
}
export type DrawingCompressionLibrariesType = EnumToPipes<
  DrawingCompressionLibrariesEnum,
  string
>;

export type DrawingData<DrawingLibrary extends DrawingLibrariesType> =
  DrawingLibrary extends `${DrawingLibrariesEnum.fabric}`
    ? FabricJsLegacyDataType
    : DrawingLibrary extends `${DrawingLibrariesEnum.perfectFreehand}`
    ? PerfectFreehandDrawingDataType
    : null;

//utility types
export type CompressionFilter<
  DrawingLibrary extends DrawingLibrariesType,
  T extends DrawingCompressionLibrariesType
> = {
  [K in T]: {
    v: number;
    c: K;
    l: DrawingLibrary;
    d: K extends `${DrawingCompressionLibrariesEnum.none}`
      ? DrawingData<DrawingLibrary>
      : string;
  };
}[T];

export type LibrariesFilter<T extends DrawingLibrariesType> = {
  [K in T]: CompressionFilter<K, DrawingCompressionLibrariesType>;
}[T];

//final schema using dynamic data
export type DrawingSchema<
  T extends DrawingLibrariesType = DrawingLibrariesType
> = LibrariesFilter<T>;
const _a: DrawingSchema<"fabric"> = {
  l: "fabric",
  c: "pako",
  d: "a",
  v: 1.2,
};
