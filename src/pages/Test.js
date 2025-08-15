import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Utilitaire pour obtenir l'emoji drapeau à partir du code pays ISO alpha-2
function getFlagEmoji(countryCode) {
  if (!countryCode) return '';
  // Certains codes sont en minuscules, on les met en majuscules
  const code = countryCode.toUpperCase();
  // Unicode flag offset
  return code.replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt())
  );
}

// Dégradé du plus froid (bleu) au plus chaud (rouge)
function getColorGradient(min, max, value) {
  const ratio = (value - min) / (max - min);
  const r = Math.round(0 + ratio * (255 - 0));
  const g = Math.round(123 + ratio * (40 - 123));
  const b = Math.round(255 + ratio * (40 - 255));
  return `rgb(${r},${g},${b})`;
}

// Dégradé de bleu uniquement pour les températures minimales
function getBlueGradient(min, max, value) {
  const ratio = (value - min) / (max - min);
  const r = Math.round(173 - ratio * (173 - 0));
  const g = Math.round(216 - ratio * (216 - 70));
  const b = Math.round(230 - ratio * (230 - 140));
  return `rgb(${r},${g},${b})`;
}

// Détecte les périodes de canicule (au moins 3 jours consécutifs à >36°C le jour ET >21°C la nuit)
function detectHeatwaves(tempMax, tempMin) {
  const heatwaveDays = [];
  let current = [];
  for (let i = 0; i < tempMax.length; i++) {
    if (tempMax[i] > 36 && tempMin[i] > 21) {
      current.push(i);
    } else {
      if (current.length >= 3) heatwaveDays.push(...current);
      current = [];
    }
  }
  if (current.length >= 3) heatwaveDays.push(...current);
  return heatwaveDays;
}

const darkTheme = {
  '--card-background': '#23272f',
  '--body-bg': '#181a20',
  '--text-main': '#f5f7fa',
  '--text-secondary': '#b0b8c1',
  '--border-color': '#333842'
};

const lightTheme = {
  '--card-background': '#fff',
  '--body-bg': '#f5f7fa',
  '--text-main': '#2d3a4b',
  '--text-secondary': '#6c7a89',
  '--border-color': '#eaeaea'
};

