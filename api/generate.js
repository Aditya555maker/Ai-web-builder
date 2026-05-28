export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "API key missing!" });
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 5000
        })
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "Groq error" });
    let html = data.choices?.[0]?.message?.content || "";
    html = html.replace(/^```html\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim();
    if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
      return res.status(500).json({ error: "HTML nahi aaya: " + html.slice(0,200) });
    }
    res.status(200).json({ html });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
