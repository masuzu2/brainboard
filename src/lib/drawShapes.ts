import {
  type Editor,
  type TLShapeId,
  type TLShapePartial,
  createShapeId,
  toRichText,
} from "tldraw";

export type DrawableShape =
  | {
      kind: "box";
      x: number;
      y: number;
      w: number;
      h: number;
      label?: string;
      color?: string;
      shape?: "rectangle" | "ellipse" | "diamond" | "cloud";
    }
  | {
      kind: "text";
      x: number;
      y: number;
      text: string;
      size?: "s" | "m" | "l" | "xl";
    }
  | {
      kind: "arrow";
      from: { x: number; y: number };
      to: { x: number; y: number };
      label?: string;
    };

type TldrawColor =
  | "black"
  | "blue"
  | "green"
  | "grey"
  | "light-blue"
  | "light-green"
  | "light-red"
  | "light-violet"
  | "orange"
  | "red"
  | "violet"
  | "yellow";

const VALID_COLORS: ReadonlySet<TldrawColor> = new Set([
  "black",
  "blue",
  "green",
  "grey",
  "light-blue",
  "light-green",
  "light-red",
  "light-violet",
  "orange",
  "red",
  "violet",
  "yellow",
]);

function safeColor(c?: string): TldrawColor {
  return c && VALID_COLORS.has(c as TldrawColor) ? (c as TldrawColor) : "black";
}

export type DrawShapesOptions = {
  /** If "center", shifts shapes so their bbox is centered at viewport. If "asIs", uses the given coords. */
  origin?: "center" | "asIs";
  /** If true, selects and zooms to the new shapes. Default true. */
  focus?: boolean;
};

export function drawShapes(
  editor: Editor,
  shapes: DrawableShape[],
  opts: DrawShapesOptions = {},
): TLShapeId[] {
  if (shapes.length === 0) return [];
  const { origin = "center", focus = true } = opts;

  let dx = 0;
  let dy = 0;
  if (origin === "center") {
    const center = editor.getViewportPageBounds().center;
    const xs = shapes.flatMap((s) =>
      s.kind === "arrow" ? [s.from.x, s.to.x] : [s.x],
    );
    const ys = shapes.flatMap((s) =>
      s.kind === "arrow" ? [s.from.y, s.to.y] : [s.y],
    );
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    dx = center.x - (minX + maxX) / 2;
    dy = center.y - (minY + maxY) / 2;
  }

  const created: TLShapePartial[] = shapes.map((s) => {
    if (s.kind === "box") {
      return {
        id: createShapeId(),
        type: "geo",
        x: s.x + dx,
        y: s.y + dy,
        props: {
          geo: s.shape ?? "rectangle",
          w: Math.max(40, s.w),
          h: Math.max(40, s.h),
          color: safeColor(s.color),
          richText: toRichText(s.label ?? ""),
        },
      };
    }
    if (s.kind === "text") {
      return {
        id: createShapeId(),
        type: "text",
        x: s.x + dx,
        y: s.y + dy,
        props: {
          richText: toRichText(s.text),
          size: s.size ?? "m",
        },
      };
    }
    return {
      id: createShapeId(),
      type: "arrow",
      x: 0,
      y: 0,
      props: {
        start: { x: s.from.x + dx, y: s.from.y + dy },
        end: { x: s.to.x + dx, y: s.to.y + dy },
        richText: toRichText(s.label ?? ""),
      },
    };
  });

  editor.createShapes(created);
  const ids = created.map((s) => s.id!) as TLShapeId[];

  if (focus) {
    editor.setSelectedShapes(ids);
    editor.zoomToSelection({ animation: { duration: 400 } });
  }
  return ids;
}
