import React, { useEffect, useMemo, useState } from "react";

/**
 * Floconet – Ski Day Predictor (React, mobile‑first)
 * Style: "Liquid Glass" (glassmorphism), minimal, no external UI libs
 * Data: Open‑Meteo (free, no token) – https://open-meteo.com/
 *
 * What it does
 * - Fetches weather for selected resort (lat/lon)
 * - Computes a Ski Score and Verdict: Top / Bof / À éviter
 * - Uses thresholds aligned with ski best practices (temps, wind, fresh snow, sun)
 * - Mobile‑first layout; progressive enhancement on desktop
 * - Mascotte: Snowman (SVG) called "Floconet"
 *
 * How to use
 * - Drop this file in a React app and render <Floconet />
 */

const RESORTS = [
  { id: "chamonix", name: "Chamonix (FR)", lat: 45.9237, lon: 6.8694, elev: 1035 },
  { id: "valthorens", name: "Val Thorens (FR)", lat: 45.2986, lon: 6.58, elev: 2300 },
  { id: "tignes", name: "Tignes (FR)", lat: 45.469, lon: 6.909, elev: 2100 },
  { id: "alpedhuez", name: "Alpe d'Huez (FR)", lat: 45.091, lon: 6.069, elev: 1860 },
  { id: "laplagne", name: "La Plagne (FR)", lat: 45.506, lon: 6.678, elev: 2000 },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (n, p = 0) => (n === undefined || n === null || Number.isNaN(n) ? null : Number(n.toFixed(p)));
const fmt = (n, s = "") => (n === null || n === undefined ? "–" : `${round(n)}${s}`);

// Inline Liquid‑Glass style
const styles = {
  app: {
    minHeight: "100svh",
    background: "linear-gradient(180deg, #cfe9ff 0%, #eaf4ff 40%, #ffffff 100%)",
    color: "#0b2035",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "16px",
  },
  glass: {
    background: "rgba(255,255,255,0.45)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  gridMd2: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr 1fr",
  },
  badge: (tone) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 600,
    background:
      tone === "good"
        ? "linear-gradient(135deg,#28d17c,#86f3b9)"
        : tone === "meh"
        ? "linear-gradient(135deg,#ffd166,#ffe19b)"
        : "linear-gradient(135deg,#ff6b6b,#ff9f9f)",
    color: tone === "meh" ? "#3a2b00" : "#062b1a",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  }),
};

function Snowman({ size = 56 }) {
  // Floconet mascot – simple friendly snowman
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Floconet mascot" role="img">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#e8f4ff" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="transparent" />
      <circle cx="32" cy="40" r="14" fill="url(#g)" stroke="#dbeafe" />
      <circle cx="32" cy="24" r="10" fill="url(#g)" stroke="#dbeafe" />
      <circle cx="28" cy="22" r="1.6" fill="#0b2035" />
      <circle cx="36" cy="22" r="1.6" fill="#0b2035" />
      <path d="M30 26 Q32 28 34 26" stroke="#0b2035" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 24 l8 2" stroke="#ff7b00" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="22" y1="32" x2="10" y2="26" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="32" x2="54" y2="26" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="35" r="1.2" fill="#0b2035" />
      <circle cx="32" cy="39" r="1.2" fill="#0b2035" />
      <circle cx="32" cy="43" r="1.2" fill="#0b2035" />
    </svg>
  );
}

function useOpenMeteo({ lat, lon }) {
  const [state, setState] = useState({ status: "idle" });
  useEffect(() => {
    if (!lat || !lon) return;
    const controller = new AbortController();
    async function run() {
      setState({ status: "loading" });
      try {
        const hourly = [
          "temperature_2m",
          "precipitation",
          "snowfall",
          "wind_speed_10m",
          "cloudcover",
          "visibility",
        ].join(",");
        const daily = [
          "temperature_2m_max",
          "temperature_2m_min",
          "snowfall_sum",
          "precipitation_sum",
          "wind_speed_10m_max",
          "sunshine_duration",
        ].join(",");
        const params = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          timezone: "auto",
          hourly,
          daily,
          forecast_days: "7",
          past_days: "1",
        });
        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setState({ status: "success", json });
      } catch (e) {
        if (e.name !== "AbortError") setState({ status: "error", error: e });
      }
    }
    run();
    return () => controller.abort();
  }, [lat, lon]);
  return state;
}

function computeKPIs(json) {
  if (!json) return null;
  const d = json.daily;
  const today = 1; // because we requested past_days=1, index 0 is yesterday, 1 is today
  const tmin = d?.temperature_2m_min?.[today] ?? null;
  const tmax = d?.temperature_2m_max?.[today] ?? null;
  const tmean = tmin != null && tmax != null ? (tmin + tmax) / 2 : null;
  const snowfallToday = d?.snowfall_sum?.[today] ?? 0;
  const snowfallYesterday = d?.snowfall_sum?.[0] ?? 0;
  const snowfall48h = snowfallToday + snowfallYesterday;
  const precipToday = d?.precipitation_sum?.[today] ?? null;
  const windMax = d?.wind_speed_10m_max?.[today] ?? null;
  const sunDur = d?.sunshine_duration?.[today] ?? null; // seconds
  const sunHours = sunDur != null ? sunDur / 3600 : null;
  return { tmin, tmax, tmean, snowfallToday, snowfallYesterday, snowfall48h, precipToday, windMax, sunHours };
}

