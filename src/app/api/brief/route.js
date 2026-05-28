export async function POST(request) {
  const { industry, companies } = await request.json();

  const systemPrompt = `You are an intelligence analyst producing a concise industry briefing. For each story you find, return a JSON object (array of objects). Each object must have:
- "company": the company name (string)
- "headline": a crisp 1-sentence headline (string, max 120 chars)
- "sowhat": a 1-2 sentence "so what" — why this matters strategically (string)
- "signal": one of "fundraising", "hiring", "product", "expansion", or null
Return ONLY a valid JSON array, no markdown, no backticks, no preamble. Return 6-8 stories total.`;

  const userMsg = `Search for the most recent and significant news (last 2 weeks if possible) about these ${industry} companies: ${companies.join(", ")}.

Find 6-8 of the most notable stories — prioritize: fundraising rounds, leadership hires, major product launches, and expansion news. Also include any high-impact news (earnings surprises, controversies, major partnerships).

For each story, return a JSON object with: company, headline, sowhat, signal. Signal must be one of: "fundraising", "hiring", "product", "expansion", or null.

Return ONLY a JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "interleaved-thinking-2025-05-14"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: userMsg }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return Response.json({ error: err.error?.message || "API error" }, { status: 500 });
  }

  const data = await response.json();
  const textBlocks = data.content.filter(b => b.type === "text").map(b => b.text).join("");
  let cleaned = textBlocks.trim().replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    return Response.json({ error: "No valid JSON returned" }, { status: 500 });
  }
  const stories = JSON.parse(cleaned.slice(start, end + 1));
  return Response.json({ stories });
}
