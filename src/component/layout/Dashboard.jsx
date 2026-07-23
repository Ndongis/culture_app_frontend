import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import ornements from '../../assets/images/ornements.png';
import { AuthContext } from '../context/AuthContext';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';


const GLASS_CSS = `
  @keyframes floatCard {
    0%   { transform: translateY(0px) rotateX(0deg); }
    50%  { transform: translateY(-8px) rotateX(2deg); }
    100% { transform: translateY(0px) rotateX(0deg); }
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .stat-card-glass {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    padding: 22px 20px 18px;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: box-shadow 0.3s ease, transform 0.15s ease;
    animation: floatCard 4s ease-in-out infinite;
    background-size: cover;
    background-position: center;
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.30);
  }

  .stat-card-glass:nth-child(1) { animation-delay: 0s;   }
  .stat-card-glass:nth-child(2) { animation-delay: 0.5s; }
  .stat-card-glass:nth-child(3) { animation-delay: 1s;   }
  .stat-card-glass:nth-child(4) { animation-delay: 1.5s; }

  .stat-card-glass:hover {
    animation-play-state: paused;
    transform: translateY(-12px) scale(1.03);
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.9);
    border-color: rgba(255,255,255,0.35);
  }

  /* shimmer au hover */
  .stat-card-glass::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%);
    transition: left 0.5s ease;
    pointer-events: none;
    z-index: 2;
  }
  .stat-card-glass:hover::before { left: 160%; }

  .card-glass-glow {
    position: absolute;
    width: 130px; height: 130px;
    border-radius: 50%;
    filter: blur(45px);
    opacity: 0.30;
    top: -20px; right: -20px;
    pointer-events: none;
    z-index: 1;
  }

  .card-icon-bg {
    position: absolute;
    right: -10px; bottom: -10px;
    width: 90px; height: 90px;
    opacity: 0.18;
    color: #fff;
    pointer-events: none;
    z-index: 1;
  }

  .card-content-wrap {
    position: relative;
    z-index: 2;
  }

  .stat-label {
    margin: 0 0 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.80);
  }

  .stat-number {
    margin: 0 0 6px;
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    color: #ffffff;
  }

  .stat-trend {
    margin: 0;
    font-size: 11px;
    color: #4ade80;
  }

  .dash-grid {
    animation: fadeSlideUp 0.5s ease both;
  }

  @keyframes spinCircle {
    to { transform: rotate(360deg); }
  }

  .circle-progress {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.20);
    border-top-color: #ffffff;
    animation: spinCircle 0.75s linear infinite;
    display: inline-block;
  }
`;

// ── Icônes ───────────────────────────────────────────────────────────────────

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '100%', height: '100%' }}>
    <path d="M3 21h18" /><path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
  </svg>
);
const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '100%', height: '100%' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);
const ArtifactIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '100%', height: '100%' }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '100%', height: '100%' }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Données ──────────────────────────────────────────────────────────────────




const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// Génère les 12 derniers mois (clé "YYYY-MM" + libellé court FR), du plus ancien au plus récent
function getLast12MonthBuckets() {
  const now = new Date();
  const buckets = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      mois: MONTHS_FR[d.getMonth()],
    });
  }
  return buckets;
}

// Construit les données du graphique "Expositions par mois" à partir de date_exposition (ex: "2026-07-15")
function buildMonthlyData(expositions) {
  const buckets = getLast12MonthBuckets().map(b => ({ ...b, expositions: 0 }));
  const byKey = new Map(buckets.map(b => [b.key, b]));

  expositions.forEach((exp) => {
    const date = exp.date_exposition;
    if (!date || typeof date !== 'string') return;
    const key = date.slice(0, 7); // "YYYY-MM"
    const bucket = byKey.get(key);
    if (bucket) bucket.expositions += 1;
  });

  return buckets.map(({ mois, expositions }) => ({ mois, expositions }));
}