function scoreAndVerdict(k) {
  if (!k) return { score: 0, verdict: "–", tone: "meh", reasons: [] };
  let score = 0; const reasons = [];
  // Temp: ideal -8..-1
  if (k.tmean != null) {
    if (k.tmean >= -8 && k.tmean <= -1) { score += 20; reasons.push("Temp idéale"); }
    else if (k.tmean < -15 || k.tmean > 4) { score += 2; reasons.push("Temp défavorable"); }
    else { score += 10; reasons.push("Temp moyenne"); }
  }
  // Fresh snow 48h: 10–30 cm best
  if (k.snowfall48h != null) {
    if (k.snowfall48h >= 10 && k.snowfall48h <= 30) { score += 25; reasons.push("Neige fraîche 10–30 cm"); }
    else if (k.snowfall48h < 5) { score += 8; reasons.push("Peu de fraîche"); }
    else if (k.snowfall48h > 40) { score += 18; reasons.push("Gros cumul (potentiellement lourd)"); }
    else { score += 15; reasons.push("Cumul correct"); }
  }
  // Wind
  if (k.windMax != null) {
    if (k.windMax < 30) { score += 20; reasons.push("Vent faible"); }
    else if (k.windMax <= 50) { score += 10; reasons.push("Vent modéré"); }
    else { score += 2; reasons.push("Vent fort"); }
  }
  // Sun hours
  if (k.sunHours != null) {
    if (k.sunHours >= 5) { score += 15; reasons.push("Ensoleillement généreux"); }
    else if (k.sunHours >= 2) { score += 8; reasons.push("Ensoleillement moyen"); }
    else { score += 2; reasons.push("Journée couverte"); }
  }
  // Precip (today total)
  if (k.precipToday != null) {
    if (k.precipToday === 0) { score += 10; reasons.push("Pas de précipitation"); }
    else if (k.precipToday < 3) { score += 5; reasons.push("Faibles précipitations"); }
    else { score += 1; reasons.push("Précipitations marquées"); }
  }
  // Optional user inputs will add up to 10 pts later
  score = clamp(score, 0, 100);
  let verdict = "Bof"; let tone = "meh";
  if (score >= 70) { verdict = "Top journée"; tone = "good"; }
  else if (score < 40) { verdict = "À éviter"; tone = "bad"; }
  return { score: Math.round(score), verdict, tone, reasons };
}

function Gauge({ value }) {
  const pct = clamp(value, 0, 100);
  return (
    <div style={{ width: "100%", marginTop: 8 }}>
      <div style={{ height: 10, borderRadius: 999, background: "rgba(11,32,53,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#28d17c,#86f3b9)" }} />
      </div>
    </div>
  );
}

function TempMinMax({ tmin, tmax }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span>Min: <strong>{fmt(tmin, "°C")}</strong></span>
      <span>Max: <strong>{fmt(tmax, "°C")}</strong></span>
    </div>
  );
}

