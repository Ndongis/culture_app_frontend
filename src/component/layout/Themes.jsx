import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProtectedPage from '../ProtectedRoute';
import axios from 'axios';

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
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ThemeIcon = ({ size = 22 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
);

const API = 'http://localhost:8282/api';
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const exposEndpoint = import.meta.env.VITE_EXPO_ENDPOINT;

export default function Themes() {
    const { user: currentUser } = useContext(AuthContext);

    const [themes, setThemes]                   = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null);

    const [showAddModal, setShowAddModal]       = useState(false);
    const [showEditModal, setShowEditModal]     = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTheme, setSelectedTheme]     = useState(null);
    const [formLoading, setFormLoading]         = useState(false);

    const [formData, setFormData] = useState({ nom: '', description: '' });

    useEffect(() => { fetchThemes(); }, []);

    const fetchThemes = async () => {
    setLoading(true);

    try {
        const response = await axios.get(
            `${apiUrl}${exposEndpoint}/api/themes`,
            {
                withCredentials: true, // si tu utilises des cookies/JWT HttpOnly
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        setThemes(response.data);
    } catch (err) {
        setError(
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message
        );
    } finally {
        setLoading(false);
    }
};

    const resetForm = () => setFormData({ nom: '', description: '' });

   const handleAdd = async () => {
    if (!formData.nom.trim()) {
        return alert("Le nom est requis.");
    }

    setFormLoading(true);

    try {
        await axios.post(
            `${apiUrl}${exposEndpoint}/api/themes`,
            formData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        await fetchThemes();
        setShowAddModal(false);
        resetForm();
    } catch (err) {
        const message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de l'ajout";

        alert(message);
    } finally {
        setFormLoading(false);
    }
};

    const handleEdit = async () => {
    if (!formData.nom.trim()) {
        return alert("Le nom est requis.");
    }

    setFormLoading(true);

    try {
        await axios.patch(
            `${apiUrl}${exposEndpoint}/api/themes/${selectedTheme.id}`,
            formData
        );

        await fetchThemes();
        setShowEditModal(false);
        resetForm();
    } catch (err) {
        const message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la modification";

        alert(message);
    } finally {
        setFormLoading(false);
    }
};


const handleDelete = async () => {
    setFormLoading(true);

    try {
        await axios.delete(
            `${apiUrl}${exposEndpoint}/api/themes/${selectedTheme.id}`,
            {
                withCredentials: true,
            }
        );

        await fetchThemes();
        setShowDeleteModal(false);
        setSelectedTheme(null);

    } catch (err) {
        const message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erreur de suppression";

        alert(message);
    } finally {
        setFormLoading(false);
    }
};

    const openEditModal = (t) => {
        setSelectedTheme(t);
        setFormData({ nom: t.nom || '', description: t.description || '' });
        setShowEditModal(true);
    };

    return (
        <ProtectedPage pageKey="themes">
            <>
                <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

                    .themes-page {
                        min-height: 100vh;
                        background: #ffffff;
                        padding: 40px 20px;
                        font-family: 'Cormorant Garamond', Georgia, serif;
                    }
                    .themes-header {
                        max-width: 860px;
                        margin: 0 auto 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 28px;
                    }
                    .themes-title-row {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }
                    .themes-title {
                        font-size: 32px;
                        font-weight: 800;
                        color: #000;
                        margin: 0;
                        letter-spacing: -0.5px;
                    }
                    .themes-count {
                        background: #000;
                        color: #fff;
                        font-size: 13px;
                        font-weight: 700;
                        padding: 4px 12px;
                        border-radius: 20px;
                    }
                    .theme-controls-bar {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                    }
                    .btn-add {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        background: #000;
                        color: #fff;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 14px;
                        font-weight: 600;
                        font-size: 15px;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                        white-space: nowrap;
                    }
                    .btn-add:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                    }
                    .themes-list {
                        max-width: 860px;
                        margin: 0 auto;
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                    }
                    .theme-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                        background: #fff;
                        border: 1px solid #e5e7eb;
                        border-radius: 18px;
                        padding: 20px 24px;
                        cursor: default;
                        transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
                        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                    }
                    .theme-item:hover {
                        transform: scale(1.025) translateY(-2px);
                        box-shadow: 0 12px 40px rgba(0,0,0,0.14);
                    }
                    .theme-item-left {
                        display: flex;
                        align-items: center;
                        gap: 18px;
                        flex: 1;
                        min-width: 0;
                    }
                    .theme-icon-wrap {
                        width: 48px;
                        height: 48px;
                        border-radius: 14px;
                        background: #f1f5f9;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        color: #000;
                        transition: background 0.3s;
                    }
                    .theme-item:hover .theme-icon-wrap { background: #000; color: #fff; }
                    .theme-item-info { flex: 1; min-width: 0; }
                    .theme-item-nom {
                        font-size: 17px;
                        font-weight: 700;
                        color: #111;
                        margin: 0 0 4px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .theme-item-desc {
                        font-size: 13px;
                        color: #6b7280;
                        margin: 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .theme-item-actions {
                        display: flex;
                        gap: 8px;
                        flex-shrink: 0;
                        opacity: 0;
                        transform: translateX(6px);
                        transition: opacity 0.25s, transform 0.25s;
                    }
                    .theme-item:hover .theme-item-actions { opacity: 1; transform: translateX(0); }
                    .btn-icon {
                        width: 38px; height: 38px;
                        border-radius: 11px;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-icon.edit { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
                    .btn-icon.edit:hover { background: #000; color: #fff; border-color: #000; }
                    .btn-icon.danger { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
                    .btn-icon.danger:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
                    .theme-empty { text-align: center; padding: 80px 20px; color: #9ca3af; }
                    .theme-empty-icon { margin-bottom: 16px; opacity: 0.3; }
                    .theme-empty h3 { font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 8px; }
                    .theme-empty p { font-size: 14px; margin: 0; }
                    .theme-loading { text-align: center; padding: 80px 20px; color: #9ca3af; font-size: 15px; }
                    .theme-error { text-align: center; padding: 40px; color: #ef4444; background: #fef2f2; border-radius: 16px; max-width: 860px; margin: 0 auto; }
                    .modal-overlay {
                        position: fixed; inset: 0;
                        background: rgba(0,0,0,0.45);
                        backdrop-filter: blur(4px);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 1000; padding: 20px;
                    }
                    .modal-box {
                        background: #fff; border-radius: 24px;
                        width: 100%; max-width: 480px;
                        box-shadow: 0 30px 80px rgba(0,0,0,0.25);
                        animation: modalIn 0.25s cubic-bezier(0.4,0,0.2,1);
                    }
                    @keyframes modalIn {
                        from { opacity: 0; transform: scale(0.94) translateY(12px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; }
                    .modal-title { font-size: 20px; font-weight: 800; color: #000; margin: 0; letter-spacing: -0.3px; }
                    .modal-close {
                        width: 36px; height: 36px; border-radius: 10px;
                        border: 1px solid #e5e7eb; background: #f9fafb; color: #374151;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; transition: all 0.2s;
                    }
                    .modal-close:hover { background: #000; color: #fff; border-color: #000; }
                    .modal-body { padding: 24px 28px; }
                    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 0 28px 28px; }
                    .form-group { margin-bottom: 18px; }
                    .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
                    .form-input, .form-textarea {
                        width: 100%; padding: 12px 14px;
                        border: 1.5px solid #e5e7eb; border-radius: 12px;
                        font-size: 14px; color: #111; background: #fafafa;
                        transition: border-color 0.2s, box-shadow 0.2s;
                        box-sizing: border-box; font-family: inherit;
                    }
                    .form-input:focus, .form-textarea:focus {
                        border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
                        outline: none; background: #fff;
                    }
                    .form-textarea { min-height: 100px; resize: vertical; }
                    .btn-modal {
                        display: flex; align-items: center; gap: 8px;
                        padding: 11px 22px; border-radius: 12px;
                        font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
                    }
                    .btn-cancel { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
                    .btn-cancel:hover { background: #e5e7eb; }
                    .btn-confirm { background: #000; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
                    .btn-confirm:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
                    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
                    .btn-confirm.danger { background: #ef4444; box-shadow: 0 4px 14px rgba(239,68,68,0.3); }
                    .btn-confirm.danger:hover { box-shadow: 0 6px 20px rgba(239,68,68,0.4); }
                    .delete-message { font-size: 15px; color: #374151; line-height: 1.6; }
                    .delete-message strong { color: #000; }
                    .delete-warning { margin-top: 10px; font-size: 13px; color: #ef4444; font-weight: 500; }
                `}</style>

                <div className="themes-page">

                    {/* ═══ HEADER ═══ */}
                    <div className="themes-header">
                        <div className="themes-title-row">
                            <ThemeIcon size={30} />
                            <h1 className="themes-title">Thèmes</h1>
                            <span className="themes-count">{themes.length}</span>
                        </div>
                        <div className="theme-controls-bar">
                            <button className="btn-add" onClick={() => { resetForm(); setShowAddModal(true); }}>
                                <PlusIcon /> Ajouter un thème
                            </button>
                        </div>
                    </div>

                    {/* ═══ CONTENU ═══ */}
                    {loading ? (
                        <div className="theme-loading">Chargement des thèmes…</div>
                    ) : error ? (
                        <div className="theme-error">⚠ {error}</div>
                    ) : themes.length === 0 ? (
                        <div className="theme-empty">
                            <div className="theme-empty-icon"><ThemeIcon size={52} /></div>
                            <h3>Aucun thème</h3>
                            <p>Commencez par ajouter un thème.</p>
                        </div>
                    ) : (
                        <div className="themes-list">
                            {themes.map((theme) => (
                                <div className="theme-item" key={theme.id}>
                                    <div className="theme-item-left">
                                        <div className="theme-icon-wrap">
                                            <ThemeIcon size={22} />
                                        </div>
                                        <div className="theme-item-info">
                                            <p className="theme-item-nom">{theme.nom}</p>
                                            <p className="theme-item-desc">
                                                {theme.description || <em style={{ color: '#d1d5db' }}>Aucune description</em>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="theme-item-actions">
                                        <button className="btn-icon edit" title="Modifier" onClick={() => openEditModal(theme)}>
                                            <PencilIcon />
                                        </button>
                                        <button className="btn-icon danger" title="Supprimer" onClick={() => { setSelectedTheme(theme); setShowDeleteModal(true); }}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ MODAL AJOUTER ═══ */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Nouveau thème</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Ex : Impressionnisme, Abstrait…"
                                        value={formData.nom}
                                        onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Décrivez ce thème…"
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-modal btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</button>
                                <button className="btn-modal btn-confirm" onClick={handleAdd} disabled={formLoading}>
                                    <PlusIcon /> {formLoading ? 'Ajout…' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ MODAL MODIFIER ═══ */}
                {showEditModal && selectedTheme && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Modifier le thème</h2>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Nom du thème"
                                        value={formData.nom}
                                        onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Décrivez ce thème…"
                                        value={formData.description}
                                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-modal btn-cancel" onClick={() => { setShowEditModal(false); resetForm(); }}>Annuler</button>
                                <button className="btn-modal btn-confirm" onClick={handleEdit} disabled={formLoading}>
                                    <PencilIcon /> {formLoading ? 'Modification…' : 'Modifier'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ MODAL SUPPRIMER ═══ */}
                {showDeleteModal && selectedTheme && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Supprimer le thème</h2>
                                <button className="modal-close" onClick={() => setShowDeleteModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <div className="delete-message">
                                    <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedTheme.nom}"</strong> ?</p>
                                    <p className="delete-warning">Cette action est irréversible.</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-modal btn-cancel" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                                <button className="btn-modal btn-confirm danger" onClick={handleDelete} disabled={formLoading}>
                                    <TrashIcon /> {formLoading ? 'Suppression…' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        </ProtectedPage>
    );
}