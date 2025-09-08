// Festival Lineup Interactive — React + Vite + TypeScript
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
    border: 0, borderRadius: 999, padding: "8px 14px", fontWeight: 600,
    cursor: "pointer", color: "#fff",
    background: variant === "destructive" ? "#e11d48" : "#111827",
    boxShadow: "0 2px 6px rgba(0,0,0,.08)", ...(style || {}),
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

// ---------- Full lineup by day ----------
const lineup: Record<string, string[]> = {
  "Thursday, Sep 18, 2025": [
    "Slayer","Rob Zombie","Marilyn Manson","Lamb of God","Down","Lorna Shore","The Story So Far",
    "Cannibal Corpse","Cavalera","Neck Deep","XweaponX","Kublai Khan TX","Exodus","State Champs",
    "Drain","From Ashes To New","Atreyu","Carcass","Municipal Waste","Haywire 617","The Black Dahlia Murder",
    "Fear Factory","Four Year Strong","Set It Off","Winds of Plague","Landmvrks","Brand of Sacrifice",
    "Catch Your Breath","Sanguisugabogg","Silly Goose","Full of Hell","Gideon","Left to Suffer","Guilt Trip",
    "If Not For Me","Colorblind","Fulci","Not Enough Space","PeelingFlesh","Mugshot","Snuffed on Sight",
    "Big Ass Truck","Imperial Tide","Sicksense",
  ],
  "Friday, Sep 19, 2025": [
    "Avenged Sevenfold","Sleep Token","Breaking Benjamin","Mudvayne","Spiritbox","All Time Low","Dream Theater",
    "Hollywood Undead","Insane Clown Posse","Dayseeker","Powerwolf","Pvris","Story of the Year","Static-X",
    "Hatebreed","Imminence","DragonForce","Alestorm","Whitechapel","Unearth","Suicide Silence","Dope",
    "Violent Vira","Hot Milk","Demon Hunter","Northlane","Gloryhammer","Of Mice & Men","Upon a Burning Body",
    "Magnolia Park","Red Jumpsuit Apparatus","Convictions","Miss May I","Thrown","War of Ages","Nonpoint",
    "Walls of Jericho","Thornhill","Liliac","Ded","Islander","Aurorawave","Savage Hands","Uncured","X-Comm",
  ],
  "Saturday, Sep 20, 2025": [
    "Deftones","Bad Omens","A Perfect Circle","I Prevail","Acid Bath","Stone Temple Pilots","Motionless In White",
    "Cypress Hill","Trivium","Chiodos","Black Veil Brides","Machine Head","Chimaira","Letlive","Left For Last",
    "August Burns Red","Ashes Remain","Superheaven","Fleshwater","Kittie","Blessthefall","Failure","Attack Attack!",
    "DevilDriver","Fight From Within","Stabbing Westward","Woe, Is Me","Spineshank","The Browning","Hawthorne Heights",
    "From First To Last","Snot","Quannic","The Funeral Portrait","The Union Underground","SpiritWorld","Ra",
    "Return to Dust","Disembodied Tyrant","Small Town Titans","Smile Empty Soul","Halocene","Versus Me",
  ],
  "Sunday, Sep 21, 2025": [
    "Bring Me The Horizon","$uicideboy$","Evanescence","Knocked Loose","In This Moment","Three Days Grace",
    "Bruce Dickinson","Slaughter to Prevail","Wage War","Flyleaf (with Lacey Sturm)","Testament","Tech N9ne",
    "Glassjaw","We Came as Romans","Crossfade","Crown the Empire","The Dillinger Escape Plan","Queensrÿche",
    "Sebastian Bach","Rev Theory","Accept","156/Silence","Hinder","Counterparts","Orthodox","Yngwie Malmsteen",
    "Memphis May Fire","The Plot in You","Escape the Fate","10 Years","Fox Lake","12 Stones","Dying Wish",
    "Sleep Theory","Norma Jean","It Dies Today","Chained Saint","Gates To Hell","Wargasm","Amira Elfeky",
    "The Haunt","Kami Kehoe","Picturesque","Enmy",
  ],
};

