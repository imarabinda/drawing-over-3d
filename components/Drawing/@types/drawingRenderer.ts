import {
  PerfectFreehandDrawShape,
  PerfectFreehandDrawStyles,
  PerfectFreehandDrawingDataType,
} from "@/typescript/@types/modules/drawing/perfectFreehand";

export enum DrawingRenderingMethodEnum {
  canvas = "canvas",
  svg = "svg",
}
export type DrawingRenderingMethodType = EnumToPipes<
  DrawingRenderingMethodEnum,
  string
>;

export type DrawingAppStateType = {
  status: "idle" | "drawing" | "erasing" | "pinching";
  tool: "drawing" | "erasing" | null;
  editingId?: string | null;
  style: PerfectFreehandDrawStyles;
};
export enum DrawingRendererEventsEnum {
  shapeCreated = "shape:created",
  shapesUpdated = "shapes:updated",
  shapeUpdated = "shape:updated",
  shapeRemoved = "shape:removed",
  toolChanged = "tool:changed",
  statusChanged = "status:changed",
  init = "init",
}

export type DrawingRendererEventsType = EnumToPipes<
  DrawingRendererEventsEnum,
  string
>;

export type DrawingRendererEventData<
  T extends DrawingRendererEventsType,
  RenderMethod extends Undefinable<DrawingRenderingMethodType>
> = T extends `${DrawingRendererEventsEnum.init}`
  ? DrawingRendererOnInitInstance<RenderMethod>
  : T extends `${DrawingRendererEventsEnum.shapeCreated}`
  ? PerfectFreehandDrawShape
  : T extends `${DrawingRendererEventsEnum.shapeRemoved}`
  ? PerfectFreehandDrawShape
  : T extends `${DrawingRendererEventsEnum.shapeUpdated}`
  ? PerfectFreehandDrawShape
  : T extends `${DrawingRendererEventsEnum.statusChanged}`
  ? DrawingAppStateType["status"]
  : T extends `${DrawingRendererEventsEnum.toolChanged}`
  ? DrawingAppStateType["tool"]
  : T extends `${DrawingRendererEventsEnum.shapesUpdated}`
  ? Record<string, PerfectFreehandDrawShape>
  : never;

export type RenderContainerElementType<
  RenderMethod extends Undefinable<DrawingRenderingMethodType> = undefined
> = Nullable<
  RenderMethod extends `${DrawingRenderingMethodEnum.canvas}`
    ? HTMLCanvasElement
    : RenderMethod extends `${DrawingRenderingMethodEnum.svg}`
    ? SVGSVGElement
    : null
>;
export type DrawingRendererOnInitInstance<
  RenderMethod extends Undefinable<DrawingRenderingMethodType>
> = {
  subscribe: <T extends DrawingRendererEventsType>(
    event: T,
    callback: (data: DrawingRendererEventData<T, RenderMethod>) => void
  ) => void;
  generateData: () => PerfectFreehandDrawingDataType;
  unsubscribe: <T extends DrawingRendererEventsType>(
    event: T,
    callback: (data: DrawingRendererEventData<T, RenderMethod>) => void
  ) => void;
  getShapes: <T extends string | undefined = undefined>(
    id?: T
  ) => T extends string
    ? PerfectFreehandDrawShape
    : Record<string, PerfectFreehandDrawShape>;
  getState: () => DrawingAppStateType;
  getShape: (id: string) => PerfectFreehandDrawShape;
  updateStyling: (style: Partial<PerfectFreehandDrawStyles>) => void;
  updateRendererState: (state: Partial<DrawingAppStateType>) => void;
  updateShape: (shape: PerfectFreehandDrawShape) => void;
  removeShape: (id: string) => void;
  updateShapes: (shapes: Record<string, PerfectFreehandDrawShape>) => void;
  changeTool: (tool: DrawingAppStateType["tool"]) => void;
  getContainer: () => HTMLDivElement | null;
  getRendererContainer: () => RenderContainerElementType<RenderMethod>;
};
