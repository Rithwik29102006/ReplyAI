// Vercel Function: server-side proxy for the WhatsApp simulator (POST /api/groq).
// The Groq key lives only in Vercel's environment variables (GROQ_API_KEY)
// and is never sent to the browser.

const MAX_MESSAGE_CHARS = 2000;
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export async function POST(req) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY is not set in Vercel" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages } = body || {};
  const valid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 10 &&
    messages.every(
      (m) =>
        m &&
        ["system", "user", "assistant"].includes(m.role) &&
        typeof m.content === "string" &&
        m.content.length <= MAX_MESSAGE_CHARS
    );
  if (!valid) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const request = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 400,
  };
  // gpt-oss models think before answering; keep that short so replies stay fast.
  if (MODEL.startsWith("openai/gpt-oss")) request.reasoning_effort = "low";

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await groqRes.json().catch(() => ({}));
  if (!groqRes.ok) {
    console.error("Groq error", groqRes.status, data);
    return Response.json({ error: "Groq request failed" }, { status: groqRes.status });
  }

  return Response.json({ reply: data.choices?.[0]?.message?.content ?? "" });
}
