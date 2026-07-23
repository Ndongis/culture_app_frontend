import React, { useState, useContext } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../component/context/AuthContext';
import ornements_clair from '../assets/images/ornements_clair.png';
const ICONS = {
  dashboard:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  utilisateurs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  artistes:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  institutions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>,
  biens:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  expositions:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  modele_salle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  notifications:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  categories:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" strokeLinecap="round"/></svg>,
  themes:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  menu:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chevronDown:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>,
  palette:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  moon:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sun:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  search:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const ALL_MENU_ITEMS = [
  { name: 'Tableau de bord',      key: 'dashboard',    route: '/admin/dashboard' },
  { name: 'Utilisateurs',   key: 'utilisateurs', route: '/admin/utilisateurs' },
  { name: 'Artistes',       key: 'artistes',     route: '/admin/artistes' },
  { name: 'Institutions',   key: 'institutions', route: '/admin/institutions' },
  { name: 'Biens Culturels',key: 'biens',        route: '/admin/biens-culturels' },
  { name: 'Expositions',    key: 'expositions',  route: '/admin/expositions' },
  { name: 'Catégories',     key: 'categories',   route: '/admin/categories' },
  { name: 'Thèmes',         key: 'themes',       route: '/admin/themes' },
  { name: 'Modèle Salle',   key: 'modele_salle', route: '/admin/modele_salle' },
];

// Rôles → clés de menu autorisées
const MENU_BY_ROLE = {
  administrateur:    ['dashboard', 'utilisateurs', 'artistes', 'institutions', 'biens', 'expositions', 'categories', 'themes', 'modele_salle', 'notifications'],
  admin_institution: ['biens', 'expositions', 'utilisateurs'],
  conservateur:      ['biens', 'expositions'],
  curateur:          ['biens', 'expositions'],
  visiteur:          ['institutions'],
  artiste:           ['biens', 'expositions'],
};

// Labels affichables pour les rôles
const ROLE_LABELS = {
  administrateur:    'Administrateur',
  admin_institution: 'Admin Institution',
  conservateur:      'Conservateur',
  curateur:          'Curateur',
  visiteur:          'Visiteur',
  artiste:           'Artiste',
};

export default function HomeUser() {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed]       = useState(false);
  const [darkSidebar, setDarkSidebar]   = useState(true);
  const [hoveredItem, setHoveredItem]   = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  // ── Menu filtré selon le rôle ──────────────────────────────────────────────
  const role = user?.role || 'visiteur';
  const allowedKeys = MENU_BY_ROLE[role] || [];
  const menuItems = ALL_MENU_ITEMS.filter(item => allowedKeys.includes(item.key));

  const pageName = ALL_MENU_ITEMS.find(i => i.route === location.pathname)?.name ?? 'Dashboard';
  const w = collapsed ? 70 : 250;

  // Initiales de l'utilisateur
  const initials = user
    ? `${(user.prenom || '')[0] || ''}${(user.nom || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';
  const fullName  = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur' : 'Utilisateur';
  const userEmail = user?.email || '';

  // Couleurs sidebar
  const sb = darkSidebar
    ? { bg: '#1a1a1a', text: '#ffffff', subtext: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)', activeItemBg: 'rgba(255,255,255,0.12)', hoverBg: 'rgba(255,255,255,0.07)' }
    : { bg: '#ffffff', text: '#111111', subtext: 'rgba(0,0,0,0.45)',       border: 'rgba(0,0,0,0.1)',         activeItemBg: 'rgba(0,0,0,0.08)',         hoverBg: 'rgba(0,0,0,0.05)'         };

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <style>{`
        body { overflow: hidden; margin: 0; }
        * { box-sizing: border-box; }
        .topbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .topbar-title { font-size: 1.2rem; font-weight: 700; color: #111111; margin: 0; }
        .search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f3f4f6; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 8px 14px;
        }
        .search-wrap input { background: none; border: none; outline: none; font-size: 14px; color: #111; width: 180px; }
        .notif-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: #f3f4f6; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #111; position: relative;
        }
        .notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; background: #f97316; border-radius: 50%; }
        .page-content {
          flex: 1; overflow-y: auto; background: #f8f9fa; padding: 24px;
          position: relative;
        }
        @keyframes ornFillLeft {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          10%  { opacity: 0.05; }
          40%  { clip-path: inset(0 0% 0 0);   opacity: 0.05; }
          50%  { clip-path: inset(0 0% 0 0);   opacity: 0; }
          51%  { clip-path: inset(0 0 0 100%); opacity: 0; }
          60%  { opacity: 0.05; }
          90%  { clip-path: inset(0 0 0 0%);   opacity: 0.05; }
          100% { clip-path: inset(0 0 0 0%);   opacity: 0; }
        }
        .page-ornements {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .page-ornements img {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0;
          animation: ornFillLeft 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: clip-path, opacity;
        }
        .page-outlet {
          position: relative;
          z-index: 1;
        }
        .role-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
          background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;
        }
        .role-badge-light {
          background: rgba(0,0,0,0.07); color: rgba(0,0,0,0.6);
          border: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: w, minWidth: w, height: '100vh',
          background: sb.bg,
          borderRight: `1px solid ${sb.border}`,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s, min-width 0.3s, background 0.3s',
          overflow: 'hidden', flexShrink: 0,
        }}>

          {/* Logo + toggle collapse */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${sb.border}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 10 }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                
              </div>
            )}
            <button onClick={() => setCollapsed(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sb.text, display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, flexShrink: 0 }}>
              {ICONS.menu}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: 10, overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const isActive  = location.pathname === item.route;
              const isHovered = hoveredItem === item.route;
              return (
                <Link
                  key={item.route}
                  to={item.route}
                  title={collapsed ? item.name : ''}
                  onMouseEnter={() => setHoveredItem(item.route)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 18px',
                    borderLeft: `3px solid ${isActive ? sb.text : 'transparent'}`,
                    background: isActive ? sb.activeItemBg : isHovered ? sb.hoverBg : 'transparent',
                    color: sb.text,
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14, whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                    margin: '2px 8px 2px 0',
                    borderRadius: '0 8px 8px 0',
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  <span style={{ flexShrink: 0, color: sb.text, opacity: isActive ? 1 : 0.8 }}>{ICONS[item.key]}</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Toggle thème sidebar */}
          <div style={{ padding: '12px 18px', borderTop: `1px solid ${sb.border}` }}>
            <button
              onClick={() => setDarkSidebar(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8,
                justifyContent: 'center',
                width: '100%', background: sb.activeItemBg,
                border: `1px solid ${sb.border}`,
                borderRadius: 10, padding: '8px 12px',
                cursor: 'pointer', color: sb.text,
                fontSize: 13, fontWeight: 500,
                transition: 'background 0.2s',
              }}
              title={darkSidebar ? 'Mode clair' : 'Mode sombre'}
            >
              {darkSidebar ? ICONS.sun : ICONS.moon}
              {!collapsed && <span>{darkSidebar ? 'Clair' : 'Sombre'}</span>}
            </button>
          </div>

          {/* User */}
          {!collapsed && (
            <div style={{ borderTop: `1px solid ${sb.border}`, position: 'relative' }}>
              {/* Dropdown menu */}
              {userDropdown && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 6px)', left: 12, right: 12,
                  background: darkSidebar ? '#2a2a2a' : '#ffffff',
                  border: `1px solid ${sb.border}`,
                  borderRadius: 10, overflow: 'hidden',
                  boxShadow: '0 -6px 24px rgba(0,0,0,0.18)',
                  zIndex: 50,
                }}>
                  <button
                    onClick={() => { logout(); setUserDropdown(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                      padding: '10px 14px', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#ef4444',
                      fontSize: 13, fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {ICONS.logout}
                    Se déconnecter
                  </button>
                </div>
              )}

              {/* Trigger */}
              <div
                onClick={() => setUserDropdown(p => !p)}
                style={{ padding: '14px 18px', cursor: 'pointer', transition: 'background 0.15s', borderRadius: userDropdown ? '0' : undefined }}
                onMouseEnter={e => e.currentTarget.style.background = sb.hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: sb.activeItemBg, border: `1px solid ${sb.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: sb.text,
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {user?.photo_profil
                      ? <img src={`http://localhost:8181${user.photo_profil}`} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initials
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: sb.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: 11, color: sb.subtext, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userEmail}
                    </div>
                    <span className={`role-badge ${darkSidebar ? '' : 'role-badge-light'}`} style={{ marginTop: 3, display: 'inline-block' }}>
                      {ROLE_LABELS[role] || role}
                    </span>
                  </div>
                  <span style={{
                    color: sb.text, opacity: 0.6,
                    transition: 'transform 0.2s',
                    transform: userDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'flex',
                  }}>{ICONS.chevronDown}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="topbar">
            <h2 className="topbar-title">{pageName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <div className="search-wrap">
  <span style={{ color: '#9ca3af' }}>{ICONS.search}</span>
  <input
    type="text"
    placeholder="Rechercher..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
            {/*  <div className="notif-btn">
                {ICONS.bell}
                <span className="notif-dot" />
              </div>*/}
            </div>
          </div>
          <div className="page-content">
            <div className="page-ornements">
              <img src={ornements_clair} alt="" aria-hidden="true" />
            </div>
            <div className="page-outlet">
              <Outlet context={{searchTerm}}/>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}