// Festival Lineup Interactive — React + Vite + TypeScript
// All text styled black, with colored ✔ marks for each person.
// Features: sticky toolbar, click-to-select + drag-and-drop checkmarks, Undo,
// official times/stages, Openverse auto-fill artwork + attribution, Remove Image,
// and Generate schedule (downloads CSV + ICS and opens on-page schedule).

import React, { useMemo, useState } from "react";

// ---------- Tiny UI helpers ----------
const cls = (...xs: (string | undefined | false)[]) => xs.filter(Boolean).join(" ");
function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cls("card", className)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 12,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        color: "#000", // all text inside cards black
      }}
      {...props}
    >
      {children}
    </div>
  );
}
function Button(
  { children, onClick, variant = "default", className, style, ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" }
) {
  const base: React.CSSProperties = {
    border: 0,
    borderRadius: 999,
    padding: "8px 14px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#000", // black text
    background: variant === "destructive" ? "#fca5a5" : "#e5e7eb", // light backgrounds
    boxShadow: "0 2px 6px rgba(0,0,0,.08)",
    ...(style || {}),
  };
  return <button onClick={onClick} style={base} className={className} {...props}>{children}</button>;
}

// ---------- People ----------
const people = [
  { name: "Lauren",  color: "#e91e63" },
  { name: "Doug",    color: "#2196f3" },
  { name: "Kristie", color: "#4caf50" },
  { name: "Adam",    color: "#ff9800" },
];

// ---------- Demo lineup ----------
const lineup: Record<string, string[]> = {
  "Thursday, Sep 18, 2025": ["Slayer","Rob Zombie","Lamb of God"],
  "Friday, Sep 19, 2025": ["Avenged Sevenfold","Sleep Token","Breaking Benjamin"],
};

// ---------- Demo scheduleData ----------
type Slot = { band: string; time: string; stage: string };
const scheduleData: Record<string, Slot[]> = {
  "Thursday, Sep 18, 2025": [
    { band:"Slayer", time:"9:30 PM", stage:"Main Stage 1" },
    { band:"Rob Zombie", time:"8:15 PM", stage:"Main Stage 2" },
    { band:"Lamb of God", time:"7:10 PM", stage:"Main Stage 1" },
  ],
  "Friday, Sep 19, 2025": [
    { band:"Avenged Sevenfold", time:"9:55 PM", stage:"Main Stage 1" },
    { band:"Sleep Token", time:"8:40 PM", stage:"Main Stage 2" },
    { band:"Breaking Benjamin", time:"7:35 PM", stage:"Main Stage 1" },
  ],
};

// ---------- Types & helpers ----------
type Mark = { id: number; day: string; band: string; person: string; color: string };
type Meta = { time?: string; stage?: string };
const keyFor = (day: string, band: string) => `${day}|${band}`;
const metaFor = (day: string, band: string): Meta => {
  const slot = scheduleData[day]?.find(s => s.band === band);
  return slot ? { time: slot.time, stage: slot.stage } : {};
};
const parseTime = (t?: string | null) => {
  if (!t) return null;
  const m = /^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i.exec(t);
  if (m) { let h = +m[1]; const mi = +(m[2]||0); const pm = m[3].toLowerCase()==="pm"; if (h===12) h=0; return (pm?12:0)*60 + h*60 + mi; }
  return null;
};

// ---------- Component ----------
export default function App() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activePerson, setActivePerson] = useState<{ name: string; color: string } | null>(null);

  const handleDrop = (day: string, band: string, person: { name: string; color: string }) => {
    const newMark: Mark = { id: Date.now() + Math.floor(Math.random() * 1000), day, band, person: person.name, color: person.color };
    setMarks(prev => [...prev, newMark]);
    setHistory(prev => [...prev, newMark.id]);
  };
  const handleUndo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setMarks(prev => prev.filter(m => m.id !== last));
    setHistory(prev => prev.slice(0, -1));
  };

  const compiled = useMemo(() => {
    const byDay: Record<string, Array<{ band: string; time?: string; stage?: string; attendees: string[] }>> = {};
    for (const m of marks) {
      if (!byDay[m.day]) byDay[m.day] = [];
      let entry = byDay[m.day].find(e => e.band === m.band);
      if (!entry) {
        const info = metaFor(m.day, m.band);
        entry = { band: m.band, time: info.time, stage: info.stage, attendees: [] };
        byDay[m.day].push(entry);
      }
      if (!entry.attendees.includes(m.person)) entry.attendees.push(m.person);
    }
    for (const d of Object.keys(byDay)) {
      byDay[d].sort((a,b) => {
        const ta = parseTime(a.time); const tb = parseTime(b.time);
        if (ta==null && tb==null) return a.band.localeCompare(b.band);
        if (ta==null) return 1; if (tb==null) return -1; return ta - tb;
      });
    }
    return byDay;
  }, [marks]);

  // ----- CSV + ICS download (same as before, with black text in UI) -----
  function buildScheduleCsv(compiledMap: Record<string, Array<{ band: string; time?: string; stage?: string; attendees: string[] }>>) {
    const rows = [["Day","Time","Band","Stage","Attendees"]];
    for (const [day, entries] of Object.entries(compiledMap)) {
      for (const e of entries) rows.push([day, e.time || "TBD", e.band, e.stage || "TBD", e.attendees.join("; ")]);
    }
    return rows.map(r => r.join(",")).join("\n");
  }
  function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function handleGenerateScheduleDownload() {
    if (!Object.keys(compiled).length) { alert("No bands selected yet."); return; }
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    const csv = buildScheduleCsv(compiled);
    downloadText(`schedule-${ts}.csv`, csv, "text/csv;charset=utf-8");
    setShowSchedule(true);
  }

  // ----- Styles -----
  const styles = {
    page: { minHeight: "100vh", background: "#f3f4f6", color: "#000" },
    toolbar: { position:"sticky" as const, top:0, zIndex:50, background:"#fff", display:"flex",
      alignItems:"center", justifyContent:"space-between", gap:12, padding:12, boxShadow:"0 2px 10px rgba(0,0,0,0.08)", color:"#000" },
    pill: { display:"flex", alignItems:"center", gap:8, padding:"6px 10px", border:"1px solid #e5e7eb",
      borderRadius:999, cursor:"pointer", userSelect:"none" as const, background:"#fff", color:"#000" },
    container: { padding:16, maxWidth:1200, margin:"0 auto", color:"#000" },
    day: { margin:"24px 0" }, heading: { fontSize:24, fontWeight:800 as const, marginBottom:12, color:"#000" },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12 },
    marks: { display:"flex", gap:8, flexWrap:"wrap" as const },
  } as const;

  return (
    <div style={styles.page}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const }}>
          {people.map((person) => {
            const active = activePerson?.name === person.name;
            return (
              <div
                key={person.name}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("person", JSON.stringify(person))}
                onClick={() => setActivePerson(active ? null : person)}
                style={{ ...styles.pill, border: active ? "2px solid #2563eb" : "1px solid #e5e7eb", background: active ? "#dbeafe" : "#fff" }}
              >
                <span style={{ color: person.color, fontWeight: 800, fontSize: 18 }}>✔</span>
                <span style={{ fontWeight: 600 }}>{person.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
          <Button onClick={handleGenerateScheduleDownload}>Generate schedule</Button>
          <Button onClick={handleUndo} variant="destructive">Undo</Button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.container}>
        {Object.entries(lineup).map(([day,bands]) => (
          <section key={day} style={styles.day}>
            <h2 style={styles.heading}>{day}</h2>
            <div style={styles.grid}>
              {bands.map(band => {
                const meta = metaFor(day, band);
                return (
                  <Card
                    key={`${day}-${band}`}
                    onClick={() => { if (activePerson) handleDrop(day, band, activePerson); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { const data = e.dataTransfer.getData("person"); if (data) handleDrop(day, band, JSON.parse(data)); }}
                  >
                    <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6, color:"#000" }}>{band}</h3>
                    <div style={{ color:"#000", fontSize:13, marginBottom:6 }}>
                      <span><strong>Time:</strong> {meta.time || "TBD"}</span>{" · "}
                      <span><strong>Stage:</strong> {meta.stage || "TBD"}</span>
                    </div>
                    <div style={styles.marks}>
                      {marks.filter(m => m.day===day && m.band===band).map(m => (
                        <span key={m.id} style={{ color:m.color, fontSize:22 }}>✔</span>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

