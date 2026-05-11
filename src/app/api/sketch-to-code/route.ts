import { NextResponse } from "next/server";
import { VISION_MODEL, getGroq } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_REACT = `You are an expert frontend engineer. The user gives you a hand-drawn UI sketch from a whiteboard. Reconstruct it as a single, self-contained React functional component using TypeScript and Tailwind CSS v4.

Rules:
- Output ONE component named GeneratedUI exported as default.
- Use semantic HTML (button, nav, header, etc.) and accessible labels.
- Use Tailwind utility classes only — no external UI libraries.
- Infer reasonable colors, spacing, and typography. Prefer modern, clean styling unless the sketch clearly suggests another vibe.
- For images use https://placehold.co/<W>x<H> placeholders.
- Do NOT include explanations, markdown commentary, or import lines for React (assume React is in scope).
- Do include any other necessary imports (e.g. useState).
- Wrap the entire output in a single \`\`\`tsx code fence and nothing else.`;

const SYSTEM_HTML = `You are an expert frontend engineer. The user gives you a hand-drawn UI sketch from a whiteboard. Reconstruct it as a single, self-contained HTML5 document with inline <style>.

Rules:
- Valid <!doctype html> document, mobile-friendly viewport.
- Use semantic HTML and accessible labels.
- Inline CSS in a <style> tag — no external dependencies.
- Infer reasonable colors, spacing, and typography. Prefer modern, clean styling.
- For images use https://placehold.co/<W>x<H> placeholders.
- No explanations or commentary.
- Wrap the entire output in a single \`\`\`html code fence and nothing else.`;

type Body = {
  image: string;
  framework: "react" | "html";
  style?: string;
  previousCode?: string;
};

export async function POST(req: Request) {
  try {
    const { image, framework, style, previousCode } = (await req.json()) as Body;
    if (!image) return NextResponse.json({ error: "missing image" }, { status: 400 });

    const baseSystem = framework === "html" ? SYSTEM_HTML : SYSTEM_REACT;
    const systemExtras: string[] = [];
    if (style) {
      systemExtras.push(`Style preference: ${style}.`);
    }
    if (previousCode) {
      systemExtras.push(
        `The user previously generated the following code from this sketch. Produce a NEW, improved version — different layout choices, cleaner structure, or better visual hierarchy. Do not just copy.`,
      );
    }
    const system =
      systemExtras.length === 0
        ? baseSystem
        : `${baseSystem}\n\n${systemExtras.join("\n")}`;

    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: previousCode
          ? `Previous attempt:\n\n${previousCode}\n\nNow regenerate, improving on the above.`
          : "Reconstruct this sketch as production-ready code.",
      },
      { type: "image_url", image_url: { url: image } },
    ];

    const stream = await getGroq().chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 4096,
      temperature: previousCode ? 0.7 : 0.4,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
