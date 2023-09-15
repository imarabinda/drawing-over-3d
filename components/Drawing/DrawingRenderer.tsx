import {
  getDefaultShape,
  getDefaultStyle,
} from "@/helpers/drawing/perfectFreehand/perfectFreehand.helper";
import useLatestRef from "@/lib/hooks/useLatestRef";
import {
  PerfectFreehandDrawShape,
  PerfectFreehandDrawStyles,
} from "@/typescript/@types/modules/drawing/perfectFreehand";
import { Box, BoxProps, styled } from "@mui/material";
import deepmerge from "deepmerge";
import uniqueId from "lodash/uniqueId";
import {
  ForwardedRef,
  MutableRefObject,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DrawingAppStateType,
  DrawingRendererEventData,
  DrawingRendererEventsEnum,
  DrawingRendererEventsType,
  DrawingRendererOnInitInstance,
  DrawingRenderingMethodEnum,
  DrawingRenderingMethodType,
  RenderContainerElementType,
} from "./@types/drawingRenderer";
import EventEmitter from "eventemitter3";
import debounce from "lodash/debounce";
import SVGRenderer from "./RenderMethods/SVG/SVGRenderer";
import CanvasRenderer from "./RenderMethods/Canvas/CanvasRenderer";
import { mergeRefs } from "@/helpers/helpers";

const StyledBox = styled(Box)`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  svg {
    height: 100%;
    width: 100%;
  }
`;
type DrawingRendererProps<RenderMethod extends DrawingRenderingMethodType> =
  Omit<BoxProps, "ref"> & {
    defaultTool?: DrawingAppStateType["tool"];
    scaleRef?: MutableRefObject<number>;
    onInit?: React.ForwardedRef<DrawingRendererOnInitInstance<RenderMethod>>;
    renderMethod?: RenderMethod;
  };
