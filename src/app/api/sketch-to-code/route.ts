import { NextResponse } from "next/server";
import {
  VISION_MODEL,
  extractFencedBlock,
  getGroq,
} from "@/lib/llm";

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

export async function POST(req: Request) {
  try {
    const { image, framework } = (await req.json()) as {
      image: string;
      framework: "react" | "html";
    };
    if (!image) return NextResponse.json({ error: "missing image" }, { status: 400 });

    const system = framework === "html" ? SYSTEM_HTML : SYSTEM_REACT;
    const fenceLang = framework === "html" ? "html" : "tsx";

    const completion = await getGroq().chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: "Reconstruct this sketch as production-ready code." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const code = extractFencedBlock(text, fenceLang) ?? text.trim();
    return NextResponse.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