// Construit les données du graphique "Nouvelles expositions ajoutées" (nouvelles vs archivées) par mois.
// NB: adapte le nom du champ de statut ci-dessous (`exp.statut` / `exp.archived`) à ton API si besoin.
function buildNewExpoData(expositions) {
  const buckets = getLast12MonthBuckets().map(b => ({ ...b, nouvelles: 0, archivées: 0 }));
  const byKey = new Map(buckets.map(b => [b.key, b]));

  expositions.forEach((exp) => {
    const date = exp.date_exposition;
    if (!date || typeof date !== 'string') return;
    const key = date.slice(0, 7);
    const bucket = byKey.get(key);
    if (!bucket) return;

    const isArchivee = exp.archived === true || exp.statut === 'archivée' || exp.statut === 'archivee';
    if (isArchivee) bucket.archivées += 1;
    else bucket.nouvelles += 1;
  });

  return buckets.map(({ mois, nouvelles, archivées }) => ({ mois, nouvelles, archivées }));
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

const TooltipDark = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#aaa' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, fontSize: 12, fontWeight: 500, color: p.color }}>{p.name} : {p.value}</p>
      ))}
    </div>
  );
};

const TooltipLight = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#9ca3af' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, fontSize: 12, fontWeight: 500, color: p.color }}>{p.name} : {p.value}</p>
      ))}
    </div>
  );
};

// ── Card avec tilt 3D ────────────────────────────────────────────────────────

