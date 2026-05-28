"use client";
import { useState, useEffect } from "react";

const TECH_COMPANIES = ["OpenAI","Anthropic","Google DeepMind","Microsoft AI","Meta AI","Apple","Nvidia","Perplexity","Mistral","xAI","Cursor","Cohere","Scale AI","Ramp","Databricks"];
const FOOD_COMPANIES = ["Shake Shack","Sweetgreen","Chipotle","Toast","Yelp","OpenTable","Resy","Eater","Momofuku","Eleven Madison Park"];

const STORAGE_KEY_TECH = "brief_tech_v3";
const STORAGE_KEY_FOOD = "brief_food_v3";
const STORAGE_KEY_TS = "brief_ts_v3";

const C = {
  beige: "#F5F0E8",
  white: "#FFFFFF",
  lavenderLight: "#EDE8F5",
  lavender: "#C4B5D4",
  purpleMid: "#9B8AB0",
  eggplant: "#4A3060",
  bodyText: "#2D2438",
  muted: "#8A7AA0",
  border: "#D8D0E8",
};

export default function Home() {
  const [techData, setTechData] = useState(null);
  const [foodData, setFoodData] = useState(null);
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
      if (tech) setTechData(JSON.parse(tech));
      if (food) setFoodData(JSON.parse(food));
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
    return data;
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
      setTechData(techResult.value);
      localStorage.setItem(STORAGE_KEY_TECH, JSON.stringify(techResult.value));
    } else {
      setTechError(techResult.reason?.message || "Failed to load");
    }

    if (foodResult.status === "fulfilled") {
      setFoodData(foodResult.value);
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
    <main style={{ background: C.beige, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: C.bodyText }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F0E8; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loadpulse { 0% { width: 0%; margin-left: 0; } 50% { width: 60%; } 100% { width: 0%; margin-left: 100%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .loading-fill { animation: loadpulse 1.5s ease-in-out infinite; }
        .loading-text { animation: blink 1.2s ease-in-out infinite; }
        .headline-card { background: #FFFFFF; border: 1px solid #D8D0E8; border-radius: 10px; padding: 18px 20px; margin-bottom: 10px; cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s; box-shadow: 0 1px 4px rgba(74,48,96,0.06); }
        .headline-card:hover { box-shadow: 0 4px 16px rgba(74,48,96,0.12); border-color: #C4B5D4; }
        .pull-btn { background: #F5F0E8; border: none; color: #4A3060; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; padding: 9px 20px; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
        .pull-btn:hover:not(:disabled) { background: #EDE8F5; }
        .pull-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .deal-row { background: #FFFFFF; border: 1px solid #D8D0E8; border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(74,48,96,0.05); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: C.eggplant, zIndex: 100, boxShadow: "0 2px 16px rgba(74,48,96,0.2)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#F5F0E8" }}>The Brief</div>
          <div style={{ fontSize: 11, color: C.lavender, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 400 }}>Intelligence Tracker</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {lastUpdated && <div style={{ fontSize: 12, color: C.lavender }}>{lastUpdated}</div>}
          <button className="pull-btn" onClick={runBriefing} disabled={isLoading}>
            <span style={{ display: "inline-block", animation: isLoading ? "spin 1s linear infinite" : "none" }}>↻</span>
            {" "}{isLoading ? "Fetching..." : "Pull Latest"}
          </button>
        </div>
      </div>

      {/* Two pane layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 62px)" }}>
        <Pane title="Tech & AI" data={techData} loading={techLoading} error={techError} isLeft />
        <Pane title="Food & Hospitality" data={foodData} loading={foodLoading} error={foodError} />
      </div>
    </main>
  );
}

function SignalBadge({ signal }) {
  if (!signal) return null;
  const styles = {
    fundraising: { background: "#F0EBF8", color: "#4A3060", border: "1px solid #C4B5D4" },
    hiring:      { background: "#EAF0FB", color: "#2C5282", border: "1px solid #90B8E8" },
    product:     { background: "#EBF8F2", color: "#276749", border: "1px solid #90CEB0" },
    expansion:   { background: "#FDF3E8", color: "#7B4F12", border: "1px solid #E8C090" },
  };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...(styles[signal] || styles.fundraising) }}>
      {signal}
    </span>
  );
}

function DealTypeBadge({ type }) {
  const styles = {
    fundraising: { background: "#F0EBF8", color: "#4A3060" },
    acquisition: { background: "#FDF3E8", color: "#7B4F12" },
    hiring:      { background: "#EAF0FB", color: "#2C5282" },
  };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, flexShrink: 0, ...(styles[type] || styles.fundraising) }}>
      {type}
    </span>
  );
}

function Pane({ title, data, loading, error, isLeft }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const headlines = data?.headlines || [];
  const synthesis = data?.synthesis || "";
  const deals = data?.deals || [];
  const trendSpotlight = data?.trendSpotlight || null;
  const hasData = headlines.length > 0 || synthesis || deals.length > 0 || trendSpotlight;

  return (
    <div style={{ padding: "32px 28px 56px", borderRight: isLeft ? `1px solid ${C.border}` : "none" }}>
      {/* Pane title */}
      <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: C.eggplant }}>{title}</div>
      </div>

      {loading && (
        <div style={{ padding: "20px 0" }}>
          <div style={{ height: 2, background: C.lavenderLight, borderRadius: 1, marginBottom: 12, overflow: "hidden" }}>
            <div className="loading-fill" style={{ height: "100%", background: C.purpleMid, borderRadius: 1 }}></div>
          </div>
          <div className="loading-text" style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Scanning live sources...</div>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#FDF0EF", border: "1px solid #E8B0B0", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#C0392B" }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && !hasData && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: C.lavender, marginBottom: 16 }}>◈</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: C.purpleMid, marginBottom: 8 }}>Awaiting Briefing</div>
          <div style={{ fontSize: 13, color: C.muted }}>Hit "Pull Latest" to fetch today's intel</div>
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Expandable headline cards */}
          {headlines.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {headlines.map((h, i) => (
                <div
                  key={i}
                  className="headline-card"
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.purpleMid, textTransform: "uppercase", letterSpacing: 0.8 }}>{h.company}</span>
                      <SignalBadge signal={h.signal} />
                    </div>
                    <span style={{ fontSize: 16, color: C.lavender, display: "inline-block", transition: "transform 0.2s", transform: expandedIdx === i ? "rotate(180deg)" : "none" }}>⌄</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: C.bodyText, lineHeight: 1.5 }}>{h.headline}</div>
                  {expandedIdx === i && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, lineHeight: 1.7, fontStyle: "italic" }}>
                      {h.sowhat}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* This Week in [Industry] */}
          {synthesis && (
            <div style={{ background: C.lavenderLight, border: `1px solid ${C.lavender}`, borderRadius: 10, padding: "20px 22px", marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.eggplant, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>This Week in {title}</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: C.bodyText, lineHeight: 1.75, fontStyle: "italic" }}>{synthesis}</p>
            </div>
          )}

          {/* Deals & Moves */}
          {deals.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: C.eggplant, marginBottom: 14 }}>Deals & Moves</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deals.map((d, i) => (
                  <div key={i} className="deal-row" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <DealTypeBadge type={d.type} />
                    <div style={{ fontSize: 13, color: C.bodyText, lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600 }}>{d.company}</span> — {d.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why It Matters */}
          {trendSpotlight && (
            <div style={{ background: C.eggplant, borderRadius: 10, padding: "24px 26px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.lavender, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Why It Matters</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#F5F0E8", marginBottom: 14, lineHeight: 1.4 }}>{trendSpotlight.title}</div>
              <p style={{ fontSize: 13, color: C.lavenderLight, lineHeight: 1.75 }}>{trendSpotlight.body}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
