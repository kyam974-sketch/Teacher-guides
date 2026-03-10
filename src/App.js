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
  const [ea, setEa] = useState(null);
  const [ef, setEf] = useState({});
  const [el, setEl] = useState(0);
  const [lv, setLv] = useState(false);
  const [ci, setCi] = useState(0);
  const [dn, setDn] = useState(new Set());
  const [as2, setAs] = useState(false);
  const [pr, setPr] = useState(false);
  const [scn, setScn] = useState(false);
  const [ss, setSs] = useState("");
  const [exp, setExp] = useState(new Set());
  
  const fr = useRef(null);
  const tr = useRef(null);
  const ar = useRef(null);

  const cl = sc && sp != null && sd != null ? lessons[sc.id + "|" + sp + "|" + sd] : null;

  const svL = useCallback((l) => {
    setL(p => ({ ...p, [l.courseId + "|" + l.part + "|" + l.day]: l }));
  }, []);

  const gT = (a, s) => {
    const [h, m] = s.split(":").map(Number);
    let c = 0;
    return a.filter(x => !x.optional).map(x => {
      const t = h * 60 + m + c;
      c += x.duration;
      return { ...x, st: `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}` };
    });
  };

  const td = a => a.filter(x => !x.optional).reduce((s, x) => s + x.duration, 0);
  const ft = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const goH = () => { setV("home"); setSc(null); setSp(null); setSd(null); setLv(false); setDn(new Set()); };
  const togExp = id => { setExp(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

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
      setSs("AI analizza...");
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
              { type: "text", text: `Analizza la lezione Kids&Us per ${sc.name}. Rispondi solo in JSON.` }
            ]
          }]
        })
      });
      const d = await res.json();
      const txt = d.content[0].text;
      let parsed = JSON.parse(txt.match(/\[[\s\S]*\]/)[0]);
      const acts = parsed.map((p, i) => ({
        id: "s" + Date.now() + "_" + i,
        name: p.name || "?",
        duration: p.duration || 3,
        tracks: p.tracks || "",
        targetLanguage: p.target_language || "",
        description: p.description || "",
        materials: p.materials || "",
        optional: !!p.optional,
        sub: p.sub || null
      }));
      svL({ courseId: sc.id, part: sp, day: sd, activities: acts });
      setSs("Fatto!");
      setTimeout(() => { setSs(""); setScn(false); }, 3000);
    } catch (e) {
      setSs("Errore: " + e.message);
      setTimeout(() => { setSs(""); setScn(false); }, 4000);
    }
  };

  if (pr && cl) {
    const ti = gT(cl.activities, st);
    return (
      <div style={{ padding: 20, fontFamily: "Nunito" }}>
        <button onClick={() => setPr(false)}>Chiudi</button>
        <h2>{sc.name} - Day {sd}</h2>
        {cl.activities.map(a => (
          <div key={a.id} style={{ borderBottom: "1px solid #eee", padding: 10 }}>
            <b>{a.name}</b> - {a.duration}m
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Nunito", background: "#FAFAF7", padding: 20 }}>
      {view === "home" && (
        <div>
          <h2>Ciao Chiara! 👋</h2>
          {CS.map(c => (
            <div key={c.id} onClick={() => { setSc(c); setV("course"); }} style={{ background: "#fff", padding: 15, margin: "10px 0", borderRadius: 12, borderLeft: "5px solid " + c.color, cursor: "pointer" }}>
              {c.em} {c.name}
            </div>
          ))}
        </div>
      )}

      {view === "course" && sc && (
        <div>
          <button onClick={goH}>Indietro</button>
          <h2>{sc.em} {sc.name}</h2>
          {sc.parts.map(p => (
            <div key={p}>
              <h4>{p}</h4>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[...Array(sc.dp)].map((_, i) => (
                  <button key={i} onClick={() => { setSp(p); setSd(i + 1); setV("lesson"); }}>{i + 1}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "lesson" && (
        <div>
          <button onClick={() => setV("course")}>Indietro</button>
          <h2>Day {sd}</h2>
          <input type="file" multiple onChange={(e) => scanD(e.target.files)} />
          {scn && <div>{ss}</div>}
          {cl && cl.activities.map(a => (
            <div key={a.id} style={{ background: "#fff", padding: 10, margin: "5px 0", borderRadius: 8 }}>
              <b>{a.name}</b> ({a.duration}m)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  btn: { padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800 },
  sm: { width: 24, height: 24, borderRadius: 6, border: "1px solid #eee", background: "#fafafa" }
};
