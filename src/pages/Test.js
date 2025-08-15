import React, { useEffect, useState } from 'react';
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

const cities = [
  { name: 'Paris', latitude: 48.8534, longitude: 2.3488 },
  { name: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
  { name: 'Lyon', latitude: 45.75, longitude: 4.85 },
  { name: 'Toulouse', latitude: 43.6045, longitude: 1.4442 },
  { name: 'Nice', latitude: 43.7031, longitude: 7.2661 },
  { name: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
  { name: 'Montpellier', latitude: 43.6119, longitude: 3.8777 },
  { name: 'Strasbourg', latitude: 48.5839, longitude: 7.7455 },
  { name: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
  { name: 'Lille', latitude: 50.6333, longitude: 3.0667 },
  { name: 'Rennes', latitude: 48.1147, longitude: -1.6794 },
  { name: 'Reims', latitude: 49.2628, longitude: 4.0347 },
  { name: 'Le Havre', latitude: 49.4939, longitude: 0.1079 },
  { name: 'Saint-Étienne', latitude: 45.4339, longitude: 4.39 },
  { name: 'Toulon', latitude: 43.1258, longitude: 5.9306 },
  { name: 'Grenoble', latitude: 45.1715, longitude: 5.7224 },
  { name: 'Dijon', latitude: 47.3167, longitude: 5.0167 },
  { name: 'Angers', latitude: 47.4784, longitude: -0.5632 },
  { name: 'Nîmes', latitude: 43.838, longitude: 4.361 },
  { name: 'Villeurbanne', latitude: 45.7667, longitude: 4.8833 }
];

const dashboardStyles = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: '0',
  fontFamily: 'Segoe UI, Arial, sans-serif'
};

const mainContainer = {
  display: 'flex',
  flexDirection: 'row',
  maxWidth: 1400,
  margin: '0 auto',
  paddingTop: 40,
  alignItems: 'flex-start'
};

const leftCol = {
  flex: 3,
  marginRight: 40,
  minWidth: 0 // pour éviter l'overflow
};

const rightCol = {
  flex: '0 0 320px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'sticky',
  top: 40,
  height: 'fit-content',
  background: 'transparent'
};

const cardStyles = {
  width: '100%',
  background: '#fff',
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(44,62,80,0.12)',
  padding: '36px 40px 32px 40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const titleStyles = {
  fontSize: 32,
  fontWeight: 700,
  color: '#2d3a4b',
  marginBottom: 12,
  letterSpacing: 1
};

const subtitleStyles = {
  fontSize: 18,
  color: '#6c7a89',
  marginBottom: 32
};

const chartContainerStyles = {
  width: '100%',
  maxWidth: 1000,
  minHeight: 400,
  background: '#f8fafc',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 2px 8px rgba(44,62,80,0.06)'
};

const loaderStyles = {
  color: '#2d3a4b',
  fontSize: 22,
  marginTop: 80,
  textAlign: 'center'
};

const errorStyles = {
  color: '#e74c3c',
  fontSize: 20,
  marginTop: 80,
  textAlign: 'center'
};

const selectStyles = {
  fontSize: 18,
  padding: '12px 18px',
  borderRadius: 8,
  border: '1px solid #c3cfe2',
  marginTop: 16,
  background: '#f5f7fa',
  color: '#2d3a4b',
  outline: 'none',
  width: '100%'
};

const currentTempGlobalContainer = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '48px 0 32px 0'
};

const currentTempText = {
  fontSize: 96,
  fontWeight: 900,
  color: '#e74c3c',
  marginBottom: 8,
  letterSpacing: 2,
  lineHeight: 1,
  textShadow: '0 2px 12px rgba(231,76,60,0.08)'
};

const currentTempCity = {
  fontSize: 32,
  fontWeight: 500,
  color: '#2d3a4b',
  marginBottom: 0,
  lineHeight: 1,
  letterSpacing: 1
};

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
  // Bleu clair (173,216,230) à Bleu foncé (0, 70, 140)
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
      if (current.length >= 3) {
        heatwaveDays.push([...current]);
      }
      current = [];
    }
  }
  if (current.length >= 3) {
    heatwaveDays.push([...current]);
  }
  // Retourne un tableau d'indices des jours de canicule
  return heatwaveDays.flat();
}

