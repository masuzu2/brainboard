import { NextResponse } from "next/server";
import {
  MODEL,
  extractFencedBlock,
  extractText,
  getAnthropic,
} from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are a diagramming assistant. Given a description, produce a JSON layout of shapes that visualizes it on an infinite whiteboard.

Output schema (strict):
{
  "shapes": Array<
    | { "kind": "box", "x": number, "y": number, "w": number, "h": number, "label"?: string, "color"?: Color, "shape"?: "rectangle" | "ellipse" | "diamond" | "cloud" }
    | { "kind": "text", "x": number, "y": number, "text": string }
    | { "kind": "arrow", "from": { "x": number, "y": number }, "to": { "x": number, "y": number }, "label"?: string }
  >
}

Color is one of: "black", "blue", "green", "grey", "light-blue", "light-green", "light-red", "light-violet", "orange", "red", "violet", "yellow".

Coordinate system:
- Origin (0,0) is the top-left of the diagram. Positive x is right, positive y is down.
- Box (x,y) is the top-left corner. Width and height are in pixels.
- Lay out shapes on a clean grid. Boxes should be at least 140 wide and 80 tall.
- Leave 60-100px gaps between boxes for arrows.
- Connect related boxes with arrows whose endpoints touch the edges of the boxes.

Rules:
- Use 4-12 shapes max. Be selective.
- Pick colors that group related concepts (e.g. all services blue, all data stores green).
- Add a "text" shape at the top as a title when helpful.
- Output ONLY a single \`\`\`json fenced block, no commentary.`;

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    if (!prompt?.trim())
      return NextResponse.json({ error: "missing prompt" }, { status: 400 });

    const msg = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const text = extractText(msg.content);
    const json = extractFencedBlock(text, "json") ?? text.trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return new NextResponse("AI returned invalid JSON", { status: 502 });
    }
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