const DrawingRenderer = forwardRef(function DrawingRenderer<
  RenderMethod extends DrawingRenderingMethodType
>(
  props: DrawingRendererProps<RenderMethod>,
  ref: Nullable<ForwardedRef<HTMLDivElement>>
) {
  const { onInit, defaultTool, scaleRef, renderMethod, ...boxProps } = props;
  const eventEmitterRef = useRef(new EventEmitter());
  const rendererRef = useRef<RenderContainerElementType<RenderMethod>>(null);

  const containerRef = useRef<Nullable<HTMLDivElement>>(null);
  const currentStrokeRef = useRef({
    startTime: 0,
  });

  const [shapes, setShapes] = useState<
    Record<string, PerfectFreehandDrawShape>
  >({});

  //event emitter
  const subscribe = useCallback(
    <T extends DrawingRendererEventsType>(
      event: T,
      callback: (data: DrawingRendererEventData<T, RenderMethod>) => void
    ) => {
      eventEmitterRef.current.on(event, callback);
    },
    []
  );
  const unsubscribe = useCallback(
    <T extends DrawingRendererEventsType>(
      event: T,
      callback: (data: DrawingRendererEventData<T, RenderMethod>) => void
    ) => {
      eventEmitterRef.current.off(event, callback);
    },
    []
  );

  const [rendererState, setRendererState] = useState<DrawingAppStateType>({
    status: "idle",
    tool: typeof defaultTool === "undefined" ? null : defaultTool,
    editingId: null,
    style: getDefaultStyle(),
  });

  const updateRendererStateCallbackRef = useLatestRef(
    (state: DeepPartial<DrawingAppStateType>) => {
      setRendererState((prevState) =>
        deepmerge<DrawingAppStateType, DeepPartial<DrawingAppStateType>>(
          prevState,
          state
        )
      );
    }
  );

  const updateShapeObj = useLatestRef((shape: PerfectFreehandDrawShape) => {
    setShapes((prevShapes) => {
      if (prevShapes[shape.id]) {
        eventEmitterRef.current.emit(
          DrawingRendererEventsEnum.shapeUpdated,
          shape
        );
      } else {
        eventEmitterRef.current.emit(
          DrawingRendererEventsEnum.shapeCreated,
          shape
        );
      }
      prevShapes[shape.id] = shape;
      const newShapes = { ...prevShapes };
      eventEmitterRef.current.emit(
        DrawingRendererEventsEnum.shapeUpdated,
        shape
      );
      return newShapes;
    });
  });
  const getState = useLatestRef(() => {
    return rendererState;
  });

  const getShapes = useLatestRef(
    <T extends string | undefined = undefined>(
      id?: T
    ): T extends string ? PerfectFreehandDrawShape : typeof shapes => {
      if (typeof id === "string") {
        return shapes?.[id] as T extends string
          ? PerfectFreehandDrawShape
          : typeof shapes;
      }
      return shapes as T extends string
        ? PerfectFreehandDrawShape
        : typeof shapes;
    }
  );

  const removeShapeCallbackRef = useLatestRef((id: string) => {
    const shape = shapes[id];
    if (shape) {
      eventEmitterRef.current.emit(
        DrawingRendererEventsEnum.shapeRemoved,
        shape
      );
      delete shapes[id];
      instanceRef.current.updateShapes({ ...shapes });
    }
  });

  const debouncedUpdateShapes = useRef(
    debounce((shapes) => {
      setShapes(shapes);
    }, 50)
  );

  const instanceRef = useRef<DrawingRendererOnInitInstance<RenderMethod>>({
    subscribe,
    unsubscribe,
    generateData: () => {
      return {
        shapes: getShapes?.current(),
        viewport: {
          boundingInfo: containerRef?.current?.getBoundingClientRect(),
          scale: scaleRef?.current || 1,
        },
      };
    },
    getRendererContainer: () => {
      return rendererRef?.current;
    },
    getContainer: () => {
      return containerRef?.current;
    },
    getShapes: <T extends string | undefined = undefined>(id?: T) => {
      return getShapes?.current(id);
    },
    getShape: (id: string) => {
      return getShapes?.current(id);
    },
    getState: () => {
      return getState.current();
    },
    updateStyling: (style: Partial<PerfectFreehandDrawStyles>) => {
      console.log("updating drawing board styles", style);
      return updateRendererStateCallbackRef.current({ style });
    },
    updateRendererState: (state: Partial<DrawingAppStateType>) => {
      console.log("updating drawing board state", state);
      return updateRendererStateCallbackRef.current(state);
    },
    updateShape: (shape: PerfectFreehandDrawShape) => {
      return updateShapeObj.current(shape);
    },
    removeShape: (id: string) => {
      return removeShapeCallbackRef.current(id);
    },
    updateShapes: (shapes: Record<string, PerfectFreehandDrawShape>) => {
      debouncedUpdateShapes.current(shapes);
    },
    changeTool: (tool: DrawingAppStateType["tool"]) => {
      console.log("changing tool to", tool);
      return updateRendererStateCallbackRef.current({ tool });
    },
  });

  const getRelativeCoordinates = useCallback(
    (event: PointerEvent | React.PointerEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      let x = 0;
      let y = 0;
      const scale = scaleRef?.current || 1;
      if (containerRect) {
        // Calculate the maximum x and y values within the container
        const maxX = containerRect.width / scale;
        const maxY = containerRect.height / scale;

        const clientX = event.clientX;
        const clientY = event.clientY;
        x = (clientX - containerRect.left) / scale;
        y = (clientY - containerRect.top) / scale;

        // Update x and y if they go beyond the container boundaries
        x = Math.min(maxX, Math.max(0, x));
        y = Math.min(maxY, Math.max(0, y));
      }
      return { x, y };
    },
    [scaleRef]
  );

  const createDrawingShape = useCallback(
    (point: number[], pressure: number) => {
      const shape = getDefaultShape({
        id: uniqueId(`niimblr-shape-${Date.now()}-`),
        style: rendererState.style,
        points: [[...point, pressure, 0]],
        isDone: false,
      });
      currentStrokeRef.current.startTime = Date.now();
      instanceRef.current.updateShape(shape);
      instanceRef.current.updateRendererState({
        editingId: shape.id,
        status: "drawing",
      });
    },
    [rendererState.style]
  );

  const updateShapePoints = useCallback(
    (point: number[], pressure: number) => {
      if (rendererState.status !== "drawing") return;
      if (!rendererState.editingId) return;

      const shape = instanceRef.current.getShape(rendererState.editingId);
      if (!shape) {
        return undefined;
      }
      const newPoint = [
        ...point,
        pressure,
        Date.now() - currentStrokeRef.current.startTime,
      ];

      // Does the new point create a negative offset?
      const shapePoints = [...shape.points, newPoint];

      return {
        ...shape,
        points: shapePoints,
      };
    },
    [rendererState.editingId, rendererState.status]
  );
  const completeDrawingShape = useCallback(() => {
    if (!rendererState.editingId) return; // Don't erase while drawing

    let shape = instanceRef.current.getShape(rendererState.editingId);
    if (!shape) {
      return;
    }
    shape.isDone = true;

    shape = {
      ...shape,
    };

    instanceRef.current.updateShape(shape);
    instanceRef.current.updateRendererState({
      status: "idle",
      editingId: null,
    });
  }, [rendererState.editingId]);

  const onPointerMoveCallbackRef = useLatestRef((event: PointerEvent) => {
    if (event.buttons > 1) return;
    const { status, tool } = rendererState;
    const { x, y } = getRelativeCoordinates(event);
    switch (tool) {
      case "drawing": {
        if (status === "drawing") {
          const nextShape = updateShapePoints([x, y], event.pressure);
          if (nextShape) {
            //update shape
            instanceRef.current.updateShape(nextShape);
          }
        }
        break;
      }
      case "erasing": {
        if (status === "erasing") {
          //   erase(info.point);
        }
        break;
      }
    }
  });

  const onPointerMove = useCallback((e: PointerEvent) => {
    onPointerMoveCallbackRef.current(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerUpCallbackRef = useLatestRef(() => {
    const { tool } = rendererState;
    switch (tool) {
      case "drawing": {
        completeDrawingShape();
        document.removeEventListener("pointermove", onPointerMove);
        break;
      }
      case "erasing": {
        //do erasing
        break;
      }
    }
  });
  const onPointerUp = useCallback(() => {
    onPointerUpCallbackRef?.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      const { x, y } = getRelativeCoordinates(event);
      const { tool } = rendererState;
      switch (tool) {
        case "drawing": {
          createDrawingShape([x, y], event.pressure);
          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
          break;
        }
        case "erasing": {
          //do erase code
          break;
        }
      }
    },
    [
      createDrawingShape,
      rendererState,
      getRelativeCoordinates,
      onPointerMove,
      onPointerUp,
    ]
  );

  useEffect(() => {
    eventEmitterRef.current.emit(
      DrawingRendererEventsEnum.statusChanged,
      rendererState?.status
    );
  }, [rendererState?.status]);

  useEffect(() => {
    eventEmitterRef.current.emit(
      DrawingRendererEventsEnum.toolChanged,
      rendererState?.tool
    );
  }, [rendererState?.tool]);

  useEffect(() => {
    if (typeof onInit !== "undefined") {
      mergeRefs(onInit)(instanceRef.current);
      eventEmitterRef.current.emit(
        DrawingRendererEventsEnum.init,
        instanceRef.current
      );
    }
  }, []);

  return (
    <StyledBox
      ref={mergeRefs(ref, containerRef)}
      {...boxProps}
      onPointerDown={onPointerDown}
    >
      {renderMethod === DrawingRenderingMethodEnum.svg ? (
        <SVGRenderer
          shapes={shapes}
          ref={
            rendererRef as MutableRefObject<
              RenderContainerElementType<DrawingRenderingMethodEnum.svg>
            >
          }
        />
      ) : null}
      {renderMethod === DrawingRenderingMethodEnum.canvas ? (
        <CanvasRenderer
          ref={
            rendererRef as MutableRefObject<
              RenderContainerElementType<DrawingRenderingMethodEnum.canvas>
            >
          }
          shapes={shapes}
        />
      ) : null}
    </StyledBox>
  );
});
export default DrawingRenderer;
