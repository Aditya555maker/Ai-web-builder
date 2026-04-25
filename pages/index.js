import { useState, useRef, useEffect } from "react";
export default function Home() {
  const [screen, setScreen] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editing, setEditing] = useState(false);
  const iframe = useRef(null);

  async function generate() {
    if (!prompt.trim()) { alert("Kuch likho!"); return; }
    setScreen("loading");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHtml(data.html);
      setScreen("result");
      setTimeout(() => { if (iframe.current) iframe.current.srcdoc = data.html; }, 200);
    } catch(e) { setError(e.message); setScreen("error"); }
  }

  async function editWebsite() {
    if (!editPrompt.trim()) { alert("Kya edit karna hai likho!"); return; }
    setEditing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an HTML editor. Here is the website:\n\n${html}\n\nChange: "${editPrompt}"\n\nReturn ONLY complete HTML.`
        })
      });
      const data = await res.json();
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

  if (screen === "home") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"580px",textAlign:"center"}}>
        <h1 style={{fontSize:"2.2rem",fontWeight:"800",marginBottom:"8px"}}>⚡ AI Website Builder</h1>
        <p style={{color:"#555",marginBottom:"28px"}}>Prompt likho — poori website tayar!</p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="Jaise: Dark restaurant website with menu, gallery aur contact form..."
          rows={4} style={{width:"100%",background:"#111",border:"2px solid #333",borderRadius:"12px",color:"#fff",fontSize:"15px",padding:"16px",resize:"none",outline:"none",marginBottom:"14px"}}/>
        <button onClick={generate} style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",borderRadius:"12px",color:"#fff",fontSize:"17px",fontWeight:"700",cursor:"pointer"}}>
          ⚡ Website Banao
        </button>
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{fontSize:"64px",marginBottom:"20px"}}>⏳</div>
      <h2>Website ban rahi hai...</h2>
    </div>
  );

  if (screen === "error") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{fontSize:"52px",marginBottom:"16px"}}>⚠️</div>
      <h2 style={{marginBottom:"12px"}}>Error aa gayi</h2>
      <p style={{color:"#f87171",marginBottom:"24px",padding:"12px",background:"rgba(239,68,68,0.1)",borderRadius:"8px"}}>{error}</p>
      <button onClick={() => setScreen("home")} style={{padding:"12px 28px",background:"#7c3aed",border:"none",borderRadius:"10px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>← Wapas</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",padding:"16px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
          <button onClick={download} style={{padding:"10px 18px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>⬇ Download</button>
          <button onClick={() => { setScreen("home"); setPrompt(""); setHtml(""); }} style={{padding:"10px 18px",background:"#7c3aed",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>+ Nai Website</button>
        </div>
        <div style={{background:"#0e0e1c",border:"1px solid #1e1e35",borderRadius:"12px",padding:"14px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"#7c3aed",marginBottom:"8px"}}>🤖 AI SE EDIT KARO</div>
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
