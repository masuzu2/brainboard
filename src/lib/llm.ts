import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getGroq(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local or your hosting provider.",
    );
  }
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

// Vision-capable Llama 4 Scout (multimodal, 131K context)
export const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Text-only, JSON-mode capable, fast
export const TEXT_MODEL = "llama-3.3-70b-versatile";

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
