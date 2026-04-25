import Anthropic from "@anthropic-ai/sdk";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "API key missing!" });
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: `Create a complete beautiful single-page HTML website for: "${prompt}". Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no explanation. Use CSS animations, gradients, Google Fonts. Make it stunning and mobile responsive.` }]
    });
    let html = msg.content[0].text.replace(/^```html\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim();
    res.status(200).json({ html });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
