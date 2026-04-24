export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API key missing!" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Create a complete beautiful single-page HTML website for: "${prompt}". Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no explanation.` }] }]
        })
      }
    );

    const raw = await response.text();
    
    let data;
    try {
      data = JSON.parse(raw);
    } catch(e) {
      return res.status(500).json({ error: "JSON parse failed: " + raw.slice(0, 200) });
    }

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ error: "No response: " + JSON.stringify(data).slice(0, 300) });
    }

    let html = data.candidates[0].content.parts[0].text
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    res.status(200).json({ html });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
