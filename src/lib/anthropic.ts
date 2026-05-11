import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local or your hosting provider.",
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const MODEL = "claude-sonnet-4-6";

export type ImageMediaType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

export function parseDataUrl(dataUrl: string): {
  mediaType: ImageMediaType;
  base64: string;
} {
  const m = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) throw new Error("invalid image data url");
  const mediaType = m[1] as ImageMediaType;
  return { mediaType, base64: m[2] };
}

export function extractText(
  content: Anthropic.Messages.ContentBlock[],
): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

export function extractFencedBlock(
  text: string,
  lang?: string,
): string | null {
  const re = lang
    ? new RegExp("```" + lang + "\\s*\\n([\\s\\S]*?)```", "i")
    : /```(?:\w+)?\s*\n([\s\S]*?)```/;
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
