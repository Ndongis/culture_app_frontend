import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;

const NATIONALITE_CHOICES = [
    { value: 'all', label: 'Toutes' },
    { value: 'Sénégalaise', label: 'Sénégalaise' },
    { value: 'Française', label: 'Française' },
    { value: 'Américaine', label: 'Américaine' },
    { value: 'Autre', label: 'Autre' },
];

const CARD_GRADIENTS = [
    'linear-gradient(145deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
    'linear-gradient(145deg, #84cc16 0%, #a3e635 50%, #d9f99d 100%)',
    'linear-gradient(145deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%)',
    'linear-gradient(145deg, #f97316 0%, #fb923c 50%, #fed7aa 100%)',
    'linear-gradient(145deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)',
    'linear-gradient(145deg, #8b5cf6 0%, #a78bfa 50%, #ddd6fe 100%)',
];

// ══════════════════════════════════════════════════════════════════════════════
// ICÔNES SVG
// ══════════════════════════════════════════════════════════════════════════════

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ArtisteSvgIcon = ({ size = 48 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M17 3.5a2.5 2.5 0 0 1 0 5" strokeWidth="1.2" opacity="0.5"/>
    </svg>
);
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const LocationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Artistes() {
    const { user: currentUser } = useContext(AuthContext);
    const { searchTerm } = useOutletContext();

    const [artistes, setArtistes]             = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [nationaliteFilter, setNationaliteFilter] = useState('all');
  

    const [showAddModal, setShowAddModal]         = useState(false);
    const [showEditModal, setShowEditModal]       = useState(false);
    const [showDeleteArtisteModal, setShowDeleteArtisteModal]   = useState(false);

    const [showDeleteCompteModal, setShowDeleteCompteModal]   = useState(false);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedArtiste, setSelectedArtiste]   = useState(null);
    const [formLoading, setFormLoading]           = useState(false);

    const [formData, setFormData] = useState({
        nom: '', prenom: '', date_naissance: '',date_deces:'',
        nationalite: '', biographie: '', photo_profil: null,
        can_connected: true, email: '', password: '', role: 'artiste',
    });

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => { fetchArtistes(); }, []);

    const fetchArtistes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}${usersEndpoint}/api/artistes`, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Erreur de chargement');
            const data = await res.json();
            setArtistes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Filtrage ──────────────────────────────────────────────────────────────
   const filteredArtistes = artistes.filter((a) => {
    const matchNat = nationaliteFilter === 'all' || a.nationalite === nationaliteFilter;
    const q = searchTerm.toLowerCase();   // ← remplacer "search" par "searchTerm"
    const matchSearch =
        !q ||
        (a.nom + ' ' + a.prenom).toLowerCase().includes(q) ||
        a.nationalite?.toLowerCase().includes(q);
    return matchNat && matchSearch;
});

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const resetForm = () => {
        setFormData({ nom: '', prenom: '', date_naissance: '', date_deces: '',nationalite: '', biographie: '', photo_profil: null, can_connected: true, email: '', password: '', role: 'artiste' });
        setSelectedArtiste(null);
    };

    const handleAdd = async () => {
        setFormLoading(true);
        try {
            // ── Étape 1 : créer l'artiste (sans email/password/can_connected/role)
            const { email, password, can_connected, role, ...artisteFields } = formData;
            const fd = new FormData();
            Object.entries(artisteFields).forEach(([k, v]) => { if (v) fd.append(k, v); });
            const res = await fetch(`${apiUrl}${usersEndpoint}/api/artistes`, {
                method: 'POST', credentials: 'include', body: fd,
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erreur lors de l\'ajout'); }
            const newArtiste = await res.json();

            // ── Étape 2 : si can_connected + email + password → créer le compte
            if (can_connected && email && password) {
                const accountRes = await fetch(
                    `${apiUrl}${usersEndpoint}/artistes/${newArtiste.id}/create-account/`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    }
                );
                if (!accountRes.ok) {
                    const e = await accountRes.json();
                    alert(`Artiste créé mais erreur compte : ${e.email || e.password || e.error || 'Erreur inconnue'}`);
                }
            }

            await fetchArtistes();
            setShowAddModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async () => {
        setFormLoading(true);
        try {
            // ── Cas 1 : l'artiste n'avait pas de compte et on coche "Peut se connecter"
            //           → appel create-account/ en premier
            const needsAccountCreation =
                !selectedArtiste.has_account &&
                formData.can_connected &&
                formData.email &&
                formData.password;

            if (needsAccountCreation) {
                const accountRes = await fetch(
                    `${apiUrl}${usersEndpoint}/artistes/${selectedArtiste.id}/create-account/`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email:    formData.email,
                            password: formData.password,
                        }),
                    }
                );
                if (!accountRes.ok) {
                    const e = await accountRes.json();
                    throw new Error(e.email || e.password || e.error || 'Erreur création du compte');
                }
            }

            // ── Cas 2 : mise à jour classique des infos de l'artiste
            //           (on exclut email/password/can_connected — gérés par les endpoints dédiés)
            const { photo_profil, email, password, can_connected, role, ...artisteFields } = formData;
            const hasFile = formData.photo_profil instanceof File;
            let res;
            if (hasFile) {
                const fd = new FormData();
                Object.entries(artisteFields).forEach(([k, v]) => { if (v) fd.append(k, v); });
                fd.append('photo_profil', formData.photo_profil);
                res = await fetch(`${apiUrl}${usersEndpoint}/api/artistes/${selectedArtiste.id}`, {
                    method: 'PATCH', credentials: 'include', body: fd,
                });
            } else {
                res = await fetch(`${apiUrl}${usersEndpoint}/api/artistes/${selectedArtiste.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(artisteFields),
                });
            }
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erreur lors de la modification'); }

            await fetchArtistes();
            setShowEditModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${usersEndpoint}/api/artistes/${selectedArtiste.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur de suppression');
            await fetchArtistes();
            setShowDeleteArtisteModal(false); setSelectedArtiste(null);
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

     const handleDeleteCompte = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${usersEndpoint}/artistes/${selectedArtiste.id}/detach-account/`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur de suppression');
            await fetchArtistes();
            setShowDeleteArtisteModal(false); setSelectedArtiste(null);
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const openEditModal = (a) => {
        setSelectedArtiste(a);
        // Si l'artiste n'a pas de compte (has_account === false),
        // le checkbox "Peut se connecter" est forcé à false
        const canConnected = a.has_account === false ? false
            : a.can_connected !== undefined ? a.can_connected : true;
        setFormData({
            nom: a.nom || '', prenom: a.prenom || '',
            date_naissance: a.date_naissance || '',
            date_deces: a.date_deces || '',
            nationalite: a.nationalite || '',
            biographie: a.biographie || '',
            photo_profil: null,
            can_connected: canConnected,
            email: a.email || '',
            password: '',
            role: a.role || 'artiste',
        });
        setShowEditModal(true);
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            <style>{`
                .artistes-page {
                    --primary: #000000;
                    --danger: #ef4444;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --gray: #64748b;
                    min-height: 100vh;
                    background: #ffffff;
                    padding: 40px 20px;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* ── HEADER ── */
                .artistes-header {
                    max-width: 1400px;
                    margin: 0 auto 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }
                .artistes-title-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .artistes-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #000;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .artistes-count {
                    background: #000;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                /* ── CONTROLS ── */
                .controls-bar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f8f9fa;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 10px 16px;
                    color: var(--gray);
                }
                .search-box input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 14px;
                    color: #000;
                    width: 200px;
                }
                .search-box input::placeholder { color: #9ca3af; }
                .btn-add {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .btn-add:hover {
                    background: #1a1a1a;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                }

                /* ── ROLE PILLS (nationalité) ── */
                .role-filters {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .role-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 16px;
                    border-radius: 30px;
                    border: 1.5px solid #e5e7eb;
                    background: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    color: #444;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .role-pill:hover {
                    border-color: #000;
                    color: #000;
                }
                .role-pill.active {
                    background: #000;
                    color: #fff;
                    border-color: #000;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.22);
                }
                .role-pill.active .pill-dot { background: #fff; }
                .pill-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .pill-count {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 20px;
                    background: rgba(0,0,0,0.08);
                    color: inherit;
                }
                .role-pill.active .pill-count { background: rgba(255,255,255,0.2); }

                /* ── GRID ── */
                .artistes-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    box-sizing: border-box;
                }
                @media (max-width: 1100px) {
                    .artistes-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 750px) {
                    .artistes-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
                }
                @media (max-width: 420px) {
                    .artistes-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                }

                /* ── CARD ── */
                .artiste-card {
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    aspect-ratio: 3/4;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .artiste-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.18);
                }
                .artiste-card:hover .card-actions-top {
                    opacity: 1;
                    transform: translateY(0);
                }
                .card-bg {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: transform 0.4s ease;
                }
                .artiste-card:hover .card-bg { transform: scale(1.04); }
                .card-content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 16px;
                    z-index: 3;
                }

                /* ── ACTIONS ── */
                .card-actions-top {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                    opacity: 0;
                    transform: translateY(-8px);
                    transition: all 0.3s ease;
                }
                .btn-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
                .btn-icon.view  { background: rgba(59,130,246,0.3); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); }
                .btn-icon.view:hover { background: rgba(59,130,246,0.5); }
                .btn-icon.edit  { background: rgba(255,255,255,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
                .btn-icon.edit:hover { background: rgba(255,255,255,0.45); }
                .btn-icon.delete { background: rgba(239,68,68,0.3); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }
                .btn-icon.delete:hover { background: rgba(239,68,68,0.5); }

                /* ── CARD BOTTOM ── */
                .card-body-bottom {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 0 2px 2px;
                }
                .card-avatar-placeholder {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(12px);
                    border: 3px solid rgba(255,255,255,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,0.85);
                }
                .card-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                    margin: 0;
                    line-height: 1.2;
                    text-shadow: 0 1px 6px rgba(0,0,0,0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-nat-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: rgba(255,255,255,0.8);
                    font-size: 12px;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .card-nat-badge {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.3);
                    backdrop-filter: blur(10px);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .card-btn-bottom {
                    width: 100%;
                    padding: 13px;
                    border-radius: 40px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    background: rgba(255,255,255,0.72);
                    color: #111;
                    backdrop-filter: blur(14px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .card-btn-bottom:hover { background: rgba(255,255,255,0.92); box-shadow: 0 4px 18px rgba(0,0,0,0.15); }

                /* ── EMPTY / LOADING ── */
                .empty-state { text-align: center; padding: 80px 20px; color: var(--gray); grid-column: 1/-1; }
                .empty-state svg { width: 80px; height: 80px; margin-bottom: 24px; opacity: 0.4; }
                .empty-state h3 { font-size: 22px; color: #000; margin: 0 0 12px; }
                .empty-state p  { font-size: 15px; margin: 0; }
                .loading-state  { text-align: center; padding: 100px 20px; color: var(--gray); }
                .spinner {
                    width: 50px; height: 50px;
                    border: 3px solid #e5e7eb; border-top-color: #000;
                    border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ── MODALS ── */
                .modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .modal-box {
                    background: #fff; border-radius: 24px; width: 100%; max-width: 560px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 25px 80px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                }
                .modal-box.modal-large { max-width: 700px; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .modal-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 24px 28px; border-bottom: 1px solid #e5e7eb;
                }
                .modal-title { font-size: 20px; font-weight: 700; color: #000; margin: 0; }
                .modal-close {
                    background: #f3f4f6; border: none; border-radius: 10px;
                    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
                    color: var(--gray); cursor: pointer; transition: all 0.2s;
                }
                .modal-close:hover { background: #fee2e2; color: var(--danger); }
                .modal-body { padding: 28px; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .form-label { font-size: 14px; font-weight: 500; color: #374151; }
                .form-input, .form-select, .form-textarea {
                    background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px;
                    padding: 14px 16px; color: #000; font-size: 15px; transition: all 0.2s;
                    width: 100%; box-sizing: border-box;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none; border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
                }
                .form-input::placeholder, .form-textarea::placeholder { color: #9ca3af; }
                .form-textarea { resize: vertical; min-height: 100px; }

                /* ── CHECKBOX can_connected ── */
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 14px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    user-select: none;
                }
                .checkbox-group:hover { border-color: #000; background: #f3f4f6; }
                .checkbox-group.checked { border-color: #10b981; background: #ecfdf5; }
                .checkbox-toggle {
                    width: 20px; height: 20px;
                    border-radius: 6px;
                    border: 2px solid #d1d5db;
                    background: #fff;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .checkbox-toggle.checked {
                    background: #10b981;
                    border-color: #10b981;
                }
                .checkbox-toggle svg { display: none; }
                .checkbox-toggle.checked svg { display: block; }
                .checkbox-label {
                    font-size: 15px;
                    font-weight: 500;
                    color: #374151;
                    flex: 1;
                }
                .checkbox-group.checked .checkbox-label { color: #065f46; }
                .checkbox-hint {
                    font-size: 12px;
                    color: #9ca3af;
                }
                .checkbox-group.checked .checkbox-hint { color: #6ee7b7; }

                /* Animated section */
                .auth-fields {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    overflow: hidden;
                    transition: max-height 0.35s ease, opacity 0.3s ease;
                    max-height: 300px;
                    opacity: 1;
                }
                .auth-fields.hidden {
                    max-height: 0;
                    opacity: 0;
                    pointer-events: none;
                }
                .file-upload { position: relative; }
                .file-upload-area {
                    border: 2px dashed #d1d5db; border-radius: 12px;
                    padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;
                }
                .file-upload-area:hover { border-color: #000; background: #f9fafb; }
                .file-upload-area.has-file { border-color: var(--success); background: #ecfdf5; }
                .file-upload-area svg { color: var(--gray); margin-bottom: 8px; }
                .file-upload-area p { color: var(--gray); font-size: 14px; margin: 0; }
                .file-upload-area .file-name { color: var(--success); font-weight: 500; }
                .file-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
                .modal-footer {
                    display: flex; gap: 12px; padding: 20px 28px; border-top: 1px solid #e5e7eb;
                }
                .btn-modal {
                    flex: 1; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px;
                    cursor: pointer; transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .btn-cancel { background: #f3f4f6; border: 1px solid #d1d5db; color: #374151; }
                .btn-cancel:hover { background: #e5e7eb; }
                .btn-confirm { background: #000; border: none; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                .btn-confirm:hover { background: #1a1a1a; }
                .btn-confirm.danger { background: #ef4444; box-shadow: 0 4px 15px rgba(239,68,68,0.4); }
                .btn-confirm.danger:hover { background: #dc2626; }
                .btn-modal:disabled { opacity: 0.6; cursor: not-allowed; }
                .delete-message { text-align: center; padding: 20px 0; }
                .delete-message p { color: #374151; font-size: 16px; margin: 0 0 8px; }
                .delete-message strong { color: #000; }
                .delete-warning { color: var(--danger); font-size: 14px; }

                /* ── DETAILS ── */
                .details-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    align-items: start;
                }
                .details-section {
                    background: #f9fafb; border-radius: 16px; padding: 20px;
                }
                .details-section-title {
                    font-size: 16px; font-weight: 600; color: #000;
                    margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;
                }
                .details-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
                .detail-item { display: flex; flex-direction: column; gap: 4px; }
                .detail-item.full-width { grid-column: 1/-1; }
                .detail-label { font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
                .detail-value { font-size: 15px; color: #000; line-height: 1.5; }
                .detail-photo {
                    width: 100%;
                    height: 260px;
                    object-fit: cover;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    display: block;
                }
                .detail-photo-placeholder {
                    width: 100%; height: 260px;
                    display: flex; align-items: center; justify-content: center;
                    background: #f3f4f6; border-radius: 12px;
                    border: 2px dashed #d1d5db; color: #9ca3af; font-size: 14px;
                }

                @media (max-width: 768px) {
                    .form-row { grid-template-columns: 1fr; }
                    .controls-bar { flex-direction: column; }
                    .details-content { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="artistes-page">

                {/* ═══ HEADER ═══ */}
                <header className="artistes-header">
                    <div className="artistes-title-row">
                        <h1 className="artistes-title">Artistes</h1>
                        <span className="artistes-count">{filteredArtistes.length}</span>
                    </div>

                   

                    {/* Ligne 3 : filtres nationalité */}
                    <div className="role-filters">
                        {NATIONALITE_CHOICES.map((n) => (
                            <button
                                key={n.value}
                                className={`role-pill ${nationaliteFilter === n.value ? 'active' : ''}`}
                                onClick={() => setNationaliteFilter(n.value)}
                            >
                                <span className="pill-dot" style={{ background: nationaliteFilter === n.value ? '#fff' : '#ec4899' }} />
                                {n.label}
                                <span className="pill-count">
                                    {n.value === 'all' ? artistes.length : artistes.filter(a => a.nationalite === n.value).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* ═══ CONTENU ═══ */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Chargement des artistes...</p>
                    </div>
                ) : error ? (
                    <div className="loading-state">
                        <p style={{ color: '#ef4444' }}>Erreur : {error}</p>
                    </div>
                ) : (
                    <div className="artistes-grid">
                        {filteredArtistes.length === 0 ? (
                            <div className="empty-state">
                                <ArtisteSvgIcon size={80} />
                                <h3>Aucun artiste trouvé</h3>
                                <p>Modifiez vos filtres ou ajoutez un artiste.</p>
                            </div>
                        ) : (
                            filteredArtistes.map((a, i) => {
                                const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                                const fullName = `${a.prenom || ''} ${a.nom || ''}`.trim() || 'Artiste';

                                return (
                                    <div className="artiste-card" key={a.id}>
                                        {a.photo_profil ? (
                                            <div className="card-bg" style={{ backgroundImage: `url(${a.photo_profil})` }} />
                                        ) : (
                                            <div className="card-bg" style={{ background: gradient }} />
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.18)' }} />
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', zIndex: 2,
                                            background: 'linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.0) 100%)',
                                            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                                            maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
                                            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)',
                                        }} />

                                        <div className="card-content">
                                            <div className="card-actions-top">
                                                <button className="btn-icon view" title="Voir les détails"
                                                    onClick={() => { setSelectedArtiste(a); setShowDetailsModal(true); }}>
                                                    <EyeIcon />
                                                </button>
                                                <button className="btn-icon edit" title="Modifier" onClick={() => openEditModal(a)}>
                                                    <PencilIcon />
                                                </button>
                                                <button className="btn-icon delete" title="Supprimer"
                                                    onClick={() => { setSelectedArtiste(a); setShowDeleteArtisteModal(true); }}>
                                                    <TrashIcon />
                                                </button>
                                            </div>

                                            <div className="card-body-bottom">
                                                <p className="card-name">{fullName}</p>
                                                <div className="card-nat-row">
                                                    <LocationIcon />
                                                    <span>{a.nationalite || 'Nationalité inconnue'}</span>
                                                </div>
                                                <div className="card-meta">
                                                    <span className="card-nat-badge">
                                                        <LocationIcon /> {a.nationalite || '—'}
                                                    </span>
                                                </div>
                                                <button className="card-btn-bottom"
                                                    onClick={() => { setSelectedArtiste(a); setShowDetailsModal(true); }}>
                                                    Voir le profil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* ═══ MODAL AJOUTER ═══ */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ajouter un artiste</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Prénom</label>
                                        <input className="form-input" placeholder="Prénom"
                                            value={formData.prenom}
                                            onChange={(e) => setFormData(p => ({ ...p, prenom: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nom</label>
                                        <input className="form-input" placeholder="Nom"
                                            value={formData.nom}
                                            onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Date de naissance</label>
                                        <input className="form-input" type="text"
                                            value={formData.date_naissance}
                                            onChange={(e) => setFormData(p => ({ ...p, date_naissance: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date de décés</label>
                                        <input className="form-input" type="text"
                                            value={formData.date_deces}
                                            onChange={(e) => setFormData(p => ({ ...p, date_deces: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nationalité</label>
                                        <input className="form-input" placeholder="Ex: Sénégalaise"
                                            value={formData.nationalite}
                                            onChange={(e) => setFormData(p => ({ ...p, nationalite: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biographie</label>
                                    <textarea className="form-textarea" placeholder="Biographie de l'artiste..."
                                        value={formData.biographie}
                                        onChange={(e) => setFormData(p => ({ ...p, biographie: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Photo de profil</label>
                                    <div className={`file-upload-area ${formData.photo_profil ? 'has-file' : ''}`}>
                                        <UploadIcon />
                                        <p className={formData.photo_profil ? 'file-name' : ''}>
                                            {formData.photo_profil ? `✓ ${formData.photo_profil.name}` : 'Cliquez pour uploader une photo'}
                                        </p>
                                        <input type="file" accept="image/*"
                                            onChange={(e) => { const f = e.target.files[0]; if (f) setFormData(p => ({ ...p, photo_profil: f })); }} />
                                    </div>
                                </div>

                                {/* ── Checkbox can_connected ── */}
                                <div className="form-group">
                                    <label className="form-label">Accès à la plateforme</label>
                                    <div
                                        className={`checkbox-group ${formData.can_connected ? 'checked' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, can_connected: !p.can_connected, email: '', password: '' }))}
                                    >
                                        <div className={`checkbox-toggle ${formData.can_connected ? 'checked' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="checkbox-label">Peut se connecter</span>
                                        <span className="checkbox-hint">{formData.can_connected ? 'Compte actif' : 'Aucun accès'}</span>
                                    </div>
                                </div>

                                {/* ── Champs auth (masqués si can_connected = false) ── */}
                                <div className={`auth-fields ${!formData.can_connected ? 'hidden' : ''}`}>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" placeholder="email@exemple.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Mot de passe</label>
                                            <input className="form-input" type="password" placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Rôle</label>
                                            <select className="form-select" value={formData.role}
                                                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}>
                                                <option value="artiste">Artiste</option>
                                                <option value="admin">Administrateur</option>
                                                
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</button>
                            <button className="btn-modal btn-confirm" onClick={handleAdd} disabled={formLoading}>
                                <PlusIcon /> {formLoading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL MODIFIER ═══ */}
            {showEditModal && selectedArtiste && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Modifier l'artiste</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Prénom</label>
                                        <input className="form-input" value={formData.prenom}
                                            onChange={(e) => setFormData(p => ({ ...p, prenom: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nom</label>
                                        <input className="form-input" value={formData.nom}
                                            onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Date de naissance</label>
                                        <input className="form-input" type="text" value={formData.date_naissance}
                                            onChange={(e) => setFormData(p => ({ ...p, date_naissance: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date de décés</label>
                                        <input className="form-input" type="text" value={formData.date_deces}
                                            onChange={(e) => setFormData(p => ({ ...p, date_deces: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nationalité</label>
                                        <input className="form-input" value={formData.nationalite}
                                            onChange={(e) => setFormData(p => ({ ...p, nationalite: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biographie</label>
                                    <textarea className="form-textarea" value={formData.biographie}
                                        onChange={(e) => setFormData(p => ({ ...p, biographie: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Photo de profil</label>
                                    {selectedArtiste.photo_profil && !formData.photo_profil && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 10px', background: '#f3f4f6', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                                            <img src={`${selectedArtiste.photo_profil}`} alt="" style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                                            <span style={{ fontSize: 12, color: '#6b7280' }}>Photo actuelle</span>
                                        </div>
                                    )}
                                    <div className={`file-upload-area ${formData.photo_profil ? 'has-file' : ''}`}>
                                        <UploadIcon />
                                        <p className={formData.photo_profil ? 'file-name' : ''}>
                                            {formData.photo_profil ? `✓ ${formData.photo_profil.name}` : 'Changer la photo (optionnel)'}
                                        </p>
                                        <input type="file" accept="image/*"
                                            onChange={(e) => { const f = e.target.files[0]; if (f) setFormData(p => ({ ...p, photo_profil: f })); }} />
                                    </div>
                                </div>

                                {/* ── Checkbox can_connected ── */}
                                <div className="form-group">
                                    <label className="form-label">Accès à la plateforme</label>
                                    <div
                                        className={`checkbox-group ${formData.can_connected ? 'checked' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, can_connected: !p.can_connected, email: '', password: '' }))}
                                    >
                                        <div className={`checkbox-toggle ${formData.can_connected ? 'checked' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="12" height="12">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="checkbox-label">Peut se connecter</span>
                                        <span className="checkbox-hint">{formData.can_connected ? 'Compte actif' : 'Aucun accès'}</span>
                                    </div>
                                </div>

                                {/* ── Champs auth (masqués si can_connected = false) ── */}
                                <div className={`auth-fields ${!formData.can_connected ? 'hidden' : ''}`}>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" placeholder="email@exemple.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Mot de passe (optionnel)</label>
                                            <input className="form-input" type="password" placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Rôle</label>
                                            <select className="form-select" value={formData.role}
                                                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}>
                                                <option value="artiste">Artiste</option>
                                               
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => { setShowEditModal(false); resetForm(); }}>Annuler</button>
                            <button className="btn-modal btn-confirm" onClick={handleEdit} disabled={formLoading}>
                                <PencilIcon /> {formLoading ? 'Modification...' : 'Modifier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL SUPPRIMER ═══ */}
            {showDeleteArtisteModal && selectedArtiste && (
                <div className="modal-overlay" onClick={() => setShowDeleteArtisteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Supprimer l'artiste</h2>
                            <button className="modal-close" onClick={() => setShowDeleteArtisteModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-message">
                                <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedArtiste.prenom} {selectedArtiste.nom}"</strong> ?</p>
                                <p className="delete-warning">Cette action est irréversible.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDeleteArtisteModal(false)}>Annuler</button>
                            <button className="btn-modal btn-confirm danger" onClick={handleDelete} disabled={formLoading}>
                                <TrashIcon /> {formLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteCompteModal && selectedArtiste && (
                <div className="modal-overlay" onClick={() => setShowDeleteCompteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Supprimer le compte</h2>
                            <button className="modal-close" onClick={() => setShowDeleteCompteModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-message">
                                <p>Êtes-vous sûr de vouloir supprimer le compte de <strong>"{selectedArtiste.prenom} {selectedArtiste.nom}"</strong> ?</p>
                                <p className="delete-warning">Cette action est irréversible.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDeleteCompteModal(false)}>Annuler</button>
                            <button className="btn-modal btn-confirm danger" onClick={handleDeleteCompte} disabled={formLoading}>
                                <TrashIcon /> {formLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL DÉTAILS ═══ */}
            {showDetailsModal && selectedArtiste && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Profil de l'artiste</h2>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="details-content">
                                {/* COLONNE GAUCHE : Informations */}
                                <div className="details-section">
                                    <h3 className="details-section-title">Informations générales</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Prénom</span>
                                            <span className="detail-value">{selectedArtiste.prenom}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Nom</span>
                                            <span className="detail-value">{selectedArtiste.nom}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date de naissance</span>
                                            <span className="detail-value">{formatDate(selectedArtiste.date_naissance)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date de décés</span>
                                            <span className="detail-value">{formatDate(selectedArtiste.date_deces)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Nationalité</span>
                                            <span className="detail-value">{selectedArtiste.nationalite || '—'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Biographie</span>
                                            <span className="detail-value">{selectedArtiste.biographie || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* COLONNE DROITE : Photo */}
                                <div className="details-section">
                                    <h3 className="details-section-title">Photo de profil</h3>
                                    {selectedArtiste.photo_profil ? (
                                        <img
                                            src={`${selectedArtiste.photo_profil}`}
                                            alt={`${selectedArtiste.prenom} ${selectedArtiste.nom}`}
                                            className="detail-photo"
                                            onClick={() => window.open(`${selectedArtiste.photo_profil}`, '_blank')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    ) : (
                                        <div className="detail-photo-placeholder">Aucune photo</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                            <button className="btn-modal btn-confirm" onClick={() => { setShowDetailsModal(false); openEditModal(selectedArtiste); }}>
                                <PencilIcon /> Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}