import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';


// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;

const ROLE_CHOICES = [
    { value: 'all', label: 'Tous les rôles', color: '#6b7280' },
    { value: 'visiteur', label: 'Visiteur', color: '#0ea5e9' },
    { value: 'artiste', label: 'Artiste', color: '#ec4899' },
    { value: 'conservateur', label: 'Conservateur', color: '#8b5cf6' },
    { value: 'curateur', label: 'Curateur', color: '#f97316' },
    { value: 'admin_institution', label: 'Admin Institution', color: '#10b981' },
    { value: 'administrateur', label: 'Administrateur', color: '#ef4444' },
];

const ROLE_COLORS = {
    visiteur: { bg: 'rgba(14,165,233,0.15)', text: '#0284c7', border: 'rgba(14,165,233,0.35)' },
    artiste: { bg: 'rgba(236,72,153,0.15)', text: '#be185d', border: 'rgba(236,72,153,0.35)' },
    conservateur: { bg: 'rgba(139,92,246,0.15)', text: '#7c3aed', border: 'rgba(139,92,246,0.35)' },
    curateur: { bg: 'rgba(249,115,22,0.15)', text: '#c2410c', border: 'rgba(249,115,22,0.35)' },
    admin_institution: { bg: 'rgba(16,185,129,0.15)', text: '#065f46', border: 'rgba(16,185,129,0.35)' },
    administrateur: { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c', border: 'rgba(239,68,68,0.35)' },
};

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
const UserSvgIcon = ({ size = 48 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
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
const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Users({ institutionId: propInstitutionId = null, institutionNom: propInstitutionNom = '', onRetour = null }) {
    const { user: currentUser } = useContext(AuthContext);
    const outletContext = useOutletContext();
    const searchTerm = outletContext?.searchTerm ?? '';
    // ── Rôles & permissions ───────────────────────────────────────────────────
    const canEdit = currentUser?.role === 'administrateur' || currentUser?.role === 'admin_institution';

    // institution_id effectif selon le rôle :
    // - administrateur sans prop    → null  (tous les utilisateurs)
    // - administrateur avec prop    → propInstitutionId (filtre par institution)
    // - admin_institution           → toujours user.institution_id
    const effectiveInstitutionId =
        currentUser?.role === 'admin_institution'
            ? (currentUser?.institution_id ?? null)
            : currentUser?.role === 'administrateur'
                ? (propInstitutionId ?? null)
                : null;

    // Contexte institution actif :
    // - administrateur avec institutionId (prop)
    // - admin_institution avec user.institution_id
    const isInstitutionContext =
        (currentUser?.role === 'administrateur' && propInstitutionId != null) ||
        (currentUser?.role === 'admin_institution' && currentUser?.institution_id != null);

    // Rôles autorisés dans un contexte institution
    const ROLES_INSTITUTION = [
        { value: 'curateur', label: 'Curateur', color: '#f97316' },
        { value: 'admin_institution', label: 'Admin Institution', color: '#10b981' },
        { value: 'conservateur', label: 'Conservateur', color: '#8b5cf6' },
    ];

    // Rôles disponibles dans le formulaire d'ajout/modification
    const availableRoles = isInstitutionContext
        ? ROLES_INSTITUTION
        : ROLE_CHOICES.filter(r => r.value !== 'all');

    // Pills de filtre : restreintes si contexte institution
    const visibleRolePills = isInstitutionContext
        ? [{ value: 'all', label: 'Tous les rôles', color: '#6b7280' }, ...ROLES_INSTITUTION]
        : ROLE_CHOICES;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');


    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', password: '',
        role: 'visiteur', pays: '', biographie: '',
        photo_profil: null, is_active: true,
    });

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => { fetchUsers(); }, [effectiveInstitutionId, debouncedSearch]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (effectiveInstitutionId) params.set('institution_id', effectiveInstitutionId);

            const url = debouncedSearch
                ? `http://localhost:8000/users/api/users/search?q=${encodeURIComponent(debouncedSearch)}${effectiveInstitutionId ? `&institution_id=${effectiveInstitutionId}` : ''}`
                : (effectiveInstitutionId
                    ? `http://localhost:8000/users/api/users?${params.toString()}`
                    : `http://localhost:8000/users/api/users`);

            const res = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Erreur de chargement');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

   const filteredUsers = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);

    // Comptage par rôle
    const countByRole = (role) =>
        role === 'all' ? users.length : users.filter(u => u.role === role).length;

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const resetForm = () => {
        const defaultRole = isInstitutionContext ? 'curateur' : 'visiteur';
        setFormData({ nom: '', prenom: '', email: '', password: '', role: defaultRole, pays: '', biographie: '', photo_profil: null, is_active: true });
        setSelectedUser(null);
    };

    const handleAdd = async () => {
        setFormLoading(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
            // Toujours ajouter institution_id selon le rôle
            if (effectiveInstitutionId != null) {
                fd.set('institution_id', String(effectiveInstitutionId));
            }
            const res = await fetch(`${apiUrl}${usersEndpoint}auth/users/create/`, {
                method: 'POST', body: fd, credentials: 'include',
            });
            if (!res.ok) { const e = await res.json(); throw new Error(JSON.stringify(e)); }
            await fetchUsers();
            setShowAddModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async () => {
        setFormLoading(true);
        try {
            const hasFile = formData.photo_profil instanceof File;
            let res;
            if (hasFile) {
                const fd = new FormData();
                Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
                res = await fetch(`${apiUrl}${usersEndpoint}/api/users/${selectedUser.id}`, {
                    method: 'PATCH', body: fd, credentials: 'include',
                });
            } else {
                const { photo_profil, password, ...json } = formData;
                res = await fetch(`${apiUrl}${usersEndpoint}/api/users/${selectedUser.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json),
                });
            }
            if (!res.ok) { const e = await res.json(); throw new Error(JSON.stringify(e)); }
            await fetchUsers();
            setShowEditModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${usersEndpoint}/api/users/${selectedUser.id}`, {
                method: 'DELETE', credentials: 'include',
            });
            if (!res.ok) throw new Error('Erreur de suppression');
            await fetchUsers();
            setShowDeleteModal(false); setSelectedUser(null);
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const openEditModal = (u) => {
        setSelectedUser(u);
        setFormData({
            nom: u.nom || '',
            prenom: u.prenom || '',
            email: u.email || '',
            password: '',
            role: u.role || 'visiteur',
            pays: u.pays || '',
            biographie: u.biographie || '',
            photo_profil: null,
            is_active: u.is_active,
        });
        setShowEditModal(true);
    };

    const getRoleMeta = (role) => ROLE_COLORS[role] || { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    const getRoleLabel = (role) => ROLE_CHOICES.find(r => r.value === role)?.label || role;

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            <style>{`
                .users-page {
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
                .users-header {
                    max-width: 1400px;
                    margin: 0 auto 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }
                .users-title-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .users-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #000;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .users-count {
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
                }
                .search-box input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 14px;
                    color: #000;
                    width: 220px;
                }
                .search-box input::placeholder { color: #9ca3af; }
                .btn-add {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-add:hover { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }

                /* ── ROLE FILTER PILLS ── */
                .role-filters {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 4px 0;
                }
                .role-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 16px;
                    border-radius: 40px;
                    border: 1.5px solid #e5e7eb;
                    background: #f9fafb;
                    color: #374151;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .role-pill:hover {
                    border-color: #000;
                    background: #f3f4f6;
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
                .users-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    box-sizing: border-box;
                }
                @media (max-width: 1100px) {
                    .users-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 750px) {
                    .users-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
                }
                @media (max-width: 420px) {
                    .users-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                }

                /* ── CARD ── */
                .user-card {
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    aspect-ratio: 3/4;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .user-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.18);
                }
                .user-card:hover .card-actions-top {
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
                .user-card:hover .card-bg { transform: scale(1.04); }
                .card-content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 16px;
                    z-index: 3;
                }
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

                .card-body-bottom {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 0 2px 2px;
                }
                .card-avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid rgba(255,255,255,0.6);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
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
                .card-email {
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
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
                .card-role-badge {
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
                .card-status {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                    white-space: nowrap;
                }
                .card-status.active { background: rgba(16,185,129,0.25); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.35); }
                .card-status.inactive { background: rgba(239,68,68,0.25); color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); }
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
                .form-textarea { resize: vertical; min-height: 90px; }
                .file-upload { position: relative; }
                .file-upload-area {
                    border: 2px dashed #d1d5db; border-radius: 12px;
                    padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s;
                }
                .file-upload-area:hover { border-color: #000; background: #f9fafb; }
                .file-upload-area.has-file { border-color: var(--success); background: #ecfdf5; }
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

                /* ── STATUS TOGGLE ── */
                .toggle-group {
                    display: flex; align-items: center; gap: 12px;
                    background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px;
                    padding: 14px 16px; cursor: pointer; transition: all 0.2s; user-select: none;
                }
                .toggle-group:hover { border-color: #000; }
                .toggle-group.on { border-color: #10b981; background: #ecfdf5; }
                .toggle-knob {
                    width: 44px; height: 24px; border-radius: 12px; background: #d1d5db;
                    position: relative; transition: background 0.2s; flex-shrink: 0;
                }
                .toggle-knob.on { background: #10b981; }
                .toggle-knob::after {
                    content: ''; position: absolute; top: 3px; left: 3px;
                    width: 18px; height: 18px; border-radius: 50%; background: #fff;
                    transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
                }
                .toggle-knob.on::after { transform: translateX(20px); }
                .toggle-label { font-size: 15px; font-weight: 500; color: #374151; flex: 1; }
                .toggle-group.on .toggle-label { color: #065f46; }

                /* ── DETAILS ── */
                .details-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
                .details-section { background: #f9fafb; border-radius: 16px; padding: 20px; }
                .details-section-title { font-size: 16px; font-weight: 600; color: #000; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
                .details-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
                .detail-item { display: flex; flex-direction: column; gap: 4px; }
                .detail-label { font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
                .detail-value { font-size: 15px; color: #000; line-height: 1.5; }
                .detail-photo { width: 100%; height: 260px; object-fit: cover; border-radius: 12px; border: 1px solid #e5e7eb; display: block; }
                .detail-photo-placeholder {
                    width: 100%; height: 180px; border-radius: 12px; border: 1px dashed #d1d5db;
                    background: #f3f4f6; display: flex; align-items: center; justify-content: center;
                    color: #9ca3af; font-size: 14px;
                }
                .detail-role-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 13px; font-weight: 600; padding: 5px 12px; border-radius: 20px;
                    width: fit-content;
                }

                @media (max-width: 768px) {
                    .form-row { grid-template-columns: 1fr; }
                    .controls-bar { flex-direction: column; align-items: stretch; }
                    .btn-add { justify-content: center; }
                    .search-box input { width: 100%; }
                    .details-content { grid-template-columns: 1fr; }
                    .role-filters { gap: 6px; }
                    .role-pill { padding: 6px 12px; font-size: 12px; }
                    .users-header { padding: 0 4px; }
                    .modal-box { border-radius: 16px; }
                }
                @media (max-width: 420px) {
                    .users-page { padding: 20px 12px; }
                    .users-title { font-size: 24px; }
                    .card-name { font-size: 15px; }
                    .card-btn-bottom { padding: 10px; font-size: 13px; }
                }
            `}</style>

            <div className="users-page">

                {/* ═══ HEADER ═══ */}
                <header className="users-header">
                    {/* Ligne 1 : titre + compteur */}
                    <div className="users-title-row">
                        <h1 className="users-title">
                            {propInstitutionNom ? propInstitutionNom : 'Utilisateurs'}
                        </h1>
                        <span className="users-count">{filteredUsers.length}</span>
                    </div>

                    {/* Ligne 2 : retour + recherche + ajouter */}
                    <div className="controls-bar">
                        {onRetour && (
                            <button
                                onClick={onRetour}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '10px',
                                    padding: '10px 16px', fontSize: '14px', fontWeight: 500,
                                    color: '#444', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.color = '#000'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#444'; }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Retour
                            </button>
                        )}
                       
                        {canEdit && (
                            <button className="btn-add" onClick={() => { resetForm(); setShowAddModal(true); }}>
                                <PlusIcon /> Ajouter un utilisateur
                            </button>
                        )}
                    </div>

                    {/* Ligne 3 : filtres rôle */}
                    <div className="role-filters">
                        {visibleRolePills.map((r) => (
                            <button
                                key={r.value}
                                className={`role-pill ${roleFilter === r.value ? 'active' : ''}`}
                                onClick={() => setRoleFilter(r.value)}
                            >
                                <span className="pill-dot" style={{ background: roleFilter === r.value ? '#fff' : r.color }} />
                                {r.label}
                                <span className="pill-count">{countByRole(r.value)}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* ═══ CONTENU ═══ */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Chargement des utilisateurs...</p>
                    </div>
                ) : error ? (
                    <div className="loading-state">
                        <p style={{ color: '#ef4444' }}>Erreur : {error}</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {filteredUsers.length === 0 ? (
                            <div className="empty-state">
                                <UserSvgIcon size={80} />
                                <h3>Aucun utilisateur trouvé</h3>
                                <p>Modifiez vos filtres ou ajoutez un utilisateur.</p>
                            </div>
                        ) : (
                            filteredUsers.map((u, i) => {
                                const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                                const fullName = u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Utilisateur';

                                return (
                                    <div className="user-card" key={u.id}>
                                        {u.artiste_profile?.photo_profil ? (
                                            // Condition 1 : Photo de l'artiste
                                            <div className="card-bg" style={{ backgroundImage: `url(${u.artiste_profile.photo_profil})` }} />
                                        ) : u.photo_profil ? (
                                            // Condition 2 : Photo du User standard
                                            <div className="card-bg" style={{ backgroundImage: `url(${u.photo_profil})` }} />
                                        ) : (
                                            // Condition 3 : Dégradé par défaut
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
                                                <button className="btn-icon view" title="Voir le profil"
                                                    onClick={() => { setSelectedUser(u); setShowDetailsModal(true); }}>
                                                    <EyeIcon />
                                                </button>
                                                {canEdit && (
                                                    <button className="btn-icon edit" title="Modifier" onClick={() => openEditModal(u)}>
                                                        <PencilIcon />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button className="btn-icon delete" title="Supprimer"
                                                        onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }}>
                                                        <TrashIcon />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="card-body-bottom">
                                                <p className="card-name">{fullName}</p>
                                                <p className="card-email">{u.email}</p>
                                                <div className="card-meta">
                                                    <span className="card-role-badge">
                                                        <ShieldIcon /> {getRoleLabel(u.role)}
                                                    </span>
                                                    <span className={`card-status ${u.is_active ? 'active' : 'inactive'}`}>
                                                        ● {u.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                {u.pays && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                                                        <LocationIcon /> {u.pays}
                                                    </span>
                                                )}
                                                <button className="card-btn-bottom"
                                                    onClick={() => { setSelectedUser(u); setShowDetailsModal(true); }}>
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
                            <h2 className="modal-title">Ajouter un utilisateur</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Prénom *</label>
                                        <input className="form-input" placeholder="Prénom"
                                            value={formData.prenom}
                                            onChange={(e) => setFormData(p => ({ ...p, prenom: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nom *</label>
                                        <input className="form-input" placeholder="Nom"
                                            value={formData.nom}
                                            onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input className="form-input" type="email" placeholder="email@exemple.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mot de passe *</label>
                                    <input className="form-input" type="password" placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Rôle</label>
                                        <select className="form-select" value={formData.role}
                                            onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}>
                                            {availableRoles.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biographie</label>
                                    <textarea className="form-textarea" placeholder="Biographie..."
                                        value={formData.biographie}
                                        onChange={(e) => setFormData(p => ({ ...p, biographie: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Statut</label>
                                    <div className={`toggle-group ${formData.is_active ? 'on' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}>
                                        <div className={`toggle-knob ${formData.is_active ? 'on' : ''}`} />
                                        <span className="toggle-label">{formData.is_active ? 'Compte actif' : 'Compte inactif'}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Photo de profil</label>
                                    <div className={`file-upload-area ${formData.photo_profil ? 'has-file' : ''}`}>
                                        <UploadIcon />
                                        <p className={formData.photo_profil ? 'file-name' : ''}>
                                            {formData.photo_profil ? formData.photo_profil.name : 'Cliquez pour uploader une photo'}
                                        </p>
                                        <input type="file" accept="image/*"
                                            onChange={(e) => { const f = e.target.files[0]; if (f) setFormData(p => ({ ...p, photo_profil: f })); }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</button>
                            <button className="btn-modal btn-confirm" onClick={handleAdd} disabled={formLoading}>
                                <PlusIcon /> {formLoading ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL MODIFIER ═══ */}
            {showEditModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Modifier l'utilisateur</h2>
                            <button className="modal-close" onClick={() => { setShowEditModal(false); resetForm(); }}><CloseIcon /></button>
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
                                        <label className="form-label">Rôle</label>
                                        <select className="form-select" value={formData.role}
                                            onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}>
                                            {availableRoles.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pays</label>
                                        <input className="form-input" value={formData.pays}
                                            onChange={(e) => setFormData(p => ({ ...p, pays: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biographie</label>
                                    <textarea className="form-textarea" value={formData.biographie}
                                        onChange={(e) => setFormData(p => ({ ...p, biographie: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Statut</label>
                                    <div className={`toggle-group ${formData.is_active ? 'on' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}>
                                        <div className={`toggle-knob ${formData.is_active ? 'on' : ''}`} />
                                        <span className="toggle-label">{formData.is_active ? 'Compte actif' : 'Compte inactif'}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Photo de profil</label>
                                    <div className={`file-upload-area ${formData.photo_profil ? 'has-file' : ''}`}>
                                        <UploadIcon />
                                        <p className={formData.photo_profil ? 'file-name' : ''}>
                                            {formData.photo_profil ? formData.photo_profil.name : 'Cliquez pour changer la photo'}
                                        </p>
                                        <input type="file" accept="image/*"
                                            onChange={(e) => { const f = e.target.files[0]; if (f) setFormData(p => ({ ...p, photo_profil: f })); }} />
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
            {showDeleteModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Supprimer l'utilisateur</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-message">
                                <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedUser.nom_complet || `${selectedUser.prenom} ${selectedUser.nom}`}"</strong> ?</p>
                                <p className="delete-warning">Cette action est irréversible.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                            <button className="btn-modal btn-confirm danger" onClick={handleDelete} disabled={formLoading}>
                                <TrashIcon /> {formLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL DÉTAILS ═══ */}
            {showDetailsModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Profil utilisateur</h2>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="details-content">
                                <div className="details-section">
                                    <h3 className="details-section-title">Informations générales</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Prénom</span>
                                            <span className="detail-value">{selectedUser.prenom || '—'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Nom</span>
                                            <span className="detail-value">{selectedUser.nom || '—'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email</span>
                                            <span className="detail-value">{selectedUser.email || '—'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Pays</span>
                                            <span className="detail-value">{selectedUser.nationalite || '—'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Rôle</span>
                                            <span className="detail-role-badge" style={{
                                                background: getRoleMeta(selectedUser.role).bg,
                                                color: getRoleMeta(selectedUser.role).text,
                                                border: `1px solid ${getRoleMeta(selectedUser.role).border}`,
                                            }}>
                                                <ShieldIcon /> {getRoleLabel(selectedUser.role)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Statut</span>
                                            <span className={`card-status ${selectedUser.is_active ? 'active' : 'inactive'}`}
                                                style={{ width: 'fit-content' }}>
                                                ● {selectedUser.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Vérifié</span>
                                            <span className={`card-status ${selectedUser.is_verified ? 'active' : 'inactive'}`}
                                                style={{ width: 'fit-content' }}>
                                                {selectedUser.is_verified ? '✓ Vérifié' : '✗ Non vérifié'}
                                            </span>
                                        </div>
                                        {selectedUser.biographie && (
                                            <div className="detail-item">
                                                <span className="detail-label">Biographie</span>
                                                <span className="detail-value">{selectedUser.biographie}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="details-section">
                                    <h3 className="details-section-title">Photo de profil</h3>
                                    {selectedUser.photo_profil ? (
                                        <img
                                            src={`${selectedUser.photo_profil}`}
                                            alt={selectedUser.nom_complet || `${selectedUser.prenom} ${selectedUser.nom}`}
                                            className="detail-photo"
                                            onClick={() => window.open(`${apiUrl}${usersEndpoint}${selectedUser.photo_profil}`, '_blank')}
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
                            <button className="btn-modal btn-confirm" onClick={() => { setShowDetailsModal(false); openEditModal(selectedUser); }}>
                                <PencilIcon /> Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}