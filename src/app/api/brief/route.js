export async function POST(request) {
  const { industry, companies } = await request.json();

  const systemPrompt = `You are an intelligence analyst producing a concise industry briefing. Return a single JSON object with exactly four keys:
- "headlines": array of exactly 3 objects, each with: company (string), headline (string, max 120 chars), sowhat (string, 1-2 sentences explaining strategic significance), signal (one of: "fundraising", "hiring", "product", "expansion", or null)
- "synthesis": string (3-4 sentences synthesizing the macro trend behind the week's headlines into a cohesive narrative)
- "deals": array of 4-5 objects covering fundraising rounds, acquisitions, and leadership changes, each with: company (string), description (string, 1 concise sentence), type (one of: "fundraising", "acquisition", "hiring")
- "trendSpotlight": object with: title (string, short punchy title), body (string, 3-4 sentences explaining the bigger macro story behind this week's news)
Return ONLY a valid JSON object, no markdown, no backticks, no preamble.`;

  const userMsg = `Search for the most recent and significant news (last 2 weeks if possible) about these ${industry} companies: ${companies.join(", ")}.

Find the most notable stories — prioritize: fundraising rounds, leadership hires, major product launches, and expansion news. Also include any high-impact news (earnings surprises, controversies, major partnerships).

Return a JSON object with:
- headlines: 3 most significant stories (company, headline, sowhat, signal)
- synthesis: 3-4 sentence macro narrative tying the headlines together
- deals: 4-5 bullet-point deals/moves (company, description, type)
- trendSpotlight: one bigger macro idea with a title and 3-4 sentence body

Return ONLY a JSON object.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
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
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return Response.json({ error: "No valid JSON returned" }, { status: 500 });
  }
  const result = JSON.parse(cleaned.slice(start, end + 1));
  return Response.json(result);
}