const Test = () => {
  const [selectedCity, setSelectedCity] = useState({
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    country: 'France',
    country_code: 'FR'
  });
  const [cityInput, setCityInput] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const suggestionsRef = useRef();

  // Apply theme to root
  useEffect(() => {
    const theme = darkMode ? darkTheme : lightTheme;
    for (const key in theme) {
      document.documentElement.style.setProperty(key, theme[key]);
    }
    document.body.style.background = theme['--body-bg'];
    document.body.style.color = theme['--text-main'];
  }, [darkMode]);

  function getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 89);
    const toISO = d => d.toISOString().slice(0, 10);
    return { start: toISO(start), end: toISO(end) };
  }

  // Fetch current temperature for the selected city
  const fetchCurrentTemperature = async (city) => {
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: city.latitude,
          longitude: city.longitude,
          current_weather: true,
          timezone: 'Europe/Paris'
        }
      });
      setCurrentTemp(response.data.current_weather?.temperature ?? null);
    } catch {
      setCurrentTemp(null);
    }
  };

  // Fetch temperature data for the selected city
  const fetchTemperatureData = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getDateRange();
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: city.latitude,
          longitude: city.longitude,
          daily: 'temperature_2m_max,temperature_2m_min',
          start_date: start,
          end_date: end,
          timezone: 'Europe/Paris'
        }
      });

      let dates = response.data.daily.time;
      let tempMax = response.data.daily.temperature_2m_max;
      let tempMin = response.data.daily.temperature_2m_min;

      if (dates.length > 90) {
        const startIdx = dates.length - 90;
        dates = dates.slice(startIdx);
        tempMax = tempMax.slice(startIdx);
        tempMin = tempMin.slice(startIdx);
      }

      const heatwaveIndices = detectHeatwaves(tempMax, tempMin);

      const minOfMax = Math.min(...tempMax);
      const maxOfMax = Math.max(...tempMax);
      const minOfMin = Math.min(...tempMin);
      const maxOfMin = Math.max(...tempMin);

      const backgroundColorsMax = tempMax.map((t, i) =>
        heatwaveIndices.includes(i)
          ? 'rgba(255, 60, 60, 0.85)'
          : getColorGradient(minOfMax, maxOfMax, t)
      );
      const backgroundColorsMin = tempMin.map((t, i) =>
        heatwaveIndices.includes(i)
          ? 'rgba(255, 60, 60, 0.85)'
          : getBlueGradient(minOfMin, maxOfMin, t)
      );

      setData({
        labels: dates.map(d => d.slice(0, 10)),
        datasets: [
          {
            label: 'Température max journalière (°C)',
            data: tempMax,
            backgroundColor: backgroundColorsMax,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Température min journalière (°C)',
            data: tempMin,
            backgroundColor: backgroundColorsMin,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      });

      setLoading(false);
    } catch (err) {
      setError('Erreur lors de la récupération des données');
      setLoading(false);
    }
  };

  // Fetch suggestions from Open-Meteo Geocoding API
  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    try {
      const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: query,
          count: 7,
          language: 'fr',
          format: 'json'
        }
      });
      if (response.data && response.data.results) {
        setCitySuggestions(response.data.results);
      } else {
        setCitySuggestions([]);
      }
    } catch {
      setCitySuggestions([]);
    }
  };

  // Handle input change for city search
  const handleCityInput = (e) => {
    const value = e.target.value;
    setCityInput(value);
    setShowSuggestions(true);
    fetchCitySuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (city) => {
    setSelectedCity({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country,
      country_code: city.country_code
    });
    setCityInput(`${city.name}${city.country ? ', ' + city.country : ''}`);
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTemperatureData(selectedCity);
    fetchCurrentTemperature(selectedCity);
    // eslint-disable-next-line
  }, [selectedCity]);

  // Toggle switch style
  const switchContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '1.5rem 0 0.5rem 0',
    justifyContent: 'center'
  };

  const switchLabel = {
    fontWeight: 600,
    color: 'var(--text-main)',
    fontSize: 16
  };

  const switchInput = {
    width: 40,
    height: 22,
    accentColor: '#e74c3c',
    cursor: 'pointer'
  };

  // Responsive container styles
  const mainWrapper = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 1rem'
  };

  const flexRow = {
    display: 'flex',
    flexDirection: 'row',
    gap: '2.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  };

  const mainCol = {
    flex: 3,
    minWidth: 0
  };

  const asideCol = {
    flex: '0 0 340px',
    minWidth: 260,
    maxWidth: 380,
    position: 'sticky',
    top: 60,
    alignSelf: 'flex-start',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem'
  };

  // Responsive for mobile
  const mediaQuery = '@media (max-width: 900px)';
  const responsiveStyles = `
    ${mediaQuery} {
      .main-flex-row {
        flex-direction: column !important;
        gap: 1.5rem !important;
      }
      .main-col, .aside-col {
        max-width: 100% !important;
        flex: 1 1 100% !important;
      }
      .aside-col {
        position: static !important;
        top: unset !important;
      }
    }
  `;

  return (
    <div style={mainWrapper}>
      <style>{responsiveStyles}</style>
      {/* Température actuelle centrée en haut */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2.5rem 0 2rem 0',
          gap: '0.7rem'
        }}
        aria-label="Température actuelle"
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div
            style={{
              fontSize: '7rem',
              fontWeight: 900,
              color: '#e74c3c',
              margin: 0,
              lineHeight: 1,
              textShadow: '0 2px 12px rgba(231,76,60,0.08)'
            }}
          >
            {currentTemp !== null ? `${currentTemp}°C` : <span style={{fontSize: '2rem', color: '#888'}}>Température indisponible</span>}
          </div>
          {selectedCity.country_code && (
            <span style={{fontSize: '3rem', marginLeft: 8}}>
              {getFlagEmoji(selectedCity.country_code)}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '2.2rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            letterSpacing: 1,
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {selectedCity.name}
          {selectedCity.country && (
            <span style={{fontSize: '1.3rem', color: 'var(--text-secondary)'}}>
              {selectedCity.country}
            </span>
          )}
        </div>
      </section>
      <div className="main-flex-row" style={flexRow}>
        <main className="main-col" style={mainCol}>
          <article
            style={{
              padding: '2.5rem 2rem 2rem 2rem',
              borderRadius: '1.2rem',
              background: 'var(--card-background, #fff)',
              boxShadow: '0 4px 24px rgba(44,62,80,0.10)',
              minHeight: 520
            }}
          >
            <header>
              <h3 style={{marginBottom: 0, color: 'var(--text-main)'}}>Évolution des températures</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: 24, marginTop: 8, fontSize: 18}}>
                Min & max journalières à <b>{selectedCity.name}{selectedCity.country ? `, ${selectedCity.country}` : ''}</b> (90 derniers jours)
              </p>
            </header>
            {loading ? (
              <progress style={{width: '100%', margin: '2rem 0'}} aria-label="Chargement du graphique" />
            ) : error ? (
              <div className="alert" style={{color: '#e74c3c', background: '#fff3f3', padding: 16, borderRadius: 8}}>{error}</div>
            ) : (
              <Bar
                data={data}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        color: 'var(--text-main)',
                        font: { size: 16 }
                      }
                    },
                    title: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxTicksLimit: 20,
                        color: 'var(--text-secondary)',
                        font: { size: 13 },
                        callback: function(value, index) {
                          return data.labels[index];
                        }
                      },
                      grid: { color: 'var(--border-color)' },
                      stacked: false
                    },
                    y: {
                      beginAtZero: false,
                      ticks: { color: 'var(--text-secondary)', font: { size: 15 } },
                      grid: { color: 'var(--border-color)' },
                      stacked: false
                    }
                  }
                }}
              />
            )}
            <footer style={{marginTop: 28, color: '#e74c3c', fontWeight: 500, fontSize: 16, display: 'flex', alignItems: 'center'}}>
              <span style={{background: 'rgba(255,60,60,0.85)', padding: '0 8px', borderRadius: 4, marginRight: 8, display: 'inline-block', height: 18}}></span>
              Périodes de canicule : ≥3 jours à plus de 36°C le jour et ≥3 nuits à plus de 21°C
            </footer>
          </article>
        </main>
        <aside className="aside-col" style={asideCol}>
          <div
            style={{
              background: 'var(--card-background, #fff)',
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(44,62,80,0.07)',
              padding: '2rem 1.5rem',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}
          >
            <label htmlFor="city-input" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 18, marginBottom: 12 }}>
              Recherchez une ville
            </label>
            <div style={{position: 'relative'}}>
              <input
                id="city-input"
                type="text"
                autoComplete="off"
                value={cityInput}
                onChange={handleCityInput}
                onFocus={() => cityInput.length > 1 && setShowSuggestions(true)}
                placeholder="Entrez une ville (ex: Tokyo)"
                style={{
                  fontSize: 18,
                  padding: '14px 18px',
                  borderRadius: 8,
                  width: '100%',
                  border: '1px solid var(--border-color)',
                  background: 'var(--body-bg)',
                  color: 'var(--text-main)'
                }}
                aria-label="Recherche de ville"
              />
              {showSuggestions && citySuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: 'var(--card-background, #fff)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    zIndex: 10,
                    maxHeight: 220,
                    overflowY: 'auto',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    boxShadow: '0 4px 16px rgba(44,62,80,0.10)'
                  }}
                >
                  {citySuggestions.map(city => (
                    <li
                      key={city.id || `${city.name}-${city.latitude}-${city.longitude}`}
                      onClick={() => handleSuggestionClick(city)}
                      style={{
                        padding: '12px 18px',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        borderBottom: '1px solid var(--border-color)',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      {city.country_code && (
                        <span style={{fontSize: '1.5rem', marginRight: 6}}>
                          {getFlagEmoji(city.country_code)}
                        </span>
                      )}
                      <span>{city.name}</span>
                      {city.country ? (
                        <span style={{color: 'var(--text-secondary)', marginLeft: 6, fontSize: 15}}>
                          {city.country}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Toggle Dark/Light mode */}
            <div style={switchContainer}>
              <label htmlFor="theme-switch" style={switchLabel}>
                {darkMode ? 'Mode sombre' : 'Mode clair'}
              </label>
              <input
                id="theme-switch"
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(v => !v)}
                style={switchInput}
                aria-label="Basculer le mode sombre/clair"
              />
            </div>
          </div>
          <div style={{fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8}}>
            <b>Astuce :</b> Tapez le nom d'une ville pour explorer le monde.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Test;