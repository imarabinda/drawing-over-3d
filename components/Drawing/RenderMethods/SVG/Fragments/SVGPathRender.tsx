import {
  getStyleOptionsFromShape,
  getSvgPathFromStroke,
} from "@/helpers/drawing/perfectFreehand/perfectFreehand.helper";
import { WeakMapCache } from "@/lib/services/WeakMapCache";
import { PerfectFreehandDrawShape } from "@/typescript/@types/modules/drawing/perfectFreehand";
import { Fade } from "@mui/material";
import getStroke from "perfect-freehand";
import { memo, useMemo, useRef } from "react";
import isEqual from "react-fast-compare";

type SVGPathRenderProps = {
  shape: PerfectFreehandDrawShape;
};
function SVGPathRender(props: SVGPathRenderProps) {
  const { shape } = props;

  const shapeStrokeCacheRef = useRef(
    new WeakMapCache<PerfectFreehandDrawShape, number[][]>()
  );
  const pathDataCacheRef = useRef(
    new WeakMapCache<PerfectFreehandDrawShape, string>()
  );

  const {
    style: { strokeWidth, stroke, fill, isFilled },
  } = shape;

  const outlinePoints = useMemo(() => {
    return shapeStrokeCacheRef.current.get(shape, () =>
      getStroke(shape.points, getStyleOptionsFromShape(shape))
    );
  }, [shape]);

  const drawPathData = useMemo(() => {
    return pathDataCacheRef.current.get(shape, () =>
      getSvgPathFromStroke(outlinePoints)
    );
  }, [outlinePoints, shape]);

  return (
    <Fade in={Boolean(shape)} timeout={600}>
      <g key={shape?.id}>
        {strokeWidth ? (
          <path
            d={drawPathData}
            id={"path_stroke_" + shape.id}
            fill={"transparent"}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents="all"
          />
        ) : null}
        {
          <path
            id={"path_" + shape.id}
            d={drawPathData}
            fill={isFilled ? fill : "transparent"}
            stroke={isFilled || strokeWidth > 0 ? "transparent" : "black"}
            strokeWidth={isFilled || strokeWidth > 0 ? 0 : 1}
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents="all"
          />
        }
      </g>
    </Fade>
  );
}
export default memo(SVGPathRender, isEqual);