function BarSnow({ values }) {
  if (!values?.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${values.length},1fr)`, gap: 6, alignItems: "end", height: 80 }}>
      {values.map((v, i) => (
        <div key={i} style={{ background: "rgba(11,32,53,0.18)", borderRadius: 6, height: `${(v / max) * 100}%` }} title={`${round(v)} cm`} />
      ))}
    </div>
  );
}

export default function Floconet() {
  const [resort, setResort] = useState(RESORTS[0].id);
  const r = RESORTS.find((x) => x.id === resort);
  const { status, json, error } = useOpenMeteo({ lat: r.lat, lon: r.lon });
  const k = useMemo(() => computeKPIs(json), [json]);

  // Optional user inputs affecting score (up to +10)
  const [pistes, setPistes] = useState(80); // % open (manual)
  const [rush, setRush] = useState(false); // vacations/weekend

  const base = useMemo(() => scoreAndVerdict(k), [k]);
  const userAdj = useMemo(() => {
    let bonus = 0; const notes = [];
    if (pistes >= 80) { bonus += 6; notes.push("Beaucoup de pistes ouvertes"); }
    else if (pistes >= 50) { bonus += 3; notes.push("Ouverture moyenne"); }
    else { bonus += 0; notes.push("Ouverture faible"); }
    if (rush) { bonus -= 4; notes.push("Affluence probable"); } else { bonus += 2; notes.push("Faible affluence probable"); }
    return { bonus: clamp(bonus, -6, 10), notes };
  }, [pistes, rush]);

  const finalScore = clamp(base.score + userAdj.bonus, 0, 100);
  const verdict = finalScore >= 70 ? "Top journée" : finalScore < 40 ? "À éviter" : "Bof";
  const tone = finalScore >= 70 ? "good" : finalScore < 40 ? "bad" : "meh";

  return (
    <div style={styles.app}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1000px 400px at 20% -10%, rgba(255,255,255,0.8), transparent), radial-gradient(900px 360px at 110% 10%, rgba(255,255,255,0.6), transparent)" }} />
      <div style={styles.container}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Snowman size={48} />
            <div>
              <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 0.2 }}>Floconet</h1>
              <div style={{ opacity: 0.75, fontSize: 13 }}>Ton coach ski du matin</div>
            </div>
          </div>
          <div>
            <select value={resort} onChange={(e) => setResort(e.target.value)} style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(11,32,53,0.15)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)" }}>
              {RESORTS.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
          </div>
        </header>

        <section style={{ ...styles.glass, ...styles.card }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ ...styles.badge(tone) }}>
              {tone === "good" ? "🏆" : tone === "meh" ? "🤷" : "🚫"}
              <span>{verdict}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 28 }}>{finalScore}/100</div>
          </div>
          <Gauge value={finalScore} />
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {status === "loading" && <span>Calcul en cours…</span>}
            {status === "error" && <span>Erreur: {String(error)}</span>}
            {status === "success" && (
              <>
                <div title="Température">🌡️ <strong>{fmt(k?.tmean, "°C")}</strong> (min {fmt(k?.tmin, "°C")}, max {fmt(k?.tmax, "°C")})</div>
                <div title="Neige 48h">❄️ <strong>{fmt(k?.snowfall48h, " cm")}</strong> (aujourd'hui {fmt(k?.snowfallToday, " cm")})</div>
                <div title="Vent max">🌬️ <strong>{fmt(k?.windMax, " km/h")}</strong></div>
                <div title="Soleil">☀️ <strong>{fmt(k?.sunHours, " h")}</strong></div>
                <div title="Précipitations">🌧️ <strong>{fmt(k?.precipToday, " mm")}</strong></div>
              </>
            )}
          </div>
        </section>

        <section style={{ ...styles.glass, ...styles.card }}>
          <h3 style={{ marginTop: 0 }}>Tes réglages (affinent le score)</h3>
          <div style={styles.grid}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Ouverture des pistes: <strong>{pistes}%</strong></span>
              <input type="range" min={0} max={100} value={pistes} onChange={(e) => setPistes(parseInt(e.target.value))} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} />
              <span>Vacances/week-end (affluence)</span>
            </label>
          </div>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
            Impact estimé: {userAdj.bonus >= 0 ? "+" : ""}{round(userAdj.bonus)} pts • {userAdj.notes.join(" · ")}
          </div>
        </section>

        <section style={{ ...styles.glass, ...styles.card }}>
          <h3 style={{ marginTop: 0 }}>Neige à venir (7 jours)</h3>
          {json?.daily?.snowfall_sum ? (
            <BarSnow values={json.daily.snowfall_sum.slice(1, 8)} />
          ) : (
            <div>—</div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            {(json?.daily?.time || []).slice(1, 8).map((d, i) => (
              <span key={d}>{d.slice(5)}: {fmt(json.daily.snowfall_sum[i+1], "cm")}</span>
            ))}
          </div>
        </section>

        <section style={{ ...styles.glass, ...styles.card }}>
          <h3 style={{ marginTop: 0 }}>Détails du jour</h3>
          <div style={styles.grid}>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Températures</div>
              <TempMinMax tmin={k?.tmin} tmax={k?.tmax} />
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Vent maximum</div>
              <div style={{ fontWeight: 600 }}>{fmt(k?.windMax, " km/h")}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Neige (48h)</div>
              <div style={{ fontWeight: 600 }}>{fmt(k?.snowfall48h, " cm")}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Ensoleillement</div>
              <div style={{ fontWeight: 600 }}>{fmt(k?.sunHours, " h")}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Précipitations (jour)</div>
              <div style={{ fontWeight: 600 }}>{fmt(k?.precipToday, " mm")}</div>
            </div>
          </div>
        </section>

{/* <script type='text/javascript'>
var INWoptions = {
'estacion': '236',
'width': '451',
'bgcolor': '1658A7',
'txtcolor': 'FFFFFF',
'elements': 't|meteo'
};
</script>
<script src='//www.pyreneige.fr/widgets/estado-estacion.js' type='text/javascript'></script> */}

        <footer style={{ textAlign: "center", opacity: 0.7, fontSize: 12, margin: "16px 0 40px" }}>
          Données météo: Open‑Meteo • Mascotte: Floconet ⛄ • Conseils indicatifs, vérifiez les bulletins locaux.
        </footer>
      </div>

      {/* Desktop enhancements */}
      <style>{`
        @media (min-width: 900px) {
          h1 { font-size: 28px; }
          .grid-md-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        * { box-sizing: border-box; }
        button, select, input, textarea { font: inherit; }
      `}</style>
    </div>
  );
}