function GlassStatCard({ stat, loading }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: dy * -10, y: dx * 10 });
  };

  const handleMouseLeave = () => { setTilt({ x: 0, y: 0 }); setHovered(false); };

  const bgImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${ornements})`;

  return (
    <div
      ref={cardRef}
      className="stat-card-glass"
      style={hovered
        ? { backgroundImage: bgImage, transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-12px) scale(1.03)` }
        : { backgroundImage: bgImage }
      }
      onMouseMove={(e) => { setHovered(true); handleMouseMove(e); }}
      onMouseLeave={handleMouseLeave}
    >

      {/* Orbe coloré */}
      <div className="card-glass-glow" style={{ background: stat.glow }} />

      {/* Icône arrière-plan */}
      <div className="card-icon-bg" aria-hidden="true">{stat.icon}</div>

      {/* Texte */}
      <div className="card-content-wrap">
        <p className="stat-label">{stat.label}</p>
        {loading
          ? <div style={{ margin: '8px 0 10px' }}><span className="circle-progress" /></div>
          : <p className="stat-number">{stat.value}</p>
        }
        <p className="stat-trend">↑ {stat.trend}</p>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {

  const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;
const expoEndpoint = import.meta.env.VITE_EXPO_ENDPOINT;
  const { user } = useContext(AuthContext);

  const [counts, setCounts] = useState({
    biens: null,
    expositions: null,
    institutions: null,
    utilisateurs: null
  });

  const [loadingCounts, setLoadingCounts] = useState(true);

  const [expositions, setExpositions] = useState([]);
  const [loadingExpositions, setLoadingExpositions] = useState(true);

useEffect(() => {
  setLoadingCounts(true);

  fetch(`${apiUrl}${usersEndpoint}/dashboard`,{
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      setCounts({
        biens: data.nbr_biens,
        expositions: data.nbr_expos,
        institutions: data.nbr_institutions,
        utilisateurs:data.nbr_utilisateurs
      });
    })
    .finally(() => setLoadingCounts(false));

}, []);

useEffect(() => {
  setLoadingExpositions(true);

  fetch(`${apiUrl}${expoEndpoint}/api/expositions`, {
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      // Gère les deux formes possibles de réponse: tableau direct ou { expositions: [...] }
      const list = Array.isArray(data) ? data : (data.expositions || []);
      setExpositions(list);
    })
    .catch(err => console.error('Erreur chargement expositions:', err))
    .finally(() => setLoadingExpositions(false));

}, []);

  const monthlyData = useMemo(() => buildMonthlyData(expositions), [expositions]);
  const newExpoData = useMemo(() => buildNewExpoData(expositions), [expositions]);

  const statsData = user?.role === 'administrateur' || user?.role === 'artiste'
    ? [
        { label: 'Institutions',    value: counts.institutions, icon: <BuildingIcon />,  trend: 'Active',      glow: '#6366f1' },
        { label: 'Expositions',     value: counts.expositions,  icon: <GalleryIcon />,   trend: 'En cours',    glow: '#22d3ee' },
        { label: 'Biens Culturels', value: counts.biens,        icon: <ArtifactIcon />,  trend: 'Répertoriés', glow: '#f59e0b' },
      ]
    : [
        { label: 'Utilisateurs',    value: counts.utilisateurs, icon: <BuildingIcon />,  trend: 'Active',      glow: '#6366f1' },
        { label: 'Expositions',     value: counts.expositions,  icon: <GalleryIcon />,   trend: 'En cours',    glow: '#22d3ee' },
        { label: 'Biens Culturels', value: counts.biens,        icon: <ArtifactIcon />,  trend: 'Répertoriés', glow: '#f59e0b' },
      ];

  return (
    <>
      <style>{GLASS_CSS}</style>

      <div style={S.page}>

        {/* Header */}
        
        {/* Stat cards */}
        <div style={S.statGrid} className="dash-grid">
          {statsData.map((stat) => (
            <GlassStatCard key={stat.label} stat={stat} loading={loadingCounts} />
          ))}
        </div>

        {/* Chart 1 — fond blanc */}
        <div style={S.chartLight} className="dash-grid">
          <p style={S.chartTitleLight}>Expositions par mois</p>
          <p style={S.chartSubLight}>{loadingExpositions ? 'Chargement…' : 'Évolution sur 12 mois'}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="mois" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipLight />} />
              <Line type="monotone" dataKey="expositions" name="Expositions"
                stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — fond noir */}
        <div style={S.chartDark} className="dash-grid">
          <p style={S.chartTitleDark}>Nouvelles expositions ajoutées</p>
          <p style={S.chartSubDark}>{loadingExpositions ? 'Chargement…' : 'Ajouts récents par mois'}</p>
          <div style={S.legendRow}>
            <span style={S.legendItem}><span style={{ ...S.dot, background: '#22d3ee' }} /><span style={{ color: '#888' }}>Nouvelles</span></span>
            <span style={S.legendItem}><span style={{ ...S.dot, background: '#f59e0b' }} /><span style={{ color: '#888' }}>Archivées</span></span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newExpoData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }} barCategoryGap="40%">
              <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
              <XAxis dataKey="mois" tick={{ fill: '#555', fontSize: 11 }} axisLine={{ stroke: '#222' }} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipDark />} />
              <Bar dataKey="nouvelles" name="Nouvelles" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="archivées" name="Archivées" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  page: {
    background: '#f3f4f6',
    minHeight: '100vh',
    padding: '28px 24px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    boxSizing: 'border-box',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title:    { margin: 0, fontSize: 20, fontWeight: 700, color: '#111' },
  subtitle: { margin: '4px 0 0', fontSize: 12, color: '#9ca3af' },
  dateBadge: {
    fontSize: 12, color: '#6b7280',
    background: '#fff', padding: '6px 14px',
    borderRadius: 20, border: '1px solid #e5e7eb',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 20,
  },
  chartLight: {
    background: '#fff', borderRadius: 20,
    border: '1px solid #e5e7eb',
    padding: '22px 24px 18px', marginBottom: 20,
  },
  chartTitleLight: { margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111' },
  chartSubLight:   { margin: '0 0 18px', fontSize: 11, color: '#9ca3af' },
  chartDark: {
    background: '#111', borderRadius: 20,
    border: '1px solid #1e1e1e',
    padding: '22px 24px 18px',
  },
  chartTitleDark: { margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#e5e7eb' },
  chartSubDark:   { margin: '0 0 14px', fontSize: 11, color: '#444' },
  legendRow:  { display: 'flex', gap: 16, marginBottom: 10 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 },
  dot:        { width: 8, height: 8, borderRadius: 2, display: 'inline-block' },
};