const Test = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);

  // Calcule dynamiquement la plage de dates (90 derniers jours)
  function getDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 89); // 90 jours incluant aujourd'hui
    const toISO = d => d.toISOString().slice(0, 10);
    return { start: toISO(start), end: toISO(end) };
  }

  // Récupère la température actuelle pour la ville sélectionnée
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

      // S'assurer qu'on ne garde que les 90 derniers jours (au cas où l'API en renverrait plus)
      if (dates.length > 90) {
        const startIdx = dates.length - 90;
        dates = dates.slice(startIdx);
        tempMax = tempMax.slice(startIdx);
        tempMin = tempMin.slice(startIdx);
      }

      // Détection des indices de jours de canicule
      const heatwaveIndices = detectHeatwaves(tempMax, tempMin);

      // Dégradé pour max (bleu->rouge) et min (bleu clair->bleu foncé)
      const minOfMax = Math.min(...tempMax);
      const maxOfMax = Math.max(...tempMax);
      const minOfMin = Math.min(...tempMin);
      const maxOfMin = Math.max(...tempMin);

      const backgroundColorsMax = tempMax.map((t, i) =>
        heatwaveIndices.includes(i)
          ? 'rgba(255, 60, 60, 0.85)' // fond rouge pour canicule
          : getColorGradient(minOfMax, maxOfMax, t)
      );
      const backgroundColorsMin = tempMin.map((t, i) =>
        heatwaveIndices.includes(i)
          ? 'rgba(255, 60, 60, 0.85)' // fond rouge pour canicule
          : getBlueGradient(minOfMin, maxOfMin, t)
      );

      setData({
        labels: dates.map(d => d.slice(0, 10)), // yyyy-MM-dd
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
      console.error(err);
      setError('Erreur lors de la récupération des données');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureData(selectedCity);
    fetchCurrentTemperature(selectedCity);
    // eslint-disable-next-line
  }, [selectedCity]);

  const handleCityChange = (e) => {
    const city = cities.find(c => c.name === e.target.value);
    setSelectedCity(city);
  };

  if (loading) return <div style={loaderStyles}>Chargement des données…</div>;
  if (error) return <div style={errorStyles}>{error}</div>;

  return (
    <div style={dashboardStyles}>
      {/* Température actuelle centrée en haut */}
      <div style={currentTempGlobalContainer}>
        <span style={currentTempText}>
          {currentTemp !== null ? `${currentTemp}°C` : 'Température indisponible'}
        </span>
        <span style={currentTempCity}>
          {selectedCity.name}
        </span>
      </div>
      {/* Contenu principal en flex */}
      <div style={mainContainer}>
        <div style={leftCol}>
          <div style={cardStyles}>
            <div style={titleStyles}>Dashboard Température France</div>
            <div style={subtitleStyles}>
              Températures min & max journalières à {selectedCity.name} (90 derniers jours)
            </div>
            <div style={chartContainerStyles}>
              <Bar
                data={data}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        color: '#2d3a4b',
                        font: { size: 16 }
                      }
                    },
                    title: {
                      display: false
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxTicksLimit: 20,
                        color: '#6c7a89',
                        font: { size: 12 },
                        callback: function(value, index, ticks) {
                          // Affiche la date au format yyyy-MM-dd
                          return data.labels[index];
                        }
                      },
                      grid: {
                        color: '#eaeaea'
                      },
                      stacked: false
                    },
                    y: {
                      beginAtZero: false,
                      ticks: {
                        color: '#6c7a89',
                        font: { size: 14 }
                      },
                      grid: {
                        color: '#eaeaea'
                      },
                      stacked: false
                    }
                  }
                }}
              />
            </div>
            <div style={{marginTop: 24, color: '#e74c3c', fontWeight: 500}}>
              <span style={{background: 'rgba(255,60,60,0.85)', padding: '0 8px', borderRadius: 4, marginRight: 8}}></span>
              Périodes de canicule : ≥3 jours à plus de 36°C le jour et ≥3 nuits à plus de 21°C
            </div>
          </div>
        </div>
        <div style={rightCol}>
          <label htmlFor="city-select" style={{ fontWeight: 600, color: '#2d3a4b', fontSize: 18, marginBottom: 8, marginTop: 24 }}>
            Choisissez une ville :
          </label>
          <select
            id="city-select"
            style={selectStyles}
            value={selectedCity.name}
            onChange={handleCityChange}
          >
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Test;