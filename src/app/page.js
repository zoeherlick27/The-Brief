"use client";
import { useState, useEffect } from "react";

const TECH_COMPANIES = ["OpenAI","Anthropic","Google DeepMind","Microsoft AI","Meta AI","Apple","Nvidia","Perplexity","Mistral","xAI","Cursor","Cohere","Scale AI","Ramp","Databricks"];
const FOOD_COMPANIES = ["Shake Shack","Sweetgreen","Chipotle","Toast","Yelp","OpenTable","Resy","Eater","Momofuku","Eleven Madison Park"];

const STORAGE_KEY_TECH = "brief_tech_v2";
const STORAGE_KEY_FOOD = "brief_food_v2";
const STORAGE_KEY_TS = "brief_ts_v2";

export default function Home() {
  const [techStories, setTechStories] = useState([]);
  const [foodStories, setFoodStories] = useState([]);
  const [techLoading, setTechLoading] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);
  const [techError, setTechError] = useState(null);
  const [foodError, setFoodError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const tech = localStorage.getItem(STORAGE_KEY_TECH);
      const food = localStorage.getItem(STORAGE_KEY_FOOD);
      const ts = localStorage.getItem(STORAGE_KEY_TS);
      if (tech) setTechStories(JSON.parse(tech));
      if (food) setFoodStories(JSON.parse(food));
      if (ts) setLastUpdated(ts);
    } catch(e) {}
  }, []);

  async function fetchIndustry(industry, companies) {
    const res = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry, companies })
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch");
    return data.stories;
  }

  async function runBriefing() {
    if (isLoading) return;
    setIsLoading(true);
    setTechLoading(true);
    setFoodLoading(true);
    setTechError(null);
    setFoodError(null);

    const [techResult, foodResult] = await Promise.allSettled([
      fetchIndustry("tech/AI", TECH_COMPANIES),
      fetchIndustry("food & hospitality", FOOD_COMPANIES)
    ]);

    if (techResult.status === "fulfilled") {
      setTechStories(techResult.value);
      localStorage.setItem(STORAGE_KEY_TECH, JSON.stringify(techResult.value));
    } else {
      setTechError(techResult.reason?.message || "Failed to load");
    }

    if (foodResult.status === "fulfilled") {
      setFoodStories(foodResult.value);
      localStorage.setItem(STORAGE_KEY_FOOD, JSON.stringify(foodResult.value));
    } else {
      setFoodError(foodResult.reason?.message || "Failed to load");
    }

    const ts = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    setLastUpdated(ts);
    localStorage.setItem(STORAGE_KEY_TS, ts);
    setTechLoading(false);
    setFoodLoading(false);
    setIsLoading(false);
  }

  return (
    <main style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f0f4fa" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; }
        .story-card { background: #1a2236; border: 1px solid rgba(140,160,200,0.12); border-radius: 6px; padding: 14px 16px; margin-bottom: 10px; transition: border-color 0.2s; }
        .story-card:hover { border-color: rgba(140,160,200,0.25); }
        .story-card.flagged { border-left: 2px solid #e8a020; }
        .story-card.flagged.food-flag { border-left-color: #2ecc8a; }
        .refresh-btn { background: transparent; border: 1px solid rgba(232,160,32,0.3); color: #e8a020; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; padding: 7px 16px; cursor: pointer; border-radius: 3px; transition: all 0.2s; }
        .refresh-btn:hover:not(:disabled) { background: rgba(232,160,32,0.08); border-color: #e8a020; }
        .refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .signal-badge { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; padding: 2px 7px; border-radius: 2px; }
        .badge-fundraising { background: rgba(232,160,32,0.12); color: #e8a020; border: 1px solid rgba(232,160,32,0.2); }
        .badge-hiring { background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.2); }
        .badge-product { background: rgba(46,204,138,0.1); color: #2ecc8a; border: 1px solid rgba(46,204,138,0.2); }
        .badge-expansion { background: rgba(160,106,16,0.2); color: #f0c060; border: 1px solid rgba(232,160,32,0.3); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loadpulse { 0% { width: 0%; margin-left: 0; } 50% { width: 60%; } 100% { width: 0%; margin-left: 100%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .loading-fill { animation: loadpulse 1.5s ease-in-out infinite; }
        .loading-text { animation: blink 1.2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(232,160,32,0.3)", padding: "18px 28px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0a0f1e", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#e8a020" }}>The Brief</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a9bb5", letterSpacing: 2, textTransform: "uppercase" }}>Intelligence Tracker</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {lastUpdated && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a9bb5" }}>Updated {lastUpdated}</div>}
          <button className="refresh-btn" onClick={runBriefing} disabled={isLoading}>
            <span style={{ display: "inline-block", animation: isLoading ? "spin 1s linear infinite" : "none" }}>↻</span>
            {" "}{isLoading ? "Fetching..." : "Pull Latest"}
          </button>
        </div>
      </div>

      {/* Two pane layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 100px)" }}>
        <Pane title="Tech & AI" stories={techStories} loading={techLoading} error={techError} isFood={false} />
        <Pane title="Food & Hospitality" stories={foodStories} loading={foodLoading} error={foodError} isFood={true} />
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(140,160,200,0.12)", padding: "10px 28px", display: "flex", alignItems: "center", gap: 20, background: "#0a0f1e" }}>
        {[["#e8a020","Fundraising"],["#4a9eff","Hiring"],["#2ecc8a","Product"],["#f0c060","Expansion"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#8a9bb5", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }}></div>
            {label}
          </div>
        ))}
      </div>
    </main>
  );
}

function Pane({ title, stories, loading, error, isFood }) {
  const dotColor = isFood ? "#2ecc8a" : "#e8a020";
  return (
    <div style={{ padding: "24px 24px 40px", borderRight: isFood ? "none" : "1px solid rgba(140,160,200,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(140,160,200,0.12)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }}></div>
          {title}
        </div>
        {stories.length > 0 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a9bb5" }}>{stories.length} stories</div>}
      </div>

      {loading && (
        <div style={{ padding: "20px 0" }}>
          <div style={{ height: 2, background: "#243047", borderRadius: 1, marginBottom: 10, overflow: "hidden" }}>
            <div className="loading-fill" style={{ height: "100%", background: dotColor, borderRadius: 1 }}></div>
          </div>
          <div className="loading-text" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a9bb5", letterSpacing: 1, textTransform: "uppercase" }}>Scanning live sources...</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "rgba(224,90,90,0.06)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 6, padding: "14px 16px", fontSize: 12, color: "#e05a5a", fontFamily: "'DM Mono', monospace" }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && stories.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a9bb5", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Awaiting Briefing</div>
          <div style={{ fontSize: 12, color: "#8a9bb5", opacity: 0.7 }}>Hit "Pull Latest" to fetch today's intel</div>
        </div>
      )}

      {!loading && stories.map((s, i) => {
        const flagged = s.signal ? ` flagged${isFood ? " food-flag" : ""}` : "";
        const badgeClass = `badge-${s.signal}`;
        return (
          <div key={i} className={`story-card${flagged}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500, color: isFood ? "#2ecc8a" : "#e8a020", letterSpacing: "0.5px", textTransform: "uppercase" }}>{s.company}</span>
              {s.signal && <span className={`signal-badge ${badgeClass}`}>{s.signal}</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#f0f4fa", lineHeight: 1.45, marginBottom: 6 }}>{s.headline}</div>
            <div style={{ fontSize: 12, color: "#c4cfe0", lineHeight: 1.55, fontStyle: "italic" }}>
              <span style={{ color: "#8a9bb5", fontStyle: "normal" }}>↳ </span>{s.sowhat}
            </div>
          </div>
        );
      })}
    </div>
  );
}
