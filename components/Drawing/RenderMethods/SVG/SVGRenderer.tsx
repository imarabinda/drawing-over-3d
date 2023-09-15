import { PerfectFreehandDrawShape } from "@/typescript/@types/modules/drawing/perfectFreehand";
import SVGPathRender from "./Fragments/SVGPathRender";
import { forwardRef, memo, useMemo } from "react";
import isEqual from "react-fast-compare";

type SVGRendererProps = {
  shapes: Record<string, PerfectFreehandDrawShape>;
};

const SVGRenderer = forwardRef<SVGSVGElement, SVGRendererProps>(
  function SVGRenderer({ shapes }, ref) {
    const shapesRenderer = useMemo(() => {
      return Object.values(shapes)?.map((shape) => {
        return <SVGPathRender shape={shape} key={shape?.id} />;
      });
    }, [shapes]);
    return <svg ref={ref}>{shapesRenderer}</svg>;
  }
);

export default memo(SVGRenderer, isEqual);
