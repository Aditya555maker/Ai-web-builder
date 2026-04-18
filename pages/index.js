import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const iframe = useRef(null);

  useEffect(() => {
    if (screen !== "loading") return;
    const msgs = ["🎨 Design ho raha hai...","✍️ HTML likh raha hai...","💅 CSS add ho raha hai...","✨ Almost done..."];
    let i = 0;
    setStatus(msgs[0]);
    const t = setInterval(() => { i = (i+1) % msgs.length; setStatus(msgs[i]); }, 2000);
    return () => clearInterval(t);
  }, [screen]);

  async function generate() {
    if (!prompt.trim()) { alert("Kuch likho pehle!"); return; }
    setScreen("loading");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
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
    a.download = "website.html";
    a.click();
  }

  if (screen === "home") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"580px",textAlign:"center"}}>
        <h1 style={{fontSize:"2.2rem",fontWeight:"800",marginBottom:"8px"}}>⚡ AI Website Builder</h1>
        <p style={{color:"#555",marginBottom:"28px"}}>Prompt likho — poori website tayar!</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Jaise: Dark restaurant website with menu, gallery aur contact form..."
          rows={4}
          style={{width:"100%",background:"#111",border:"2px solid #333",borderRadius:"12px",color:"#fff",fontSize:"15px",padding:"16px",resize:"none",outline:"none",marginBottom:"14px"}}
        />
        <button onClick={generate} style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",borderRadius:"12px",color:"#fff",fontSize:"17px",fontWeight:"700",cursor:"pointer"}}>
          ⚡ Website Banao
        </button>
        <div style={{marginTop:"20px",display:"flex",flexWrap:"wrap",gap:"8px",justifyContent:"center"}}>
          {["Restaurant","Portfolio","Startup","Online Store","Fitness"].map(ex => (
            <button key={ex} onClick={() => setPrompt(ex + " website banao dark theme mein")}
              style={{padding:"7px 14px",background:"#111",border:"1px solid #333",borderRadius:"20px",color:"#888",fontSize:"13px",cursor:"pointer"}}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"64px",marginBottom:"20px"}}>⏳</div>
        <h2 style={{marginBottom:"12px"}}>Website ban rahi hai...</h2>
        <p style={{color:"#555",fontFamily:"monospace"}}>{status}</p>
      </div>
    </div>
  );

  if (screen === "error") return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:"400px"}}>
        <div style={{fontSize:"52px",marginBottom:"16px"}}>⚠️</div>
        <h2 style={{marginBottom:"12px"}}>Error aa gayi</h2>
        <p style={{color:"#f87171",marginBottom:"24px",fontFamily:"monospace",fontSize:"13px",padding:"12px",background:"rgba(239,68,68,0.1)",borderRadius:"8px"}}>{error}</p>
        <button onClick={() => setScreen("home")} style={{padding:"12px 28px",background:"#7c3aed",border:"none",borderRadius:"10px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>← Wapas Jao</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#fff",fontFamily:"sans-serif",padding:"20px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>
        <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap"}}>
          <button onClick={download} style={{padding:"10px 20px",background:"#059669",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>⬇ Download HTML</button>
          <button onClick={() => { setScreen("home"); setPrompt(""); setHtml(""); }} style={{padding:"10px 20px",background:"#7c3aed",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer"}}>+ Nai Website</button>
        </div>
        <iframe ref={iframe} style={{width:"100%",height:"600px",border:"2px solid #222",borderRadius:"12px",background:"#fff"}} />
      </div>
    </div>
  );
  }