// ---------- Official set times & stages ----------
type Slot = { band: string; time: string; stage: string };
const scheduleData: Record<string, Slot[]> = {
  "Thursday, Sep 18, 2025": [
    // Main 1
    { band:"Slayer", time:"9:30 PM", stage:"Main Stage 1" },
    { band:"Lamb of God", time:"7:10 PM", stage:"Main Stage 1" },
    { band:"Down", time:"5:20 PM", stage:"Main Stage 1" },
    { band:"Cavalera", time:"3:50 PM", stage:"Main Stage 1" },
    { band:"Carcass", time:"2:35 PM", stage:"Main Stage 1" },
    { band:"Municipal Waste", time:"1:25 PM", stage:"Main Stage 1" },
    { band:"Winds of Plague", time:"12:15 PM", stage:"Main Stage 1" },
    // Main 2
    { band:"Rob Zombie", time:"8:15 PM", stage:"Main Stage 2" },
    { band:"Marilyn Manson", time:"6:05 PM", stage:"Main Stage 2" },
    { band:"Cannibal Corpse", time:"4:35 PM", stage:"Main Stage 2" },
    { band:"Exodus", time:"3:10 PM", stage:"Main Stage 2" },
    { band:"The Black Dahlia Murder", time:"2:00 PM", stage:"Main Stage 2" },
    { band:"Fear Factory", time:"12:50 PM", stage:"Main Stage 2" },
    { band:"Fulci", time:"11:45 AM", stage:"Main Stage 2" },
    // Decibel
    { band:"Lorna Shore", time:"8:30 PM", stage:"Decibel Stage" },
    { band:"Kublai Khan TX", time:"7:00 PM", stage:"Decibel Stage" },
    { band:"Brand of Sacrifice", time:"5:40 PM", stage:"Decibel Stage" },
    { band:"Sanguisugabogg", time:"4:30 PM", stage:"Decibel Stage" },
    { band:"Full of Hell", time:"3:20 PM", stage:"Decibel Stage" },
    { band:"Left to Suffer", time:"2:10 PM", stage:"Decibel Stage" },
    { band:"Not Enough Space", time:"1:10 PM", stage:"Decibel Stage" },
    // Reverb
    { band:"The Story So Far", time:"7:45 PM", stage:"Reverb Stage" },
    { band:"Neck Deep", time:"6:15 PM", stage:"Reverb Stage" },
    { band:"State Champs", time:"5:05 PM", stage:"Reverb Stage" },
    { band:"Drain", time:"3:55 PM", stage:"Reverb Stage" },
    { band:"Four Year Strong", time:"2:45 PM", stage:"Reverb Stage" },
    { band:"Gideon", time:"1:40 PM", stage:"Reverb Stage" },
    { band:"Guilt Trip", time:"12:40 PM", stage:"Reverb Stage" },
    // Loudmouth
    { band:"From Ashes To New", time:"7:00 PM", stage:"Loudmouth Stage" },
    { band:"Atreyu", time:"5:40 PM", stage:"Loudmouth Stage" },
    { band:"Set It Off", time:"4:30 PM", stage:"Loudmouth Stage" },
    { band:"Catch Your Breath", time:"3:20 PM", stage:"Loudmouth Stage" },
    { band:"Landmvrks", time:"2:10 PM", stage:"Loudmouth Stage" },
    { band:"Colorblind", time:"1:10 PM", stage:"Loudmouth Stage" },
    { band:"If Not For Me", time:"12:05 PM", stage:"Loudmouth Stage" },
    // Big Bourbon Bar
    { band:"PeelingFlesh", time:"5:40 PM", stage:"Big Bourbon Bar" },
    { band:"Mugshot", time:"4:30 PM", stage:"Big Bourbon Bar" },
    { band:"Snuffed on Sight", time:"3:20 PM", stage:"Big Bourbon Bar" },
    { band:"Big Ass Truck", time:"2:10 PM", stage:"Big Bourbon Bar" },
    { band:"Imperial Tide", time:"1:10 PM", stage:"Big Bourbon Bar" },
    { band:"Sicksense", time:"12:05 PM", stage:"Big Bourbon Bar" },
    // Kingdom
    { band:"XweaponX", time:"8:15 PM", stage:"Kingdom Stage" },
    { band:"Haywire 617", time:"5:05 PM", stage:"Kingdom Stage" },
    { band:"Silly Goose", time:"2:45 PM", stage:"Kingdom Stage" },
  ],
  "Friday, Sep 19, 2025": [
    // Main 1
    { band:"Avenged Sevenfold", time:"9:55 PM", stage:"Main Stage 1" },
    { band:"Breaking Benjamin", time:"7:35 PM", stage:"Main Stage 1" },
    { band:"Mudvayne", time:"5:50 PM", stage:"Main Stage 1" },
    { band:"Insane Clown Posse", time:"4:20 PM", stage:"Main Stage 1" },
    { band:"Static-X", time:"3:05 PM", stage:"Main Stage 1" },
    { band:"Dope", time:"1:55 PM", stage:"Main Stage 1" },
    { band:"Nonpoint", time:"12:45 PM", stage:"Main Stage 1" },
    // Main 2
    { band:"Sleep Token", time:"8:40 PM", stage:"Main Stage 2" },
    { band:"Spiritbox", time:"6:40 PM", stage:"Main Stage 2" },
    { band:"Dayseeker", time:"5:05 PM", stage:"Main Stage 2" },
    { band:"Pvris", time:"3:40 PM", stage:"Main Stage 2" },
    { band:"Imminence", time:"2:30 PM", stage:"Main Stage 2" },
    { band:"Northlane", time:"1:20 PM", stage:"Main Stage 2" },
    { band:"Violent Vira", time:"12:10 PM", stage:"Main Stage 2" },
    // Decibel
    { band:"All Time Low", time:"9:05 PM", stage:"Decibel Stage" },
    { band:"Hollywood Undead", time:"7:20 PM", stage:"Decibel Stage" },
    { band:"Story of the Year", time:"5:45 PM", stage:"Decibel Stage" },
    { band:"Of Mice & Men", time:"4:15 PM", stage:"Decibel Stage" },
    { band:"Magnolia Park", time:"3:00 PM", stage:"Decibel Stage" },
    { band:"Red Jumpsuit Apparatus", time:"1:50 PM", stage:"Decibel Stage" },
    { band:"Hot Milk", time:"12:40 PM", stage:"Decibel Stage" },
    // Reverb
    { band:"Dream Theater", time:"8:10 PM", stage:"Reverb Stage" },
    { band:"Powerwolf", time:"6:30 PM", stage:"Reverb Stage" },
    { band:"DragonForce", time:"5:00 PM", stage:"Reverb Stage" },
    { band:"Alestorm", time:"3:35 PM", stage:"Reverb Stage" },
    { band:"Demon Hunter", time:"2:25 PM", stage:"Reverb Stage" },
    { band:"Gloryhammer", time:"1:15 PM", stage:"Reverb Stage" },
    { band:"Liliac", time:"12:10 PM", stage:"Reverb Stage" },
    // Loudmouth
    { band:"Hatebreed", time:"7:20 PM", stage:"Loudmouth Stage" },
    { band:"Whitechapel", time:"6:00 PM", stage:"Loudmouth Stage" },
    { band:"Suicide Silence", time:"5:00 PM", stage:"Loudmouth Stage" },
    { band:"Miss May I", time:"4:00 PM", stage:"Loudmouth Stage" },
    { band:"Thrown", time:"3:05 PM", stage:"Loudmouth Stage" },
    { band:"Walls of Jericho", time:"1:55 PM", stage:"Loudmouth Stage" },
    { band:"Thornhill", time:"12:45 PM", stage:"Loudmouth Stage" },
    // Big Bourbon Bar
    { band:"Ded", time:"4:45 PM", stage:"Big Bourbon Bar" },
    { band:"Islander", time:"3:45 PM", stage:"Big Bourbon Bar" },
    { band:"Aurorawave", time:"2:45 PM", stage:"Big Bourbon Bar" },
    { band:"Savage Hands", time:"1:45 PM", stage:"Big Bourbon Bar" },
    { band:"Uncured", time:"12:45 PM", stage:"Big Bourbon Bar" },
    { band:"X-Comm", time:"11:45 AM", stage:"Big Bourbon Bar" },
    // Kingdom
    { band:"Unearth", time:"5:20 PM", stage:"Kingdom Stage" },
    { band:"War of Ages", time:"4:20 PM", stage:"Kingdom Stage" },
    { band:"Convictions", time:"3:20 PM", stage:"Kingdom Stage" },
  ],
  "Saturday, Sep 20, 2025": [
    // Main 1
    { band:"Deftones", time:"9:55 PM", stage:"Main Stage 1" },
    { band:"A Perfect Circle", time:"7:35 PM", stage:"Main Stage 1" },
    { band:"Stone Temple Pilots", time:"5:50 PM", stage:"Main Stage 1" },
    { band:"Acid Bath", time:"4:10 PM", stage:"Main Stage 1" },
    { band:"Failure", time:"2:50 PM", stage:"Main Stage 1" },
    { band:"Superheaven", time:"1:40 PM", stage:"Main Stage 1" },
    { band:"Quannic", time:"12:30 PM", stage:"Main Stage 1" },
    // Main 2
    { band:"Bad Omens", time:"8:40 PM", stage:"Main Stage 2" },
    { band:"I Prevail", time:"6:40 PM", stage:"Main Stage 2" },
    { band:"Motionless In White", time:"5:00 PM", stage:"Main Stage 2" },
    { band:"Black Veil Brides", time:"3:25 PM", stage:"Main Stage 2" },
    { band:"Fleshwater", time:"2:15 PM", stage:"Main Stage 2" },
    { band:"The Funeral Portrait", time:"1:05 PM", stage:"Main Stage 2" },
    { band:"Silent Theory", time:"11:55 AM", stage:"Main Stage 2" },
    // Decibel
    { band:"Trivium", time:"8:30 PM", stage:"Decibel Stage" },
    { band:"Machine Head", time:"6:55 PM", stage:"Decibel Stage" },
    { band:"Chimaira", time:"5:40 PM", stage:"Decibel Stage" },
    { band:"August Burns Red", time:"4:30 PM", stage:"Decibel Stage" },
    { band:"DevilDriver", time:"3:20 PM", stage:"Decibel Stage" },
    { band:"SpiritWorld", time:"2:10 PM", stage:"Decibel Stage" },
    { band:"Disembodied Tyrant", time:"1:10 PM", stage:"Decibel Stage" },
    // Reverb
    { band:"Cypress Hill", time:"7:40 PM", stage:"Reverb Stage" },
    { band:"Stabbing Westward", time:"6:15 PM", stage:"Reverb Stage" },
    { band:"Kittie", time:"5:05 PM", stage:"Reverb Stage" },
    { band:"Spineshank", time:"3:55 PM", stage:"Reverb Stage" },
    { band:"Snot", time:"2:45 PM", stage:"Reverb Stage" },
    { band:"The Union Underground", time:"1:40 PM", stage:"Reverb Stage" },
    { band:"Ra", time:"12:40 PM", stage:"Reverb Stage" },
    // Loudmouth
    { band:"Chiodos", time:"9:55 PM", stage:"Loudmouth Stage" },
    { band:"Letlive", time:"7:35 PM", stage:"Loudmouth Stage" },
    { band:"Blessthefall", time:"5:50 PM", stage:"Loudmouth Stage" },
    { band:"Hawthorne Heights", time:"4:10 PM", stage:"Loudmouth Stage" },
    { band:"From First To Last", time:"2:50 PM", stage:"Loudmouth Stage" },
    { band:"Attack Attack!", time:"1:40 PM", stage:"Loudmouth Stage" },
    { band:"Woe, Is Me", time:"12:30 PM", stage:"Loudmouth Stage" },
    // Big Bourbon Bar
    { band:"Small Town Titans", time:"5:30 PM", stage:"Big Bourbon Bar" },
    { band:"Smile Empty Soul", time:"4:30 PM", stage:"Big Bourbon Bar" },
    { band:"Halocene", time:"3:20 PM", stage:"Big Bourbon Bar" },
    { band:"Ashes Remain", time:"2:10 PM", stage:"Big Bourbon Bar" },
    { band:"Versus Me", time:"1:05 PM", stage:"Big Bourbon Bar" },
    { band:"Left For Last", time:"11:45 AM", stage:"Big Bourbon Bar" },
    // Kingdom
    { band:"Upon a Burning Body", time:"8:00 PM", stage:"Kingdom Stage" },
    { band:"The Browning", time:"7:10 PM", stage:"Kingdom Stage" },
    { band:"Fight From Within", time:"6:20 PM", stage:"Kingdom Stage" },
  ],
  "Sunday, Sep 21, 2025": [
    // Main 1
    { band:"Bring Me The Horizon", time:"9:30 PM", stage:"Main Stage 1" },
    { band:"Evanescence", time:"7:10 PM", stage:"Main Stage 1" },
    { band:"Knocked Loose", time:"5:25 PM", stage:"Main Stage 1" },
    { band:"Slaughter to Prevail", time:"3:55 PM", stage:"Main Stage 1" },
    { band:"Tech N9ne", time:"2:40 PM", stage:"Main Stage 1" },
    { band:"The Plot in You", time:"1:30 PM", stage:"Main Stage 1" },
    { band:"Escape the Fate", time:"12:20 PM", stage:"Main Stage 1" },
    // Main 2
    { band:"$uicideboy$", time:"8:15 PM", stage:"Main Stage 2" },
    { band:"Three Days Grace", time:"6:15 PM", stage:"Main Stage 2" },
    { band:"Wage War", time:"4:40 PM", stage:"Main Stage 2" },
    { band:"We Came as Romans", time:"3:15 PM", stage:"Main Stage 2" },
    { band:"Memphis May Fire", time:"2:05 PM", stage:"Main Stage 2" },
    { band:"Crown the Empire", time:"12:55 PM", stage:"Main Stage 2" },
    { band:"Sleep Theory", time:"11:45 AM", stage:"Main Stage 2" },
    // Decibel
    { band:"In This Moment", time:"8:15 PM", stage:"Decibel Stage" },
    { band:"Flyleaf (with Lacey Sturm)", time:"5:30 PM", stage:"Decibel Stage" },
    { band:"Hinder", time:"4:10 PM", stage:"Decibel Stage" },
    { band:"Crossfade", time:"3:00 PM", stage:"Decibel Stage" },
    { band:"10 Years", time:"1:50 PM", stage:"Decibel Stage" },
    { band:"Rev Theory", time:"12:40 PM", stage:"Decibel Stage" },
    { band:"12 Stones", time:"11:30 AM", stage:"Decibel Stage" },
    // Reverb
    { band:"Bruce Dickinson", time:"7:25 PM", stage:"Reverb Stage" },
    { band:"Testament", time:"4:45 PM", stage:"Reverb Stage" },
    { band:"Queensrÿche", time:"3:35 PM", stage:"Reverb Stage" },
    { band:"Sebastian Bach", time:"2:25 PM", stage:"Reverb Stage" },
    { band:"Accept", time:"1:15 PM", stage:"Reverb Stage" },
    { band:"Yngwie Malmsteen", time:"12:05 PM", stage:"Reverb Stage" },
    { band:"Chained Saint", time:"11:00 AM", stage:"Reverb Stage" },
    // Loudmouth
    { band:"The Dillinger Escape Plan", time:"7:25 PM", stage:"Loudmouth Stage" },
    { band:"Wargasm", time:"6:55 PM", stage:"Loudmouth Stage" },
    { band:"Glassjaw", time:"6:15 PM", stage:"Loudmouth Stage" },
    { band:"Amira Elfeky", time:"5:25 PM", stage:"Loudmouth Stage" },
    { band:"Counterparts", time:"4:10 PM", stage:"Loudmouth Stage" },
    { band:"The Haunt", time:"3:50 PM", stage:"Loudmouth Stage" },
    { band:"Dying Wish", time:"3:00 PM", stage:"Loudmouth Stage" },
    { band:"Kami Kehoe", time:"2:35 PM", stage:"Loudmouth Stage" },
    { band:"Norma Jean", time:"1:50 PM", stage:"Loudmouth Stage" },
    { band:"Picturesque", time:"1:25 PM", stage:"Loudmouth Stage" },
    { band:"It Dies Today", time:"12:40 PM", stage:"Loudmouth Stage" },
    { band:"Enmy", time:"12:20 PM", stage:"Loudmouth Stage" },
    { band:"Gates To Hell", time:"11:30 AM", stage:"Loudmouth Stage" },
    // Kingdom
    { band:"Orthodox", time:"8:15 PM", stage:"Kingdom Stage" },
    { band:"Fox Lake", time:"6:55 PM", stage:"Kingdom Stage" },
    { band:"156/Silence", time:"4:50 PM", stage:"Kingdom Stage" },
    { band:"Return to Dust", time:"3:40 PM", stage:"Kingdom Stage" },
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
  const n = /^(\d{1,2}):(\d{2})$/.exec(t); if (n) return +n[1]*60 + +n[2];
  return null;
};

// ---------- Component ----------
export default function App() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [attribution, setAttribution] = useState<Record<string, {title: string; creator: string; license: string; source: string}>>({});
  const [showSchedule, setShowSchedule] = useState(false);
  const [activePerson, setActivePerson] = useState<{ name: string; color: string } | null>(null);

  // ----- Openverse auto-fill (free-to-reuse images) -----
  async function fetchOpenverseImage(band: string): Promise<{ url?: string; meta?: {title: string; creator: string; license: string; source: string} }> {
    try {
      const q = encodeURIComponent(`${band} band live`);
      const endpoint = `https://api.openverse.org/v1/images/?q=${q}&license=cc0,by,by-sa&image_type=photo&per_page=1`;
      const res = await fetch(endpoint);
      if (!res.ok) return {};
      const data = await res.json();
      const item = data.results?.[0];
      if (!item) return {};
      const url = item.thumbnail || item.url;
      const meta = {
        title: item.title || band,
        creator: item.creator || "Unknown",
        license: (item.license || "").toUpperCase(),
        source: item.foreign_landing_url || item.url || "",
      };
      return { url, meta };
    } catch {
      return {};
    }
  }
  const handleAutoFill = async () => {
    for (const [day, bands] of Object.entries(lineup)) {
      for (const band of bands) {
        const k = keyFor(day, band);
        if (images[k]) continue;
        const result = await fetchOpenverseImage(band);
        if (result.url) setImages(prev => ({ ...prev, [k]: result.url! }));
        if (result.meta) setAttribution(prev => ({ ...prev, [k]: result.meta! }));
        await new Promise(r => setTimeout(r, 150)); // throttle
      }
    }
    alert("Tried to auto-fill artwork from Openverse. You can remove any image per card.");
  };

  // ----- Mark placement -----
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

  // ----- Compile schedule for selected bands -----
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

  // ----- CSV download -----
  function buildScheduleCsv(compiledMap: Record<string, Array<{ band: string; time?: string; stage?: string; attendees: string[] }>>) {
    const rows = [["Day","Time","Band","Stage","Attendees"]];
    for (const [day, entries] of Object.entries(compiledMap)) {
      for (const e of entries) {
        rows.push([day, e.time || "TBD", e.band, e.stage || "TBD", e.attendees.join("; ")]);
      }
    }
    const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s);
    return rows.map(r => r.map(esc).join(",")).join("\n");
  }
  function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // ----- ICS (calendar) download -----
  function icsEscape(s: string) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  function yyyymmddFromDayLabel(dayLabel: string) {
    const d = new Date(dayLabel); // e.g., "Thursday, Sep 18, 2025"
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  }
  function parseHourMinute(t?: string | null) {
    if (!t) return null;
    const m = /^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i.exec(t);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const mi = parseInt(m[2] || "0", 10);
    const pm = m[3].toLowerCase() === "pm";
    if (h === 12) h = 0;
    h = h + (pm ? 12 : 0);
    return { hour: h, minute: mi };
  }
  function cryptoRandom() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
  function buildScheduleIcs(compiledMap: Record<string, Array<{ band: string; time?: string; stage?: string; attendees: string[] }>>) {
    const NL = "\r\n";
    const lines: string[] = [];
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Festival Planner//Louder Than Life//EN");
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");

    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    for (const [dayLabel, entries] of Object.entries(compiledMap)) {
      const ymd = yyyymmddFromDayLabel(dayLabel);
      for (const e of entries) {
        const hm = parseHourMinute(e.time || "");
        if (!hm) continue; // skip TBD
        const dtstartLocal = `${ymd}T${String(hm.hour).padStart(2, "0")}${String(hm.minute).padStart(2, "0")}00`;
        const endMin = hm.minute + 60; // default 60 min
        const endHour = hm.hour + Math.floor(endMin / 60);
        const endMinute = endMin % 60;
        const dtendLocal = `${ymd}T${String(endHour).padStart(2, "0")}${String(endMinute).padStart(2, "0")}00`;

        const uid = `${cryptoRandom()}@louder-than-life.local`;
        const summary = icsEscape(e.band);
        const location = icsEscape(e.stage || "Stage TBD");
        const description = icsEscape(`Attendees: ${e.attendees.join(", ")}`);

        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART;TZID=America/New_York:${dtstartLocal}`);
        lines.push(`DTEND;TZID=America/New_York:${dtendLocal}`);
        lines.push(`SUMMARY:${summary}`);
        lines.push(`LOCATION:${location}`);
        lines.push(`DESCRIPTION:${description}`);
        lines.push("END:VEVENT");
      }
    }

    lines.push("END:VCALENDAR");
    return lines.join(NL);
  }

  // ----- Generate schedule: download CSV + ICS, open schedule view -----
  function handleGenerateScheduleDownload() {
    if (!Object.keys(compiled).length) {
      alert("No bands selected yet. Select a person, then click bands (or drag checkmarks).");
      return;
    }
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");

    const csv = buildScheduleCsv(compiled);
    downloadText(`louder-than-life-schedule-${ts}.csv`, csv, "text/csv;charset=utf-8");

    const ics = buildScheduleIcs(compiled);
    downloadText(`louder-than-life-schedule-${ts}.ics`, ics, "text/calendar;charset=utf-8");

    setShowSchedule(true);
  }

  // ----- Styles -----
  const styles = {
    page: { minHeight: "100vh", background: "#f3f4f6" },
    toolbar: {
      position: "sticky" as const, top: 0, zIndex: 50, background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    },
    pill: {
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
      border: "1px solid #e5e7eb", borderRadius: 999, cursor: "grab", userSelect: "none" as const,
      background: "#fff",
    },
    container: { padding: 16, maxWidth: 1200, margin: "0 auto" },
    day: { margin: "24px 0" },
    heading: { fontSize: 24, fontWeight: 800 as const, marginBottom: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 },
    marks: { display: "flex", gap: 8, flexWrap: "wrap" as const },
    img: { width: "100%", height: 140, objectFit: "cover" as const, borderRadius: 12, marginBottom: 6 },
    credit: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  } as const;

  return (
    <div style={styles.page}>
      {/* Sticky Toolbar */}
      <div style={styles.toolbar}>
        {/* People: click to activate, drag to DnD */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
          {people.map((person) => {
            const active = activePerson?.name === person.name;
            return (
              <div
                key={person.name}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("person", JSON.stringify(person))}
                onClick={() => setActivePerson(active ? null : person)}
                style={{
                  ...styles.pill,
                  border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  background: active ? "#dbeafe" : "#fff",
                  cursor: "pointer",
                }}
                title={`Drag or click to select ${person.name}`}
              >
                <span style={{ color: person.color, fontWeight: 800, fontSize: 18 }}>✔</span>
                <span style={{ fontWeight: 600 }}>{person.name}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <Button onClick={handleGenerateScheduleDownload} style={{ background: "#2563eb" }}>
            Generate schedule
          </Button>
          <Button onClick={handleAutoFill} style={{ background: "#0f766e" }}>
            Auto-fill artwork
          </Button>
          <Button onClick={handleUndo} variant="destructive">Undo</Button>
        </div>
      </div>

      {/* Schedule viewer */}
      {showSchedule && (
        <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Your Schedule</h2>
              <Button onClick={() => setShowSchedule(false)} style={{ background:"#6b7280" }}>Close</Button>
            </div>
            {Object.keys(compiled).length === 0 && <p style={{ margin: 0 }}>No bands selected yet.</p>}
            {Object.entries(compiled).map(([day, entries]) => (
              <div key={day} style={{ marginTop: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{day}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {entries.map(e => (
                    <li key={`${day}-${e.band}`} style={{ padding: "6px 0", borderBottom: "1px dashed #e5e7eb" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"baseline" }}>
                        <div>
                          <strong>{e.time || "TBD"}</strong> — {e.band} {e.stage ? <em style={{ color:"#6b7280" }}>({e.stage})</em> : <em style={{ color:"#6b7280" }}>(Stage TBD)</em>}
                        </div>
                        <div style={{ color:"#6b7280", fontSize:13 }}>Attendees: {e.attendees.join(", ")}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Content */}
      <div style={styles.container}>
        {Object.entries(lineup).map(([day, bands]) => (
          <section key={day} style={styles.day}>
            <h2 style={styles.heading}>{day}</h2>
            <div style={styles.grid}>
              {bands.map((band) => {
                const k = keyFor(day, band);
                const imgSrc = images[k];
                const meta = metaFor(day, band);
                return (
                  <Card
                    key={`${day}-${band}`}
                    onClick={() => { if (activePerson) handleDrop(day, band, activePerson); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const data = e.dataTransfer.getData("person");
                      if (data) handleDrop(day, band, JSON.parse(data));
                    }}
                  >
                    {imgSrc && <img src={imgSrc} alt={`${band} artwork`} style={styles.img} />}
                    {attribution[k] && (
                      <div style={styles.credit}>
                        {attribution[k].title} — {attribution[k].creator} ({attribution[k].license})
                        {attribution[k].source ? <> · <a href={attribution[k].source} target="_blank" rel="noreferrer">source</a></> : null}
                      </div>
                    )}
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{band}</h3>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>
                      <span><strong>Time:</strong> {meta.time || "TBD"}</span>{" · "}
                      <span><strong>Stage:</strong> {meta.stage || "TBD"}</span>
                    </div>

                    {/* Only keep Remove Image; the Add/Upload buttons are intentionally omitted */}
                    {imgSrc && (
                      <div style={{ marginBottom: 6 }}>
                        <button
                          style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px", fontWeight: 600, cursor: "pointer", background: "#fff" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImages(prev => { const cp = { ...prev }; delete cp[k]; return cp; });
                            setAttribution(prev => { const cp = { ...prev }; delete cp[k]; return cp; });
                          }}
                          title="Remove image"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    <div style={styles.marks}>
                      {marks.filter(m => m.day === day && m.band === band).map(m => (
                        <span key={m.id} style={{ color: m.color, fontSize: 22 }}>✔</span>
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
