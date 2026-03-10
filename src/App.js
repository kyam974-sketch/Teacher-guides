import React, { useState, useEffect, useRef, useCallback } from "react";

const CS = [
  {id:"mousy",name:"Mousy",color:"#8CB43B",bg:"#F0F7E1",em:"\u{1F42D}",age:"1 anno",parts:["Part One","Part Two","Part Three","Part Four"],dp:10},
  {id:"linda",name:"Linda",color:"#F26522",bg:"#FFF0E6",em:"\u{1F431}",age:"2 anni",parts:["Part One","Part Two","Part Three","Part Four"],dp:10},
  {id:"sam",name:"Sam",color:"#00B3B0",bg:"#E0F7F7",em:"\u{1F9F8}",age:"3 anni",parts:["Story 1: Happy Birthday","Story 2: The Park","Story 3: The Zoo","Story 4: The Picnic"],dp:10},
  {id:"emma",name:"Emma",color:"#E878A0",bg:"#FFF0F5",em:"\u{1F98B}",age:"4 anni",parts:["Story 1: Sweets","Story 2: Eggs","Story 3: Bath","Story 4"],dp:10},
  {id:"oliver",name:"Oliver",color:"#00B3B0",bg:"#E0F7F7",em:"\u{1F438}",age:"5 anni",parts:["Story 1: Wobbly Tooth","Story 2: Flu","Story 3: Baby","Story 4"],dp:10},
  {id:"marcia",name:"Marcia",color:"#E94E58",bg:"#FFEBEE",em:"\u{1F380}",age:"6 anni",parts:["Story 1: The Alien","Story 2: Polly Goes to School","Story 3: The Ski Trip","Story 4: The Birthday Cake"],dp:10}
];

export default function App() {
  const [view, setV] = useState("home");
  const [lessons, setL] = useState({});
  const [sc, setSc] = useState(null);
  const [sp, setSp] = useState(null);
  const [sd, setSd] = useState(null);
  const [st, setSt] = useState("17:00");
  const [ld, setLd] = useState(false);
  const [el, setEl] = useState(0);
  const [lv, setLv] = useState(false);
  const [scn, setScn] = useState(false);
  const [ss, setSs] = useState("");
  
  const fr = useRef(null);

  const svL = useCallback((l) => {
    setL(p => ({ ...p, [l.courseId + "|" + l.part + "|" + l.day]: l }));
  }, []);

  const scanD = async (files) => {
    if (!files || !files.length || !sc || !sp || !sd) return;
    setScn(true); setSs("Lettura...");
    try {
      const imgs = [];
      for (const f of files) {
        const b = await new Promise((r, j) => {
          const rd = new FileReader();
          rd.onload = () => r(rd.result.split(",")[1]);
          rd.onerror = j;
          rd.readAsDataURL(f);
        });
        const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        imgs.push({
          type: isPdf ? "document" : "image",
          source: { type: "base64", media_type: isPdf ? "application/pdf" : "image/jpeg", data: b }
        });
      }
      setSs("Analisi AI...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: [
              ...imgs,
              { type: "text", text: "Estrai la lezione Kids&Us. Rispondi in JSON: [{name, duration, description, targetLanguage}]" }
            ]
          }]
        })
      });
      const d = await res.json();
      const txt = d.content[0].text;
      const parsed = JSON.parse(txt.match(/\[[\s\S]*\]/)[0]);
      svL({ courseId: sc.id, part: sp, day: sd, activities: parsed });
      setSs("Fatto!");
      setTimeout(() => setScn(false), 3000);
    } catch (e) {
      setSs("Errore: " + e.message);
      setTimeout(() => setScn(false), 4000);
    }
  };

  const cl = sc && sp != null && sd != null ? lessons[sc.id + "|" + sp + "|" + sd] : null;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Nunito, sans-serif", padding: 20, background: "#FAFAF7" }}>
      {view === "home" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 900, marginBottom: 20 }}>Ciao Chiara! 👋</h2>
          {CS.map(c => (
            <div key={c.id} onClick={() => { setSc(c); setV("course"); }} style={{ background: "#fff", padding: 20, marginBottom: 12, borderRadius: 16, borderLeft: "6px solid " + c.color, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 24, marginRight: 10 }}>{c.em}</span>
              <b style={{ fontSize: 18 }}>{c.name}</b>
            </div>
          ))}
        </div>
      )}

      {view === "course" && sc && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button onClick={() => setV("home")} style={{ marginBottom: 20, border: "none", background: "none", cursor: "pointer", fontWeight: 800 }}>← Indietro</button>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 25 }}>
             <div style={{ width: 60, height: 60, background: sc.bg, borderRadius: 15, display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 30 }}>{sc.em}</div>
             <h2 style={{ fontWeight: 900 }}>{sc.name}</h2>
          </div>
          {sc.parts.map(p => (
            <div key={p} style={{ marginBottom: 20 }}>
              <h4 style={{ color: sc.color, marginBottom: 10 }}>{p}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 8 }}>
                {[...Array(sc.dp)].map((_, i) => (
                  <button key={i} onClick={() => { setSp(p); setSd(i + 1); setV("lesson"); }} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", background: "#fff", fontWeight: 800, cursor: "pointer" }}>{i + 1}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "lesson" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <button onClick={() => setV("course")} style={{ marginBottom: 20, border: "none", background: "none", cursor: "pointer", fontWeight: 800 }}>← Indietro</button>
          <h2 style={{ color: sc.color, fontWeight: 900 }}>Day {sd}</h2>
          <div style={{ background: "#fff", padding: 25, borderRadius: 20, textAlign: "center", border: "1px solid #eee", marginBottom: 20 }}>
            <input type="file" multiple onChange={(e) => scanD(e.target.files)} style={{ display: "none" }} ref={fr} />
            <button onClick={() => fr.current.click()} style={{ background: "#F26522", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>📸 SCANSIONA TG</button>
          </div>
          {scn && <div style={{ padding: 15, background: "#FFF3E0", borderRadius: 10, marginBottom: 15, fontWeight: 700 }}>{ss}</div>}
          {cl && cl.activities.map((a, i) => (
            <div key={i} style={{ background: "#fff", padding: 15, marginBottom: 10, borderRadius: 12, borderLeft: "4px solid " + sc.color }}>
              <b style={{ display: "block", marginBottom: 4 }}>{a.name}</b>
              <p style={{ fontSize: 13, color: "#666" }}>{a.description}</p>
              {a.targetLanguage && <div style={{ marginTop: 8, padding: 8, background: "#FFFDE7", borderRadius: 6, fontSize: 11, borderLeft: "3px solid " + sc.color }}><b>Target:</b> {a.targetLanguage}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
