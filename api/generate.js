export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "API key missing!" });
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8000 }
        })
      }
    );
    
    const data = await response.json();
    let html = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    html = html.replace(/^```html\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/i,"").trim();
    res.status(200).json({ html });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
