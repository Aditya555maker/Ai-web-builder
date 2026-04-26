import { useState, useRef } from "react";

const siteTypes = [
  { id: "restaurant", label: "🍽️ Restaurant" },
  { id: "portfolio", label: "🎨 Portfolio" },
  { id: "business", label: "🏢 Business" },
  { id: "store", label: "🛒 Online Store" },
  { id: "startup", label: "🚀 Startup" },
  { id: "fitness", label: "💪 Fitness" },
  { id: "blog", label: "📝 Blog" },
  { id: "wedding", label: "💍 Wedding" },
  { id: "ngo", label: "❤️ NGO" },
  { id: "education", label: "📚 Education" },
];

const themes = [
  { id: "dark", label: "🌑 Dark Modern", color: "#1a1a2e" },
  { id: "light", label: "☀️ Light Clean", color: "#f8f9fa" },
  { id: "colorful", label: "🌈 Bold Colorful", color: "#ff6b6b" },
  { id: "luxury", label: "✨ Luxury Gold", color: "#b8860b" },
  { id: "nature", label: "🌿 Nature Green", color: "#2d6a4f" },
  { id: "neon", label: "⚡ Neon Cyberpunk", color: "#00f5ff" },
];

const allFeatures = [
  "Navigation Menu","Hero Section","Footer","About Us",
  "Services","Gallery","Testimonials","Pricing Table",
  "Contact Form","FAQ","Blog","Team Section",
  "WhatsApp Button","Animations","Dark Mode Toggle","Newsletter",
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [screen, setScreen] = useState("home");
  const [siteType, setSiteType] = useState("");
  const [theme, setTheme] = useState("");
  const [features, setFeatures] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editing, setEditing] = useState(false);
  const iframe = useRef(null);

  function toggleFeature(f) {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  async function generate() {
    setScreen("loading");
    const fullPrompt = `Create a complete beautiful single-page HTML website.
Type: ${siteType}
Theme: ${theme}
Brand: ${brandName || "My Brand"}
Sections: ${features.length > 0 ? features.join(", ") : "Hero, Nav, Services, Contact, Footer"}
Extra: ${prompt || "Make it professional"}
Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown.`;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch(e) { throw new Error("Server error"); }
      if (!res.ok) throw new Error(data.error || "Error");
      setHtml(data.html);
      setScreen("result");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) { setError(e.message); setScreen("error"); }
  }

  async function editWebsite() {
    if (!editPrompt.trim()) return;
    setEditing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Edit this HTML: ${html}\n\nChange: "${editPrompt}"\n\nReturn ONLY complete HTML.` })
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch(e) { throw new Error("Server error"); }
      if (!res.ok) throw new Error(data.error);
      setHtml(data.html);
      setEditPrompt("");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) { alert("Error: " + e.message); }
    finally { setEditing(false); }
  }

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = "website.html";
    a.click();
  }

  function reset() {
    setStep(1); setScreen("home"); setSiteType(""); setTheme("");
    setFeatures([]); setBrandName(""); setPrompt(""); setHtml("");
  }

  const s = { minHeight:"100vh", background:"#08080f", color:"#fff", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" };
  const c = { width:"100%", maxWidth:"560px", background:"#0e0e1c", border:"1px solid #1e1e35", borderRadius:"16px", padding:"24px" };
  const nb = { flex:1, padding:"13px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"15px", fontWeight:"700", cursor:"pointer" };
  const bb = { padding:"13px 18px", background:"#1a1a2e", border:"1px solid #333", borderRadius:"10px", color:"#888", cursor:"pointer" };

  if (screen === "home" && step === 1) return (
    <div style={s}><div style={c}>
      <div style={{fontSize:"11px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"6px"}}>STEP 1 / 4</div>
      <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"18px"}}>Kaisi website chahiye? 🎯</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"20px"}}>
        {siteTypes.map(t => (
          <div key={t.id} onClick={() => setSiteType(t.id)}
            style={{padding:"12px",borderRadius:"10px",cursor:"pointer",border:siteType===t.id?"2px solid #7c3aed":"2px solid #222",background:siteType===t.id?"rgba(124,58,237,0.15)":"#111",fontWeight:"700"}}>
            {t.label}
          </div>
        ))}
      </div>
      <button onClick={() => siteType ? setStep(2) : alert("Type select karo!")} style={{...nb,width:"100%"}}>Agla Step →</button>
    </div></div>
  );

  if (screen === "home" && step === 2) return (
    <div style={s}><div style={c}>
      <div style={{fontSize:"11px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"6px"}}>STEP 2 / 4</div>
      <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"18px"}}>Theme choose karo 🎨</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"20px"}}>
        {themes.map(t => (
          <div key={t.id} onClick={() => setTheme(t.id)}
            style={{padding:"12px",borderRadius:"10px",cursor:"pointer",border:theme===t.id?"2px solid #7c3aed":"2px solid #222",background:theme===t.id?"rgba(124,58,237,0.15)":"#111"}}>
            <div style={{height:"24px",borderRadius:"5px",background:t.color,marginBottom:"6px"}}/>
            <div style={{fontWeight:"700",fontSize:"0.85rem"}}>{t.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={() => setStep(1)} style={bb}>← Wapas</button>
        <button onClick={() => theme ? setStep(3) : alert("Theme select karo!")} style={nb}>Agla Step →</button>
      </div>
    </div></div>
  );

  if (screen === "home" && step === 3) return (
    <div style={s}><div style={c}>
      <div style={{fontSize:"11px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"6px"}}>STEP 3 / 4</div>
      <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"18px"}}>Features select karo ✨</h2>
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"20px"}}>
        {allFeatures.map(f => (
          <button key={f} onClick={() => toggleFeature(f)} style={{padding:"8px 12px",borderRadius:"20px",border:features.includes(f)?"2px solid #7c3aed":"2px solid #333",background:features.includes(f)?"rgba(124,58,237,0.2)":"#111",color:features.includes(f)?"#a78bfa":"#888",fontSize:"13px",cursor:"pointer"}}>
            {features.includes(f) ? "✓ " : ""}{f}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={() => setStep(2)} style={bb}>← Wapas</button>
        <button onClick={() => setStep(4)} style={nb}>Agla Step →</button>
      </div>
    </div></div>
  );

  if (screen === "home" && step === 4) return (
    <div style={s}><div style={c}>
      <div style={{fontSize:"11px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"6px"}}>STEP 4 / 4</div>
      <h2 style={{fontSize:"1.3rem",fontWeight:"800",marginBottom:"18px"}}>Last Step! 🚀</h2>
      <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Brand/Business name..."
        style={{width:"100%",background:"#08080f",border:"2px solid #1e1e35",borderRadius:"10px",color:"#fff",fontSize:"14px",padding:"12px",outline:"none",marginBottom:"12px"}}/>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Kuch aur add karna hai? (optional)..." rows={2}
        style={{width:"100%",background:"#08080f",border:"2px solid #1e1e35",borderRadius:"10px",color:"#fff",fontSize:"14px",padding:"12px",outline:"none",marginBottom:"12px",resize:"none"}}/>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={() => setStep(3)} style={bb}>← Wapas</button>
        <button onClick={generate} style={{...nb,background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>⚡ Website Banao!</button>
      </div>
    </div></div>
  );

  if (screen === "loading") return (
    <div style={{...s,flexDirection:"column"}}>
      <div style={{fontSize:"64px",marginBottom:"20px"}}>⏳</div>
      <h2>Website ban rahi hai...</h2>
    </div>
  );

  if (screen === "error") return (
    <div style={{...s,flexDirection:"column"}}>
      <div style={{fontSize:"52px",marginBottom:"16px"}}>⚠️</div>
      <h2 style={{marginBottom:"12px"}}>Error aa gayi</h2>
      <p style={{color:"#f87171",marginBottom:"24px",padding:"12px",background:"rgba(239,68,68,0.1)",borderRadius:"8px",maxWidth:"400px",textAlign:"center",fontSize:"13px"}}>{error}</p>
      <button onClick={reset} style={{padding:"12px 28px",background:"#7c3aed",border:"none",borderRadius:"10px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>← Wapas</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",padding:"16px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
          <button onClick={download} style={{padding:"10px 18px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>⬇ Download</button>
          <button onClick={reset} style={{padding:"10px 18px",background:"#7c3aed",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>+ Nai Website</button>
        </div>
        <div style={{background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:"12px",padding:"14px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"#7c3aed",marginBottom:"8px",fontFamily:"monospace"}}>🤖 AI SE EDIT KARO</div>
          <div style={{display:"flex",gap:"8px"}}>
            <input value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter") editWebsite(); }}
              placeholder="Jaise: Header blue karo, WhatsApp button add karo..."
              style={{flex:1,background:"#08080f",border:"1px solid #1e1e35",borderRadius:"8px",color:"#fff",fontSize:"14px",padding:"10px 12px",outline:"none"}}/>
            <button onClick={editWebsite} disabled={editing}
              style={{padding:"10px 18px",background:editing?"#333":"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
              {editing ? "⏳..." : "✏️ Edit"}
            </button>
          </div>
        </div>
        <iframe ref={iframe} style={{width:"100%",height:"580px",border:"2px solid #1e1e35",borderRadius:"12px",background:"#fff"}}/>
      </div>
    </div>
  );
  }
