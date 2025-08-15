import React from 'react';
import { ReactComponent as FranceSVG } from './imgs/france.svg'; // Assurez-vous que le fichier SVG est dans le même dossier

// Limites géographiques France métropolitaine (approximatif)
const FRANCE_BOUNDS = {
  minLon: -5.5,
  maxLon: 9.5,
  minLat: 41,
  maxLat: 51.5,
};

// Dimensions du SVG Opendatasoft
const WIDTH = 600;
const HEIGHT = 551;

// Fonction de projection (longitude/latitude -> x/y SVG)
function project([lon, lat]) {
  const x = ((lon - FRANCE_BOUNDS.minLon) / (FRANCE_BOUNDS.maxLon - FRANCE_BOUNDS.minLon)) * WIDTH;
  const y =
    ((FRANCE_BOUNDS.maxLat - lat) / (FRANCE_BOUNDS.maxLat - FRANCE_BOUNDS.minLat)) * HEIGHT;
  return [x, y];
}

// Exemple de points
const points = [
  { name: "Paris", coordinates: [2.3522, 48.8566] },
  { name: "Lyon", coordinates: [4.8357, 45.7640] },
  { name: "Marseille", coordinates: [5.3698, 43.2965] },
];

const Companion = () => (
  <div style={{ width: WIDTH, margin: "0 auto", position: "relative" }}>
    {/* SVG de la France en fond */}
    <FranceSVG width={WIDTH} height={HEIGHT} style={{ position: "absolute", left: 0, top: 0 }} />
    {/* Points superposés */}
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {points.map(({ name, coordinates }) => {
        const [x, y] = project(coordinates);
        return (
          <g key={name}>
            <circle cx={x} cy={y} r={8} fill="#F53" stroke="#fff" strokeWidth="2" />
            <text x={x} y={y - 14} textAnchor="middle" fontSize="14" fontFamily="sans-serif" fill="#222">
              {name}
            </text>
          </g>
        );
      })}
    </svg>
    {/* Pour garder la place dans le flux */}
    <div style={{ width: WIDTH, height: HEIGHT, visibility: "hidden" }} />
  </div>
);

export default Companion;