import { useContext } from 'react';
import { AuthContext } from '../component/context/AuthContext';

// Clés autorisées par rôle (doit correspondre à MENU_BY_ROLE dans HomeUser)
const ACCESS_BY_ROLE = {
  administrateur:    ['dashboard', 'utilisateurs', 'artistes', 'institutions', 'biens', 'expositions', 'categories', 'themes', 'modele_salle', 'notifications'],
  admin_institution: ['biens', 'expositions', 'utilisateurs'],
  conservateur:      ['biens', 'expositions'],
  curateur:          ['biens', 'expositions'],
  visiteur:          ['institutions'],
  artiste:           ['biens', 'expositions'],
};

export default function ProtectedPage({ pageKey, children }) {
  const { user } = useContext(AuthContext);
  const role = user?.role || 'visiteur';
  const allowed = ACCESS_BY_ROLE[role] || [];

  if (!allowed.includes(pageKey)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#fff3f3', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" width="36" height="36">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
            Accès refusé
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 320 }}>
            Vous n'avez pas accès à cette page.<br />
            Contactez un administrateur si nécessaire.
          </p>
        </div>
        
      </div>
    );
  }

  return children;
}