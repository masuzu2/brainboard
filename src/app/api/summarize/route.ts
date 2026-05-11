import { NextResponse } from "next/server";
import { VISION_MODEL, getGroq } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are a meeting facilitator looking at a snapshot of a collaborative whiteboard.

Read everything visible on the board — sticky notes, diagrams, arrows, written text, sketches — and produce structured meeting notes in markdown.

Output structure:
# Board Summary

## Topics
- bullet list of the main topics or sections you can identify

## Key Points
- detailed notes capturing decisions, ideas, and observations on the board

## Action Items
- list any tasks, owners, or next steps that appear on the board (or that are clearly implied)
- if none are visible, write: "_None identified on the board._"

## Open Questions
- list anything that looks uncertain, marked with "?", or framed as a question
- if none, write: "_None identified._"

Keep it concise but faithful to what's on the board. Don't invent content. Use markdown only — no commentary outside the structure above.`;

export async function POST(req: Request) {
  try {
    const { image } = (await req.json()) as { image: string };
    if (!image) return NextResponse.json({ error: "missing image" }, { status: 400 });

    const completion = await getGroq().chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Summarize this whiteboard." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    });

    const notes = (completion.choices[0]?.message?.content ?? "").trim();
    return NextResponse.json({ notes });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
