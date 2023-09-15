import {
  PerfectFreehandDrawShape,
  PerfectFreehandDrawStyles,
} from "@/typescript/@types/modules/drawing/perfectFreehand";
import deepmerge from "deepmerge";
import { EASINGS } from "./easings";

export const getDefaultStyle = (
  props = {} as Partial<PerfectFreehandDrawStyles>
) => {
  const defaultStyle: PerfectFreehandDrawStyles = {
    size: 12,
    strokeWidth: 0,
    thinning: 0.65,
    streamline: 0.58,
    smoothing: 0.5,
    easing: "linear",
    taperStart: 24,
    taperEnd: 34,
    capStart: true,
    capEnd: true,
    easingStart: "linear",
    easingEnd: "linear",
    isFilled: true,
    fill: "#000000",
    stroke: "#000000",
  };
  return deepmerge(defaultStyle, props);
};

export const getDefaultShape = (
  props = {} as Partial<PerfectFreehandDrawShape>
) => {
  return deepmerge<PerfectFreehandDrawShape, PerfectFreehandDrawShape>(
    {
      id: Date.now() + "",
      type: "drawing",
      name: "Draw",
      parentId: "niimblr-content-page",
      childIndex: 1,
      point: [0, 0],
      points: [],
      rotation: 0,
      isDone: false,
      style: getDefaultStyle(),
    },
    props
  );
};

const average = (a: number, b: number) => (a + b) / 2;
/**
 * Turn an array of points into a path of quadradic curves.
 *
 * @param points The points returned from perfect-freehand
 * @param closed Whether the stroke is closed
 */
export function getSvgPathFromStroke(
  points: number[][],
  closed = true
): string {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}

export function dot([x, y]: number[]) {
  return `M ${x - 0.5},${y} a .5,.5 0 1,0 1,0 a .5,.5 0 1,0 -1,0`;
}

export function dots(points: number[][]) {
  return points.map(dot).join(" ");
}

export const getStyleOptionsFromShape = (shape: PerfectFreehandDrawShape) => {
  const simulatePressure = shape.points[2]?.[2] === 0.5;
  const {
    style: {
      size,
      thinning,
      streamline,
      smoothing,
      easing,
      taperStart,
      taperEnd,
      capStart,
      capEnd,
      easingEnd,
      easingStart,
    },
    isDone,
  } = shape;
  return {
    size,
    thinning,
    streamline,
    easing: EASINGS[easing],
    smoothing,
    start: {
      taper: taperStart,
      cap: capStart,
      easing: EASINGS[easingStart],
    },
    end: {
      taper: taperEnd,
      cap: capEnd,
      easing: EASINGS[easingEnd],
    },
    simulatePressure,
    last: isDone,
  };
};
