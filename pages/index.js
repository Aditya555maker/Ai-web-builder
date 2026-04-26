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
  "Navigation Menu","Hero Section","Footer","Sidebar",
  "About Us","Our Story","Mission & Vision","Team Section",
  "Services","Features List","How It Works","Process Steps",
  "Gallery/Portfolio","Video Section","Before & After",
  "Testimonials","Reviews & Ratings","Client Logos","Awards",
  "Pricing Table","Offers/Discounts","CTA Section","Newsletter",
  "FAQ Section","Blog/News","Events","Announcements",
  "Contact Form","Map/Location","Social Media Links","WhatsApp Button",
  "Animations","Dark Mode Toggle","Back to Top Button",
  "Cookie Notice","Loading Screen","Countdown Timer",
];

const loadingSteps = [
  "🎨 Design soch raha hai...",
  "📐 Layout bana raha hai...",
  "✍️ HTML likh raha hai...",
  "💅 CSS animations add kar raha hai...",
  "📱 Mobile responsive bana raha hai...",
  "✨ Final polish ho raha hai...",
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
  const [photos, setPhotos] = useState([]);
  const [lang, setLang] = useState("english");
  const [customColor, setCustomColor] = useState("#7c3aed");
  const [mobileView, setMobileView] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const iframe = useRef(null);
  const fileInput = useRef(null);
  const loadingTimer = useRef(null);

  function toggleFeature(f) {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  function toBase64(file) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = e => resolve(e.target.result);
      r.readAsDataURL(file);
    });
  }

  async function handlePhotos(e) {
    const files = Array.from(e.target.files);
    const newPhotos = [];
    for (const f of files) {
      const url = await toBase64(f);
      newPhotos.push({ name: f.name, url, type: "logo" });
    }
    setPhotos(prev => [...prev, ...newPhotos]);
  }

  function startLoadingAnimation() {
    setLoadingStep(0);
    let i = 0;
    loadingTimer.current = setInterval(() => {
      i = (i + 1) % loadingSteps.length;
      setLoadingStep(i);
    }, 2500);
  }

  function stopLoadingAnimation() {
    if (loadingTimer.current) clearInterval(loadingTimer.current);
  }

  async function generate() {
    setScreen("loading");
    startLoadingAnimation();
    const photoInfo = photos.length > 0 ? `\nUse these images: ${photos.map(p => `${p.type}: ${p.url}`).join(", ")}` : "";
    const fullPrompt = `Create a complete beautiful single-page HTML website.
Type: ${siteType}
Theme: ${theme}
Brand: ${brandName || "My Brand"}
Primary Color: ${customColor}
Language: ${lang}
Sections: ${features.length > 0 ? features.join(", ") : "Hero, Nav, Services, Contact, Footer"}
Extra: ${prompt || "Make it professional and stunning"}${photoInfo}
Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown. No explanation.`;
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
      stopLoadingAnimation();
      setHtml(data.html);

      // Save to history
      const newSite = {
        id: Date.now(),
        title: brandName || siteType || "Website",
        type: siteType,
        theme: theme,
        time: new Date().toLocaleTimeString(),
        html: data.html
      };
      setHistory(prev => [newSite, ...prev.slice(0, 9)]);

      setScreen("result");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) {
      stopLoadingAnimation();
      setError(e.message);
      setScreen("error");
    }
  }

  async function editWebsite() {
    if (!editPrompt.trim()) return;
    setEditing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Edit this HTML:\n\n${html}\n\nChange: "${editPrompt}"\n\nReturn ONLY complete HTML starting with <!DOCTYPE html>.` })
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
    a.download = (brandName || "website") + ".html";
    a.click();
  }

  function loadFromHistory(site) {
    setHtml(site.html);
    setScreen("result");
    setShowHistory(false);
    setTimeout(() => { if (iframe.current) iframe.current.srcdoc = site.html; }, 200);
  }

  function deleteFromHistory(id) {
    setHistory(prev => prev.filter(s => s.id !== id));
  }

  function reset() {
    setStep(1); setScreen("home"); setSiteType(""); setTheme("");
    setFeatures([]); setBrandName(""); setPrompt(""); setHtml("");
    setPhotos([]); setLang("english"); setCustomColor("#7c3aed");
    setShowHistory(false);
  }

  const s = { minHeight:"100vh", background:"#08080f", color:"#fff", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" };
  const c = { width:"100%", maxWidth:"560px", background:"#0e0e1c", border:"1px solid #1e1e35", borderRadius:"16px", padding:"24px" };
  const nb = { flex:1, padding:"13px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"15px", fontWeight:"700", cursor:"pointer" };
  const bb = { padding:"13px 18px", background:"#1a1a2e", border:"1px solid #333", borderRadius:"10px", color:"#888", cursor:"pointer" };
  const lbl = { display:"block", fontSize:"11px", color:"#555", fontFamily:"monospace", marginBottom:"6px", letterSpacing:"1px" };

  if (screen === "home" && step === 1) return (
    <div style={s}><div style={c}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
        <div style={{fontSize:"11px",color:"#7c3aed",fontFamily:"monospace"}}>STEP 1 / 4</div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)}
            style={{fontSize:"11px",background:"#1a1a2e",border:"1px solid #333",borderRadius:"6px",color:"#888",padding:"4px 10px",cursor:"pointer"}}>
            📚 History ({history.length})
          </button>
        )}
      </div>

      {showHistory && (
        <div style={{background:"#08080f",border:"1px solid #1e1e35",borderRadius:"10px",padding:"12px",marginBottom:"16px",maxHeight:"200px",overflowY:"auto"}}>
          <div style={{fontSize:"11px",color:"#7c3aed",marginBottom:"8px",fontFamily:"monospace"}}>📚 BANAI HUI WEBSITES</div>
          {history.map(site => (
            <div key={site.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px",background:"#0e0e1c",borderRadius:"8px",marginBottom:"6px"}}>
              <div>
                <div style={{fontSize:"13px",fontWeight:"700"}}>{site.title}</div>
                <div style={{fontSize:"11px",color:"#555",fontFamily:"monospace"}}>{site.type} • {site.time}</div>
              </div>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={() => loadFromHistory(site)}
                  style={{padding:"4px 10px",background:"#7c3aed",border:"none",borderRadius:"6px",color:"#fff",fontSize:"11px",cursor:"pointer"}}>
                  Load
                </button>
                <button onClick={() => deleteFromHistory(site.id)}
                  style={{padding:"4px 10px",background:"#ff4444",border:"none",borderRadius:"6px",color:"#fff",fontSize:"11px",cursor:"pointer"}}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"16px"}}>
        {themes.map(t => (
          <div key={t.id} onClick={() => setTheme(t.id)}
            style={{padding:"12px",borderRadius:"10px",cursor:"pointer",border:theme===t.id?"2px solid #7c3aed":"2px solid #222",background:theme===t.id?"rgba(124,58,237,0.15)":"#111"}}>
            <div style={{height:"24px",borderRadius:"5px",background:t.color,marginBottom:"6px"}}/>
            <div style={{fontWeight:"700",fontSize:"0.85rem"}}>{t.label}</div>
          </div>
        ))}
      </div>
      <label style={lbl}>🎨 CUSTOM COLOR</label>
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
        <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
          style={{width:"50px",height:"40px",border:"none",borderRadius:"8px",cursor:"pointer"}}/>
        <span style={{fontFamily:"monospace",fontSize:"13px",color:"#888"}}>{customColor}</span>
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
      <label style={lbl}>BRAND NAME</label>
      <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Brand/Business name..."
        style={{width:"100%",background:"#08080f",border:"2px solid #1e1e35",borderRadius:"10px",color:"#fff",fontSize:"14px",padding:"12px",outline:"none",marginBottom:"12px"}}/>
      <label style={lbl}>🌐 LANGUAGE</label>
      <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
        {["english","hindi","hinglish"].map(l => (
          <button key={l} onClick={() => setLang(l)}
            style={{flex:1,padding:"10px",borderRadius:"8px",border:lang===l?"2px solid #7c3aed":"2px solid #333",background:lang===l?"rgba(124,58,237,0.2)":"#111",color:lang===l?"#a78bfa":"#888",cursor:"pointer",fontSize:"13px",textTransform:"capitalize"}}>
            {l}
          </button>
        ))}
      </div>
      <label style={lbl}>📸 PHOTOS (optional)</label>
      <input ref={fileInput} type="file" accept="image/*" multiple onChange={handlePhotos} style={{display:"none"}}/>
      <button onClick={() => fileInput.current.click()}
        style={{width:"100%",padding:"10px",background:"#1a1a2e",border:"1px solid #333",borderRadius:"8px",color:"#a78bfa",cursor:"pointer",fontSize:"13px",marginBottom:"8px"}}>
        📷 Photos Choose Karo ({photos.length} selected)
      </button>
      {photos.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
          {photos.map((p,i) => (
            <div key={i} style={{textAlign:"center"}}>
              <img src={p.url} style={{width:"50px",height:"50px",objectFit:"cover",borderRadius:"6px"}}/>
              <select value={p.type} onChange={e => setPhotos(prev => prev.map((x,j) => j===i?{...x,type:e.target.value}:x))}
                style={{width:"50px",fontSize:"9px",background:"#0a0a14",border:"none",color:"#fff",marginTop:"2px"}}>
                <option value="logo">Logo</option>
                <option value="bg">BG</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>
          ))}
        </div>
      )}
      <label style={lbl}>EXTRA (optional)</label>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Kuch aur add karna hai?..." rows={2}
        style={{width:"100%",background:"#08080f",border:"2px solid #1e1e35",borderRadius:"10px",color:"#fff",fontSize:"14px",padding:"12px",outline:"none",marginBottom:"12px",resize:"none"}}/>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={() => setStep(3)} style={bb}>← Wapas</button>
        <button onClick={generate} style={{...nb,background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>⚡ Website Banao!</button>
      </div>
    </div></div>
  );

  if (screen === "loading") return (
    <div style={{...s,flexDirection:"column"}}>
      <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"conic-gradient(from 0deg,#7c3aed,#38bdf8,#7c3aed)",margin:"0 auto 24px",animation:"spin 1.2s linear infinite",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(124,58,237,0.5)"}}>
        <div style={{width:"60px",height:"60px",borderRadius:"50%",background:"#08080f"}}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <h2 style={{marginBottom:"12px"}}>Website ban rahi hai...</h2>
      <p style={{color:"#555",fontFamily:"monospace",fontSize:"13px",minHeight:"20px"}}>{loadingSteps[loadingStep]}</p>
      <div style={{width:"200px",height:"3px",background:"#1e1e35",borderRadius:"10px",overflow:"hidden",marginTop:"20px"}}>
        <div style={{height:"100%",width:"40%",background:"linear-gradient(90deg,#7c3aed,#38bdf8)",animation:"flow 1.8s ease-in-out infinite"}}/>
      </div>
      <style>{`@keyframes flow{0%{margin-left:-40%}100%{margin-left:110%}}`}</style>
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
      <div style={{maxWidth:mobileView?"400px":"1000px",margin:"0 auto",transition:"max-width 0.3s"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
          <button onClick={download} style={{padding:"10px 18px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>⬇ Download</button>
          <button onClick={() => setMobileView(!mobileView)} style={{padding:"10px 18px",background:mobileView?"#7c3aed":"#1a1a2e",border:"1px solid #333",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            {mobileView?"🖥️ Desktop":"📱 Mobile"}
          </button>
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
              {editing?"⏳...":"✏️ Edit"}
            </button>
          </div>
        </div>
         <iframe ref={iframe} style={{width:"100%",height:"580px",border:"2px solid #1e1e35",borderRadius:"12px",background:"#fff"}}/>
      </div>
    </div>
  );
}
