import { NextResponse } from "next/server";
import {
  MODEL,
  extractFencedBlock,
  extractText,
  getAnthropic,
  parseDataUrl,
} from "@/lib/anthropic";

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

    const { mediaType, base64 } = parseDataUrl(image);
    const system = framework === "html" ? SYSTEM_HTML : SYSTEM_REACT;
    const fenceLang = framework === "html" ? "html" : "tsx";

    const msg = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: "Reconstruct this sketch as production-ready code.",
            },
          ],
        },
      ],
    });

    const text = extractText(msg.content);
    const code = extractFencedBlock(text, fenceLang) ?? text.trim();
    return NextResponse.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(message, { status: 500 });
  }
}
