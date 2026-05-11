/* Templates seed shapes when a new board is created. */

export type TemplateId = "blank" | "kanban" | "mindmap" | "flowchart" | "retro";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  emoji: string;
  description: string;
  accent: string;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "blank",
    name: "Blank",
    emoji: "✨",
    description: "Start with an empty canvas.",
    accent: "bg-cream",
  },
  {
    id: "kanban",
    name: "Kanban",
    emoji: "📋",
    description: "Three columns: To do, Doing, Done.",
    accent: "bg-sky/30",
  },
  {
    id: "mindmap",
    name: "Mind Map",
    emoji: "🧠",
    description: "Central topic with branching ideas.",
    accent: "bg-grape/30",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    emoji: "🔀",
    description: "Start, decision, end nodes connected with arrows.",
    accent: "bg-mint/30",
  },
  {
    id: "retro",
    name: "Retrospective",
    emoji: "🔁",
    description: "What went well · What didn't · Action items.",
    accent: "bg-coral/30",
  },
];

export type SeedShape =
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
  | { kind: "text"; x: number; y: number; text: string; size?: "s" | "m" | "l" | "xl" }
  | {
      kind: "arrow";
      from: { x: number; y: number };
      to: { x: number; y: number };
      label?: string;
    };

export function templateSeed(id: TemplateId): SeedShape[] {
  switch (id) {
    case "kanban":
      return [
        { kind: "text", x: -360, y: -260, text: "Kanban", size: "xl" },
        { kind: "box", x: -360, y: -180, w: 220, h: 60, label: "To do", color: "grey" },
        { kind: "box", x: -120, y: -180, w: 220, h: 60, label: "Doing", color: "blue" },
        { kind: "box", x: 120, y: -180, w: 220, h: 60, label: "Done", color: "green" },
        { kind: "box", x: -340, y: -100, w: 180, h: 60, label: "Sample task" },
        { kind: "box", x: -340, y: -20, w: 180, h: 60, label: "Another task" },
      ];
    case "mindmap":
      return [
        {
          kind: "box",
          x: -90,
          y: -40,
          w: 180,
          h: 80,
          label: "Main idea",
          color: "violet",
          shape: "ellipse",
        },
        { kind: "box", x: -340, y: -200, w: 160, h: 60, label: "Branch 1", color: "blue" },
        { kind: "box", x: 180, y: -200, w: 160, h: 60, label: "Branch 2", color: "green" },
        { kind: "box", x: -340, y: 140, w: 160, h: 60, label: "Branch 3", color: "orange" },
        { kind: "box", x: 180, y: 140, w: 160, h: 60, label: "Branch 4", color: "red" },
        { kind: "arrow", from: { x: -90, y: 0 }, to: { x: -180, y: -170 } },
        { kind: "arrow", from: { x: 90, y: 0 }, to: { x: 180, y: -170 } },
        { kind: "arrow", from: { x: -90, y: 40 }, to: { x: -180, y: 170 } },
        { kind: "arrow", from: { x: 90, y: 40 }, to: { x: 180, y: 170 } },
      ];
    case "flowchart":
      return [
        {
          kind: "box",
          x: -80,
          y: -240,
          w: 160,
          h: 60,
          label: "Start",
          color: "green",
          shape: "ellipse",
        },
        {
          kind: "box",
          x: -100,
          y: -120,
          w: 200,
          h: 80,
          label: "Decision",
          color: "yellow",
          shape: "diamond",
        },
        { kind: "box", x: -260, y: 40, w: 160, h: 60, label: "Action A", color: "blue" },
        { kind: "box", x: 100, y: 40, w: 160, h: 60, label: "Action B", color: "blue" },
        {
          kind: "box",
          x: -80,
          y: 180,
          w: 160,
          h: 60,
          label: "End",
          color: "red",
          shape: "ellipse",
        },
        { kind: "arrow", from: { x: 0, y: -180 }, to: { x: 0, y: -120 } },
        { kind: "arrow", from: { x: -80, y: -80 }, to: { x: -180, y: 40 }, label: "yes" },
        { kind: "arrow", from: { x: 80, y: -80 }, to: { x: 180, y: 40 }, label: "no" },
        { kind: "arrow", from: { x: -180, y: 100 }, to: { x: 0, y: 180 } },
        { kind: "arrow", from: { x: 180, y: 100 }, to: { x: 0, y: 180 } },
      ];
    case "retro":
      return [
        { kind: "text", x: -460, y: -260, text: "Retrospective", size: "xl" },
        { kind: "box", x: -460, y: -180, w: 280, h: 60, label: "What went well", color: "green" },
        { kind: "box", x: -160, y: -180, w: 280, h: 60, label: "What didn't", color: "red" },
        { kind: "box", x: 140, y: -180, w: 280, h: 60, label: "Action items", color: "blue" },
        { kind: "box", x: -440, y: -100, w: 240, h: 60, label: "👍 ..." },
        { kind: "box", x: -140, y: -100, w: 240, h: 60, label: "👎 ..." },
        { kind: "box", x: 160, y: -100, w: 240, h: 60, label: "✅ ..." },
      ];
    case "blank":
    default:
      return [];
  }
}
