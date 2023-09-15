import {
  getStyleOptionsFromShape,
  getSvgPathFromStroke,
} from "@/helpers/drawing/perfectFreehand/perfectFreehand.helper";
import { mergeRefs } from "@/helpers/helpers";
import useWindowEvent from "@/lib/hooks/dom/useWindowEvent";
import { PerfectFreehandDrawShape } from "@/typescript/@types/modules/drawing/perfectFreehand";
import getStroke from "perfect-freehand";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

type CanvasRendererProps = {
  shapes: Record<string, PerfectFreehandDrawShape>;
};
const CanvasRenderer = forwardRef<HTMLCanvasElement, CanvasRendererProps>(
  function CanvasRenderer(props, ref) {
    const { shapes } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderCanvas = useCallback(() => {
      if (canvasRef?.current) {
        const ctx = canvasRef.current.getContext("2d");
        // Clear the canvas
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        Object.values(shapes)?.map((shape) => {
          const options = getStyleOptionsFromShape(shape);
          const stroke = getStroke(shape.points, options);
          const pathData = getSvgPathFromStroke(stroke);
          const path2d = new Path2D(pathData);
          ctx?.fill(path2d);
        });
      }
    }, [shapes]);

    useEffect(() => {
      renderCanvas();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shapes]);

    useWindowEvent("resize", () => {
      setTimeout(() => {
        renderCanvas();
      }, 0);
    });

    return <canvas ref={mergeRefs(canvasRef, ref)} />;
  }
);

export default memo(CanvasRenderer);
