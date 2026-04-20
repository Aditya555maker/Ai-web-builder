import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [siteType, setSiteType] = useState("");
  const [theme, setTheme] = useState("");
  const [features, setFeatures] = useState([]);
  const [brandName, setBrandName] = useState("");
  const iframe = useRef(null);

  const siteTypes = [
    { id: "restaurant", label: "🍽️ Restaurant", desc: "Menu, reservations, location" },
    { id: "portfolio", label: "🎨 Portfolio", desc: "Gallery, about, contact" },
    { id: "business", label: "🏢 Business", desc: "Services, team, testimonials" },
    { id: "store", label: "🛒 Online Store", desc: "Products, cart, offers" },
    { id: "startup", label: "🚀 Startup", desc: "Hero, features, pricing" },
    { id: "fitness", label: "💪 Fitness", desc: "Classes, trainer, booking" },
    { id: "blog", label: "📝 Blog", desc: "Posts, categories, author" },
    { id: "wedding", label: "💍 Wedding", desc: "Story, gallery, RSVP" },
    { id: "ngo", label: "❤️ NGO/Charity", desc: "Mission, donate, events" },
    { id: "education", label: "📚 Education", desc: "Courses, teachers, enroll" },
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
    "Navigation Menu", "Hero Section", "Footer", "Sidebar",
    "About Us", "Our Story", "Mission & Vision", "Team Section",
    "Services", "Features List", "How It Works", "Process Steps",
    "Gallery/Portfolio", "Video Section", "Before & After",
    "Testimonials", "Reviews & Ratings", "Client Logos", "Awards",
    "Pricing Table", "Offers/Discounts", "CTA Section", "Newsletter",
    "FAQ Section", "Blog/News", "Events", "Announcements",
    "Contact Form", "Map/Location", "Social Media Links", "WhatsApp Button",
    "Animations", "Dark Mode Toggle", "Back to Top Button",
    "Cookie Notice", "Loading Screen", "Countdown Timer",
  ];

  function toggleFeature(f) {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  useEffect(() => {
    if (screen !== "loading") return;
    const msgs = ["🎨 Design ho raha hai...","✍️ HTML likh raha hai...","💅 CSS add ho raha hai...","📱 Mobile ready...","✨ Almost done..."];
    let i = 0;
    setStatus(msgs[0]);
    const t = setInterval(() => { i=(i+1)%msgs.length; setStatus(msgs[i]); }, 2000);
    return () => clearInterval(t);
  }, [screen]);

  async function generate() {
    setScreen("loading");
    const fullPrompt = `Create a complete beautiful single-page HTML website.
Type: ${siteType} website
Theme: ${theme} color theme
Brand Name: ${brandName || "My Brand"}
Extra description: ${prompt || "Make it professional"}
Must include these sections: ${features.length > 0 ? features.join(", ") : "Hero, Navigation, Services, Contact, Footer"}
Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown. Use CSS animations, gradients, Google Fonts. Make it stunning and mobile responsive. Minimum 500 lines.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setHtml(data.html);
      setScreen("result");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) {
      setError(e.message);
      setScreen("error");
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = (brandName || "website") + ".html";
    a.click();
  }

  if (screen === "home" && step === 1) return (
    <div style={wrap}>
      <div style={card}>
        <div style={progress}>Step 1 / 4</div>
        <h2 style={heading}>Kaisi website chahiye? 🎯</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"24px"}}>
          {siteTypes.map(t => (
            <div key={t.id} onClick={() => setSiteType(t.id)}
              style={{...optBox, border: siteType===t.id ? "2px solid #7c3aed" : "2px solid #222", background: siteType===t.id ? "rgba(124,58,237,0.15)" : "#111"}}>
              <div style={{fontSize:"1.1rem",fontWeight:"700"}}>{t.label}</div>
              <div style={{fontSize:"0.7rem",color:"#666",marginTop:"2px"}}>{t.desc}</div>
            </div>
          ))}
        </div>
        <button onClick={() => siteType ? setStep(2) : alert("Pehle type select karo!")} style={nextBtn}>Agla Step →</button>
      </div>
    </div>
  );

  if (screen === "home" && step === 2) return (
    <div style={wrap}>
      <div style={card}>
        <div style={progress}>Step 2 / 4</div>
        <h2 style={heading}>Kaisi theme chahiye? 🎨</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"24px"}}>
          {themes.map(t => (
            <div key={t.id} onClick={() => setTheme(t.id)}
              style={{...optBox, border: theme===t.id ? "2px solid #7c3aed" : "2px solid #222", background: theme===t.id ? "rgba(124,58,237,0.15)" : "#111"}}>
              <div style={{width:"100%",height:"30px",borderRadius:"6px",background:t.color,marginBottom:"8px"}}/>
              <div style={{fontSize:"0.85rem",fontWeight:"700"}}>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={() => setStep(1)} style={backBtn}>← Wapas</button>
          <button onClick={() => theme ? setStep(3) : alert("Theme select karo!")} style={nextBtn}>Agla Step →</button>
        </div>
      </div>
    </div>
  );

  if (screen === "home" && step === 3) return (
    <div style={wrap}>
      <div style={card}>
        <div style={progress}>Step 3 / 4</div>
        <h2 style={heading}>Kya kya chahiye? ✨</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"24px"}}>
          {allFeatures.map(f => (
            <button key={f} onClick={() => toggleFeature(f)}
              style={{padding:"8px 14px",borderRadius:"20px",
                border: features.includes(f) ? "2px solid #7c3aed" : "2px solid #333",
                background: features.includes(f) ? "rgba(124,58,237,0.2)" : "#111",
                color: features.includes(f) ? "#a78bfa" : "#888",
                fontSize:"13px",cursor:"pointer"}}>
              {features.includes(f) ? "✓ " : ""}{f}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={() => setStep(2)} style={backBtn}>← Wapas</button>
          <button onClick={() => setStep(4)} style={nextBtn}>Agla Step →</button>
        </div>
      </div>
    </div>
  );

  if (screen === "home" && step === 4) return (
    <div style={wrap}>
      <div style={card}>
        <div style={progress}>Step 4 / 4</div>
        <h2 style={heading}>Last step! 🚀</h2>
        <label style={lbl}>Brand / Business Name</label>
        <input value={brandName} onChange={e=>setBrandName(e.target.value)}
          placeholder="Jaise: Ahmed's Kitchen, Sharma Designs..."
          style={input}/>
        <label style={lbl}>Kuch aur add karna hai? (optional)</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
          placeholder="Jaise: Blue color use karo, Hindi mein content chahiye..."
          rows={3} style={{...input, resize:"none"}}/>
        <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
          <button onClick={() => setStep(3)} style={backBtn}>← Wapas</button>
          <button onClick={generate} style={{...nextBtn,background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>
            ⚡ Website Banao!
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{...wrap,flexDirection:"column"}}>
      <div style={{fontSize:"64px",marginBottom:"20px"}}>⏳</div>
      <h2 style={{marginBottom:"12px"}}>Website ban rahi hai...</h2>
      <p style={{color:"#555",fontFamily:"monospace"}}>{status}</p>
    </div>
  );

  if (screen === "error") return (
    <div style={{...wrap,flexDirection:"column"}}>
      <div style={{fontSize:"52px",marginBottom:"16px"}}>⚠️</div>
      <h2 style={{marginBottom:"12px"}}>Error aa gayi</h2>
      <p style={{color:"#f87171",marginBottom:"24px",fontFamily:"monospace",fontSize:"13px",
        padding:"12px",background:"rgba(239,68,68,0.1)",borderRadius:"8px",maxWidth:"400px",textAlign:"center"}}>
        {error}
      </p>
      <button onClick={()=>{setScreen("home");setStep(1);}} style={nextBtn}>← Wapas Jao</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",padding:"20px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>
        <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap"}}>
          <button onClick={download}
            style={{padding:"10px 20px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            ⬇ Download HTML
          </button>
          <button onClick={()=>{setScreen("home");setStep(1);setPrompt("");setHtml("");setSiteType("");setTheme("");setFeatures([]);setBrandName("");}}
            style={{padding:"10px 20px",background:"#7c3aed",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            + Nai Website
          </button>
        </div>
        <iframe ref={iframe} style={{width:"100%",height:"600px",border:"2px solid #222",borderRadius:"12px",background:"#fff"}}/>
      </div>
    </div>
  );
}

const wrap = {minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"};
const card = {width:"100%",maxWidth:"560px",background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:"16px",padding:"28px"};
const heading = {fontSize:"1.4rem",fontWeight:"800",marginBottom:"20px"};
const progress = {fontSize:"12px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"8px",letterSpacing:"1px"};
const optBox = {padding:"12px",borderRadius:"10px",cursor:"pointer",transition:"all 0.15s"};
const nextBtn = {flex:1,padding:"13px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",borderRadius:"10px",color:"#fff",fontSize:"15px",fontWeight:"700",cursor:"pointer"};
const backBtn = {padding:"13px 20px",background:"#1a1a2e",border:"1px solid #333",borderRadius:"10px",color:"#888",fontSize:"15px",cursor:"pointer"};
const lbl = {display:"block",fontSize:"12px",color:"#555",fontFamily:"monospace",marginBottom:"6px",letterSpacing:"1px"};
const input = {width:"100%",background:"#08080f",border:"2px solid #1e1e35",borderRadius:"10px",color:"#fff",fontSize:"14px",padding:"12px",outline:"none",marginBottom:"16px"};
