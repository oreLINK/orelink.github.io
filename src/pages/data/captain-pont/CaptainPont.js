import React, { useEffect, useState } from "react";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "LU", label: "Luxembourg" },
  { code: "DE", label: "Allemagne" },
];

const WEEKDAY_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

function fmtDate(d) {
  return d.toLocaleDateString("fr-FR");
}

function isWeekend(d) {
  if (!d || typeof d.getDay !== "function") return false;
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

function dayNameFR(d) {
  return WEEKDAY_FR[d.getDay()];
}

// Génère la matrice du mois pour le calendrier
function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let day = 1 - firstDay.getDay(); // Commence au dimanche précédent

  while (day <= lastDay.getDate()) {
    week = [];
    for (let i = 0; i < 7; i++, day++) {
      if (day > 0 && day <= lastDay.getDate()) {
        week.push(new Date(year, month, day));
      } else {
        week.push(null);
      }
    }
    matrix.push(week);
  }
  return matrix;
}

// Optimisation des 25 jours de congés payés pour maximiser les ponts et longs week-ends
function optimizePaidLeaves(holidays, year) {
  let paidLeaves = [];
  let used = 0;
  const totalPaidLeaves = 25;
  const holidayDates = holidays.map(h => new Date(h.date));
  const isHoliday = (date) =>
    holidayDates.some(hd => hd.getTime() === date.getTime());

  // 1. Cherche les ponts (férié mardi ou jeudi)
  for (const h of holidayDates) {
    if (used >= totalPaidLeaves) break;
    const wd = h.getDay();
    if (wd === 2) { // mardi
      const lundi = new Date(h);
      lundi.setDate(h.getDate() - 1);
      if (
        lundi.getFullYear() === year &&
        !isHoliday(lundi) &&
        lundi.getDay() === 1 &&
        !paidLeaves.find(d => d.getTime() === lundi.getTime())
      ) {
        paidLeaves.push(lundi);
        used++;
      }
    }
    if (wd === 4) { // jeudi
      const vendredi = new Date(h);
      vendredi.setDate(h.getDate() + 1);
      if (
        vendredi.getFullYear() === year &&
        !isHoliday(vendredi) &&
        vendredi.getDay() === 5 &&
        !paidLeaves.find(d => d.getTime() === vendredi.getTime())
      ) {
        paidLeaves.push(vendredi);
        used++;
      }
    }
  }

  // 2. Complète avec des semaines entières si possible
  let d = new Date(year, 0, 1);
  while (used + 5 <= totalPaidLeaves && d.getFullYear() === year) {
    // Cherche une semaine sans férié ni déjà posée
    let week = [];
    let hasHoliday = false;
    for (let i = 0; i < 5; i++) {
      let day = new Date(d);
      day.setDate(d.getDate() + i);
      if (
        day.getFullYear() !== year ||
        day.getDay() === 0 ||
        day.getDay() === 6 ||
        isHoliday(day) ||
        paidLeaves.find(pl => pl.getTime() === day.getTime())
      ) {
        hasHoliday = true;
        break;
      }
      week.push(day);
    }
    if (!hasHoliday && week.length === 5) {
      paidLeaves.push(...week);
      used += 5;
    }
    d.setDate(d.getDate() + 7);
  }

  // 3. Complète avec des jours isolés si besoin
  d = new Date(year, 0, 1);
  while (used < totalPaidLeaves && d.getFullYear() === year) {
    if (
      d.getDay() !== 0 &&
      d.getDay() !== 6 &&
      !isHoliday(d) &&
      !paidLeaves.find(pl => pl.getTime() === d.getTime())
    ) {
      paidLeaves.push(new Date(d));
      used++;
    }
    d.setDate(d.getDate() + 1);
  }

  return paidLeaves;
}

export default function HolidayBridges() {
  const [holidays, setHolidays] = useState([]);
  const [country, setCountry] = useState("FR");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  useEffect(() => {
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`)
      .then((res) => res.json())
      .then((data) => setHolidays(data))
      .catch(console.error);
  }, [country, year]);

  // Liste des jours fériés du mois courant
  const holidayDates = holidays
    .map((h) => new Date(h.date))
    .filter((d) => d.getMonth() === month);

  // Calcul des congés optimisés pour l'année
  const paidLeaves = optimizePaidLeaves(holidays, year);

  const matrix = getMonthMatrix(year, month);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{
        textAlign: "center",
        fontSize: "3rem",
        marginBottom: "30px",
        color: "#2c3e50",
        textShadow: "2px 2px #ecf0f1"
      }}>
        Captain Pont
      </h1>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label>
          Pays :{" "}
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Calendrier mensuel */}
      <div style={{ margin: "30px 0" }}>
        <h2 style={{ textAlign: "center" }}>
          {today.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#f8f8f8" }}>
          <thead>
            <tr>
              {WEEKDAY_FR.map((wd) => (
                <th key={wd} style={{ padding: "6px", borderBottom: "1px solid #bbb", background: "#eaeaea" }}>{wd}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((week, i) => (
              <tr key={i}>
                {week.map((d, j) => {
                  const isHoliday = d && holidays.some(h => new Date(h.date).getTime() === d.getTime());
                  const isPaidLeave = d && paidLeaves.some(pl => pl.getTime() === d.getTime());
                  return (
                    <td
                      key={j}
                      style={{
                        height: "40px",
                        textAlign: "center",
                        background: isHoliday
                          ? "#ffe066"
                          : isPaidLeave
                            ? "#b2f2bb"
                            : d && isWeekend(d)
                              ? "#f0f0f0"
                              : "#fff",
                        color: isHoliday ? "#c0392b" : isPaidLeave ? "#186a3b" : "#2c3e50",
                        border: "1px solid #ddd",
                        fontWeight: isHoliday || isPaidLeave ? "bold" : "normal",
                        opacity: d ? 1 : 0.3,
                        position: "relative"
                      }}
                      title={
                        isHoliday
                          ? holidays.find(h => new Date(h.date).getTime() === d.getTime()).localName
                          : isPaidLeave
                            ? "Congé optimisé"
                            : ""
                      }
                    >
                      {d ? d.getDate() : ""}
                      {isPaidLeave && (
                        <span style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          fontSize: "0.7em",
                          color: "#186a3b"
                        }}>🌴</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop: 10, fontSize: "0.9em"}}>
          <span style={{background:"#ffe066",padding:"2px 8px",marginRight:8}}>Jour férié</span>
          <span style={{background:"#b2f2bb",padding:"2px 8px",marginRight:8}}>Congé optimisé</span>
          <span>🌴 = jour de congé posé</span>
        </div>
      </div>

      {/* Liste des jours fériés */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 30 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #2c3e50", padding: "8px" }}>Date</th>
            <th style={{ borderBottom: "2px solid #2c3e50", padding: "8px" }}>Jour</th>
            <th style={{ borderBottom: "2px solid #2c3e50", padding: "8px" }}>Nom</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((h) => {
            const d = new Date(h.date);
            return (
              <tr key={h.date}>
                <td style={{ padding: "8px", textAlign: "center" }}>{fmtDate(d)}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{dayNameFR(d)}</td>
                <td style={{ padding: "8px" }}>{h.localName}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    );
}