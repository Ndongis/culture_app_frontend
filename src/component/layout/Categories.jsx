import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProtectedPage from '../ProtectedRoute';

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
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const TagIcon = ({ size = 22 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════


const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const biensEndpoint = import.meta.env.VITE_BIENS_ENDPOINT;
export default function Categories() {
    const { user: currentUser } = useContext(AuthContext);

    const [categories, setCategories]           = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null);
    const [showAddModal, setShowAddModal]         = useState(false);
    const [showEditModal, setShowEditModal]       = useState(false);
    const [showDeleteModal, setShowDeleteModal]   = useState(false);
    const [selectedCategorie, setSelectedCategorie] = useState(null);
    const [formLoading, setFormLoading]           = useState(false);

    const [formData, setFormData] = useState({ nom: '', description: '' });

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}${biensEndpoint}/api/categories`, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Erreur de chargement');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const resetForm = () => setFormData({ nom: '', description: '' });

    const handleAdd = async () => {
        if (!formData.nom.trim()) return alert('Le nom est requis.');
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${biensEndpoint}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erreur lors de l\'ajout'); }
            await fetchCategories();
            setShowAddModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async () => {
        if (!formData.nom.trim()) return alert('Le nom est requis.');
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${biensEndpoint}/api/categories/${selectedCategorie.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Erreur lors de la modification'); }
            await fetchCategories();
            setShowEditModal(false); resetForm();
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`${apiUrl}${biensEndpoint}/api/categories/${selectedCategorie.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur de suppression');
            await fetchCategories();
            setShowDeleteModal(false); setSelectedCategorie(null);
        } catch (err) { alert(err.message); }
        finally { setFormLoading(false); }
    };

    const openEditModal = (c) => {
        setSelectedCategorie(c);
        setFormData({ nom: c.nom || '', description: c.description || '' });
        setShowEditModal(true);
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
     return (
    <ProtectedPage pageKey="categories">
      {/* ton contenu normal ici */
      <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

                .categories-page {
                    --primary: #000000;
                    --danger: #ef4444;
                    --success: #10b981;
                    --gray: #64748b;
                    min-height: 100vh;
                    background: #ffffff;
                    padding: 40px 20px;
                    font-family: 'Cormorant Garamond', Georgia, serif;
                }

                /* ── HEADER ── */
                .categories-header {
                    max-width: 860px;
                    margin: 0 auto 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 28px;
                }
                .categories-title-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .categories-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #000;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .categories-count {
                    background: #000;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                /* ── CONTROLS ── */
                .cat-controls-bar {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex-wrap: wrap;
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

                /* ── LISTE VERTICALE ── */
                .categories-list {
                    max-width: 860px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                /* ── ITEM ── */
                .categorie-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 18px;
                    padding: 20px 24px;
                    cursor: default;
                    transition:
                        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                }
                .categorie-item:hover {
                    transform: scale(1.025) translateY(-2px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.14);
                }

                /* ── ICÔNE + TEXTE ── */
                .cat-item-left {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    flex: 1;
                    min-width: 0;
                }
                .cat-icon-wrap {
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
                .categorie-item:hover .cat-icon-wrap {
                    background: #000;
                    color: #fff;
                }
                .cat-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .cat-item-nom {
                    font-size: 17px;
                    font-weight: 700;
                    color: #111;
                    margin: 0 0 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .cat-item-desc {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ── ACTIONS ── */
                .cat-item-actions {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                    opacity: 0;
                    transform: translateX(6px);
                    transition: opacity 0.25s, transform 0.25s;
                }
                .categorie-item:hover .cat-item-actions {
                    opacity: 1;
                    transform: translateX(0);
                }
                .btn-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 11px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon.edit {
                    background: #f1f5f9;
                    color: #374151;
                    border: 1px solid #e2e8f0;
                }
                .btn-icon.edit:hover {
                    background: #000;
                    color: #fff;
                    border-color: #000;
                }
                .btn-icon.danger {
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fecaca;
                }
                .btn-icon.danger:hover {
                    background: #ef4444;
                    color: #fff;
                    border-color: #ef4444;
                }

                /* ── ÉTATS ── */
                .cat-empty {
                    text-align: center;
                    padding: 80px 20px;
                    color: #9ca3af;
                }
                .cat-empty-icon { margin-bottom: 16px; opacity: 0.3; }
                .cat-empty h3 { font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 8px; }
                .cat-empty p { font-size: 14px; margin: 0; }

                .cat-loading {
                    text-align: center;
                    padding: 80px 20px;
                    color: #9ca3af;
                    font-size: 15px;
                }
                .cat-error {
                    text-align: center;
                    padding: 40px;
                    color: #ef4444;
                    background: #fef2f2;
                    border-radius: 16px;
                    max-width: 860px;
                    margin: 0 auto;
                }

                /* ══════════════════════════════
                   MODAUX
                ══════════════════════════════ */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-box {
                    background: #fff;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.25);
                    animation: modalIn 0.25s cubic-bezier(0.4,0,0.2,1);
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.94) translateY(12px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 28px 0;
                }
                .modal-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #000;
                    margin: 0;
                    letter-spacing: -0.3px;
                }
                .modal-close {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                    background: #f9fafb;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .modal-close:hover { background: #000; color: #fff; border-color: #000; }

                .modal-body { padding: 24px 28px; }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 0 28px 28px;
                }

                /* Formulaire */
                .form-group { margin-bottom: 18px; }
                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 14px;
                    color: #111;
                    background: #fafafa;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                    font-family: inherit;
                }
                .form-input:focus, .form-textarea:focus {
                    border-color: #000;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
                    outline: none;
                    background: #fff;
                }
                .form-textarea { min-height: 100px; resize: vertical; }

                /* Boutons modal */
                .btn-modal {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 22px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .btn-cancel {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }
                .btn-cancel:hover { background: #e5e7eb; }
                .btn-confirm {
                    background: #000;
                    color: #fff;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
                }
                .btn-confirm:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
                .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-confirm.danger {
                    background: #ef4444;
                    box-shadow: 0 4px 14px rgba(239,68,68,0.3);
                }
                .btn-confirm.danger:hover { box-shadow: 0 6px 20px rgba(239,68,68,0.4); }

                /* Suppression */
                .delete-message { font-size: 15px; color: #374151; line-height: 1.6; }
                .delete-message strong { color: #000; }
                .delete-warning {
                    margin-top: 10px;
                    font-size: 13px;
                    color: #ef4444;
                    font-weight: 500;
                }
            `}</style>

            <div className="categories-page">

                {/* ═══ HEADER ═══ */}
                <div className="categories-header">
                    <div className="categories-title-row">
                        <TagIcon size={30} />
                        <h1 className="categories-title">Catégories</h1>
                        <span className="categories-count">{categories.length}</span>
                    </div>

                    <div className="cat-controls-bar">
                        <button className="btn-add" onClick={() => { resetForm(); setShowAddModal(true); }}>
                            <PlusIcon /> Ajouter une catégorie
                        </button>
                    </div>
                </div>

                {/* ═══ CONTENU ═══ */}
                {loading ? (
                    <div className="cat-loading">Chargement des catégories…</div>
                ) : error ? (
                    <div className="cat-error">⚠ {error}</div>
                ) : categories.length === 0 ? (
                    <div className="cat-empty">
                        <div className="cat-empty-icon"><TagIcon size={52} /></div>
                        <h3>Aucune catégorie</h3>
                        <p>Commencez par ajouter une catégorie.</p>
                    </div>
                ) : (
                    <div className="categories-list">
                        {categories.map((cat) => (
                            <div className="categorie-item" key={cat.id}>

                                {/* Icône + Infos */}
                                <div className="cat-item-left">
                                    <div className="cat-icon-wrap">
                                        <TagIcon size={22} />
                                    </div>
                                    <div className="cat-item-info">
                                        <p className="cat-item-nom">{cat.nom}</p>
                                        <p className="cat-item-desc">
                                            {cat.description || <em style={{ color: '#d1d5db' }}>Aucune description</em>}
                                        </p>
                                    </div>
                                </div>

                                {/* Boutons Modifier / Supprimer */}
                                <div className="cat-item-actions">
                                    <button
                                        className="btn-icon edit"
                                        title="Modifier"
                                        onClick={() => openEditModal(cat)}
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button
                                        className="btn-icon danger"
                                        title="Supprimer"
                                        onClick={() => { setSelectedCategorie(cat); setShowDeleteModal(true); }}
                                    >
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
                            <h2 className="modal-title">Nouvelle catégorie</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nom *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Ex : Peinture, Musique…"
                                    value={formData.nom}
                                    onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Décrivez cette catégorie…"
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
            {showEditModal && selectedCategorie && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Modifier la catégorie</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nom *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Nom de la catégorie"
                                    value={formData.nom}
                                    onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Décrivez cette catégorie…"
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
            {showDeleteModal && selectedCategorie && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Supprimer la catégorie</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-message">
                                <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedCategorie.nom}"</strong> ?</p>
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
      }
    </ProtectedPage>
  );
   
}