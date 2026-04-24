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
  const [editPrompt, setEditPrompt] = useState("");
  const [editing, setEditing] = useState(false);
  const [photos, setPhotos] = useState([]); // uploaded photos
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const iframe = useRef(null);
  const fileInput = useRef(null);

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

  // Convert image to base64
  function toBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  // Upload photos
  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    const newPhotos = [];
    for (const file of files) {
      const base64 = await toBase64(file);
      newPhotos.push({ name: file.name, url: base64, type: "logo" });
    }
    setPhotos(prev => [...prev, ...newPhotos]);
  }

  // Set photo type
  function setPhotoType(index, type) {
    setPhotos(prev => prev.map((p, i) => i === index ? {...p, type} : p));
  }

  // Remove photo
  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  // Insert photo into website via AI
  async function insertPhoto(photo) {
    setEditing(true);
    const typeText = photo.type === "logo" ? "logo/header image" : photo.type === "bg" ? "background image of hero section" : "gallery image";
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an HTML editor. Here is the current website HTML:

${html}

Add this base64 image as the ${typeText}: ${photo.url}

RULES:
1. Return COMPLETE updated HTML
2. Only add the image in the correct place
3. Return ONLY raw HTML starting with <!DOCTYPE html>
4. No markdown, no explanation`
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHtml(data.html);
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
      alert("✅ Photo add ho gayi!");
    } catch(e) {
      alert("Error: " + e.message);
    } finally {
      setEditing(false);
    }
  }

  async function generate() {
    setScreen("loading");
    const photoInfo = photos.length > 0 ? `\nUser has provided these images - use them: ${photos.map(p => `${p.type}: ${p.url}`).join(", ")}` : "";
    const fullPrompt = `Create a complete beautiful single-page HTML website.
Type: ${siteType} website
Theme: ${theme} color theme
Brand Name: ${brandName || "My Brand"}
Extra description: ${prompt || "Make it professional"}
Must include these sections: ${features.length > 0 ? features.join(", ") : "Hero, Navigation, Services, Contact, Footer"}
${photoInfo}
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

  async function editWebsite() {
    if (!editPrompt.trim()) { alert("Kya edit karna hai likho!"); return; }
    setEditing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an HTML editor. Here is an existing website HTML:

${html}

The user wants to make this change: "${editPrompt}"

RULES:
1. Return the COMPLETE updated HTML file
2. Only make the requested changes, keep everything else exactly the same
3. Return ONLY raw HTML starting with <!DOCTYPE html>
4. No markdown, no explanation`
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setHtml(data.html);
      setEditPrompt("");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) {
      alert("Edit error: " + e.message);
    } finally {
      setEditing(false);
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = (brandName || "website") + ".html";
    a.click();
  }

  function reset() {
    setScreen("home"); setStep(1); setPrompt(""); setHtml("");
    setSiteType(""); setTheme(""); setFeatures([]); setBrandName("");
    setEditPrompt(""); setPhotos([]); setShowPhotoPanel(false);
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
          rows={2} style={{...input, resize:"none"}}/>

        {/* Photo Upload in Step 4 */}
        <label style={lbl}>📸 Photos Upload karo (optional)</label>
        <div style={{background:"#08080f",border:"2px dashed #1e1e35",borderRadius:"10px",padding:"16px",marginBottom:"16px",textAlign:"center"}}>
          <input ref={fileInput} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{display:"none"}}/>
          <button onClick={() => fileInput.current.click()}
            style={{padding:"10px 20px",background:"#1a1a2e",border:"1px solid #333",borderRadius:"8px",color:"#a78bfa",cursor:"pointer",fontSize:"14px"}}>
            📷 Photos Choose Karo
          </button>
          {photos.length > 0 && (
            <div style={{marginTop:"12px",display:"flex",flexWrap:"wrap",gap:"8px",justifyContent:"center"}}>
              {photos.map((p, i) => (
                <div key={i} style={{background:"#1a1a2e",borderRadius:"8px",padding:"8px",width:"80px",textAlign:"center"}}>
                  <img src={p.url} style={{width:"60px",height:"60px",objectFit:"cover",borderRadius:"6px"}}/>
                  <select value={p.type} onChange={e => setPhotoType(i, e.target.value)}
                    style={{width:"100%",background:"#0a0a14",border:"1px solid #333",color:"#fff",fontSize:"10px",borderRadius:"4px",marginTop:"4px",padding:"2px"}}>
                    <option value="logo">Logo</option>
                    <option value="bg">Background</option>
                    <option value="gallery">Gallery</option>
                  </select>
                  <button onClick={() => removePhoto(i)}
                    style={{marginTop:"4px",background:"#ff4444",border:"none",borderRadius:"4px",color:"#fff",fontSize:"10px",padding:"2px 6px",cursor:"pointer"}}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:"10px"}}>
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
      <h2 style={{marginBottom:"12px"}}>
        {editing ? "Edit ho rahi hai..." : "Website ban rahi hai..."}
      </h2>
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
      <button onClick={reset} style={nextBtn}>← Wapas Jao</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",padding:"16px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>

        {/* Top Buttons */}
        <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
          <button onClick={download}
            style={{padding:"10px 18px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            ⬇ Download
          </button>
          <button onClick={() => setShowPhotoPanel(!showPhotoPanel)}
            style={{padding:"10px 18px",background:showPhotoPanel?"#7c3aed":"#1a1a2e",border:"1px solid #333",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            📸 Photos
          </button>
          <button onClick={reset}
            style={{padding:"10px 18px",background:"#7c3aed",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>
            + Nai Website
          </button>
        </div>

        {/* Photo Panel */}
        {showPhotoPanel && (
          <div style={{background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:"12px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"10px",letterSpacing:"1px"}}>
              📸 PHOTO MANAGER
            </div>
            <input ref={fileInput} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{display:"none"}}/>
            <button onClick={() => fileInput.current.click()}
              style={{padding:"8px 16px",background:"#1a1a2e",border:"1px solid #333",borderRadius:"8px",color:"#a78bfa",cursor:"pointer",fontSize:"13px",marginBottom:"12px"}}>
              + Nai Photo Upload
            </button>
            {photos.length === 0 ? (
              <p style={{color:"#333",fontSize:"13px",fontFamily:"monospace"}}>Koi photo nahi — upar se upload karo!</p>
            ) : (
              <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
                {photos.map((p, i) => (
                  <div key={i} style={{background:"#1a1a2e",borderRadius:"10px",padding:"10px",textAlign:"center",width:"100px"}}>
                    <img src={p.url} style={{width:"80px",height:"80px",objectFit:"cover",borderRadius:"8px",marginBottom:"6px"}}/>
                    <select value={p.type} onChange={e => setPhotoType(i, e.target.value)}
                      style={{width:"100%",background:"#0a0a14",border:"1px solid #333",color:"#fff",fontSize:"11px",borderRadius:"4px",marginBottom:"6px",padding:"3px"}}>
                      <option value="logo">🏷️ Logo</option>
                      <option value="bg">🖼️ Background</option>
                      <option value="gallery">🖼️ Gallery</option>
                    </select>
                    <div style={{display:"flex",gap:"4px",justifyContent:"center"}}>
                      <button onClick={() => insertPhoto(p)} disabled={editing}
                        style={{padding:"4px 8px",background:editing?"#333":"#7c3aed",border:"none",borderRadius:"5px",color:"#fff",fontSize:"11px",cursor:"pointer"}}>
                        {editing?"...":"Add"}
                      </button>
                      <button onClick={() => removePhoto(i)}
                        style={{padding:"4px 8px",background:"#ff4444",border:"none",borderRadius:"5px",color:"#fff",fontSize:"11px",cursor:"pointer"}}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Edit Box */}
        <div style={{background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:"12px",padding:"14px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"#7c3aed",fontFamily:"monospace",marginBottom:"8px",letterSpacing:"1px"}}>
            🤖 AI SE EDIT KARO
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <input value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter") editWebsite(); }}
              placeholder="Jaise: Header blue karo, Price ₹999 karo, Footer mein number add karo..."
              style={{flex:1,background:"#08080f",border:"1px solid #1e1e35",borderRadius:"8px",color:"#fff",fontSize:"14px",padding:"10px 12px",outline:"none"}}/>
            <button onClick={editWebsite} disabled={editing}
              style={{padding:"10px 18px",background:editing?"#333":"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:editing?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
              {editing ? "⏳..." : "✏️ Edit"}
            </button>
          </div>
          <div style={{marginTop:"8px",display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {["Header color badlo","WhatsApp button add karo","Price update karo","Dark theme karo","Contact form add karo","Font badlo"].map(s => (
              <button key={s} onClick={() => setEditPrompt(s)}
                style={{padding:"4px 10px",background:"#1a1a2e",border:"
