import React, { useState, useEffect } from "react";
import axios from "axios";
import { enAttenteDePresentation } from "../fonctions/sendToUnityFonctions";
import { useSalle } from "../component/context/SalleContext";

// ══════════════════════════════════════════════════════════════════════════════
// USAGE
//
// Mode gestion    (depuis Users.jsx / page artistes) :
//   <BienModal show={...} setShow={...} handleClose={...} artiste={artisteObj} />
//   → fetch par artiste, CRUD complet, PAS de bouton Présenter, PAS d'ajout sans artiste
//
// Mode présentation (depuis /edit_salle_expo) :
//   <BienModal show={...} setShow={...} handleClose={...} />
//   → fetch GET /api/biens (tous), bouton Présenter visible, PAS de CRUD, PAS de tag artiste
// ══════════════════════════════════════════════════════════════════════════════

// ── ICÔNES ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const PresentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <polygon points="5 3 19 12 5 21 5 3" />
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
const OeuvreSvgIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const UserIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ── GRADIENTS ─────────────────────────────────────────────────────────────────

const CARD_GRADIENTS = [
  'linear-gradient(145deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(145deg, #84cc16 0%, #a3e635 50%, #d9f99d 100%)',
  'linear-gradient(145deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%)',
  'linear-gradient(145deg, #f97316 0%, #fb923c 50%, #fed7aa 100%)',
  'linear-gradient(145deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)',
  'linear-gradient(145deg, #8b5cf6 0%, #a78bfa 50%, #ddd6fe 100%)',
];

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function BienModal({ show, setShow, handleClose, artiste }) {
  const { salleId, expositionId } = useSalle();

    const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const biensEndpoint = import.meta.env.VITE_BIENS_ENDPOINT;
  const expoEndpoint=import.meta.env.VITE_EXPO_ENDPOINT;
  const userEndpoint=import.meta.env.VITE_USER_ENDPOINT;
  // Mode déterminé par la présence du prop artiste
  // isGestion = true  → page artistes (CRUD, pas de Présenter)
  // isGestion = false → /edit_salle_expo (lecture seule + Présenter)
  const isGestion = !!artiste;

  // ── États ─────────────────────────────────────────────────────────────────
  const [biens, setBiens]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [formLoading, setFormLoading]     = useState(false);
  const [search, setSearch]               = useState('');

  // 'list' | 'add' | 'edit' | 'delete' | 'text-editor'
  const [view, setView]                       = useState('list');
  const [textEditorField, setTextEditorField] = useState(null);
  const [prevView, setPrevView]               = useState('add');
  const [selectedBien, setSelectedBien]   = useState(null);
  const [previewImage, setPreviewImage]       = useState(null);

  const emptyForm = {
    titre: '', date: '', technique: '', sujet: '',
    inscription: '', description_visuelle: '', historique: '', image: null,
  };
  const [formData, setFormData] = useState(emptyForm);

  // ── Fetch biens ──────────────────────────────────────────────────────────
  const fetchBiens = async () => {
    setLoading(true);
    try {
      if (isGestion) {
        // Mode gestion : biens filtrés par artiste
        const res = await axios.post(`${apiUrl}${biensEndpoint}/get_biens_by_artiste/${artiste.id}`, { salle_id: salleId });
        setBiens(Array.isArray(res.data?.biens) ? res.data.biens : []);
      } else {
        // Mode présentation : biens de l'institution via expositionId
        // 1. Récupérer l'institution_id depuis l'exposition
        const expoRes = await axios.get(`${apiUrl}${expoEndpoint}/api/expositions/${expositionId}`);
        const institutionId = expoRes.data?.institution_id;
        if (!institutionId) throw new Error("institution_id introuvable dans l'exposition");

        // 2. Récupérer les biens de l'institution avec leur salle
        const biensRes = await axios.get(`${apiUrl}${biensEndpoint}/api/get_biens_with_salle_by_institution/${institutionId}/`);
        setBiens(Array.isArray(biensRes.data) ? biensRes.data : []);
      }
    } catch (err) {
      console.error("Erreur fetchBiens :", err);
      setBiens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) { setView('list'); setSearch(''); fetchBiens(); }
  }, [show, artiste]);

  // ── Unity bridge ──────────────────────────────────────────────────────────
  useEffect(() => {
    window.SendDataSceneToReact = async (jsonData) => {
      try {
        await fetch(`${apiUrl}${biensEndpoint}/api/save_scene/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: JSON.parse(jsonData) }),
        });
      } catch (e) { console.error(e); }
    };
  }, []);

  // ── Handlers formulaire ───────────────────────────────────────────────────
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((p) => ({ ...p, image: file }));
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const resetForm = () => { setFormData(emptyForm); setPreviewImage(null); setSelectedBien(null); };

  const openEditView = (bien) => {
    setSelectedBien(bien);
    setFormData({
      titre:                bien.titre || '',
      date:                 bien.date || '',
      technique:            bien.technique || '',
      sujet:                bien.sujet || '',
      inscription:          bien.inscription || '',
      description_visuelle: bien.description_visuelle || '',
      historique:           bien.historique || '',
      image:                null,
    });
    setPreviewImage(bien.image ? `${bien.image}` : null);
    setView('edit');
  };

  const openTextEditor = (fieldName) => {
    setPrevView(view);
    setTextEditorField(fieldName);
    setView('text-editor');
  };

  const fieldLabels = {
    description_visuelle: { label: 'Description visuelle', max: 300 },
    historique:           { label: 'Historique',           max: 500 },
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!formData.titre) return alert('Le titre est obligatoire.');
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append('titre',                formData.titre.slice(0, 100));
      fd.append('date',                 formData.date.slice(0, 50));
      fd.append('technique',            formData.technique.slice(0, 100));
      fd.append('sujet',                formData.sujet.slice(0, 150));
      fd.append('inscription',          formData.inscription.slice(0, 150));
      fd.append('description_visuelle', formData.description_visuelle.slice(0, 300));
      fd.append('historique',           formData.historique.slice(0, 500));
      fd.append('user_id',              artiste.id);
      fd.append('auteur',               `${artiste.prenom} ${artiste.nom}`.slice(0, 50));
      if (salleId) fd.append('salle_id', salleId);
      if (formData.image instanceof File) fd.append('image', formData.image);
      await axios.post(`${apiUrl}${biensEndpoint}/api/biens`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setView('list'); resetForm(); fetchBiens();
    } catch (e) {
      const detail = e.response?.data;
      alert("Erreur lors de l'ajout :\n" + (typeof detail === 'object' ? JSON.stringify(detail, null, 2) : detail));
    } finally { setFormLoading(false); }
  };

  const handleEdit = async () => {
    setFormLoading(true);
    try {
      const payload = {
        titre:                formData.titre.slice(0, 100),
        date:                 formData.date.slice(0, 50),
        technique:            formData.technique.slice(0, 100),
        sujet:                formData.sujet.slice(0, 150),
        inscription:          formData.inscription.slice(0, 150),
        description_visuelle: formData.description_visuelle.slice(0, 300),
        historique:           formData.historique.slice(0, 500),
        user_id:              artiste.id,
        auteur:               `${artiste.prenom} ${artiste.nom}`.slice(0, 50),
      };
      if (formData.image instanceof File) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        fd.append('image', formData.image);
        await axios.patch(`${apiUrl}${biensEndpoint}/api/biens/${selectedBien.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.patch(`${apiUrl}${biensEndpoint}/api/biens/${selectedBien.id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      setView('list'); resetForm(); fetchBiens();
    } catch (e) {
      const detail = e.response?.data;
      alert('Erreur lors de la modification :\n' + (typeof detail === 'object' ? JSON.stringify(detail, null, 2) : detail));
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await axios.delete(`${apiUrl}${biensEndpoint}/api/biens/${selectedBien.id}`);
      setView('list'); resetForm(); fetchBiens();
    } catch (e) {
      const detail = e.response?.data;
      alert('Erreur lors de la suppression :\n' + (typeof detail === 'object' ? JSON.stringify(detail, null, 2) : detail));
    } finally { setFormLoading(false); }
  };

  const presenterBien = (bien) => { enAttenteDePresentation(bien); setShow(false); };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = biens.filter((b) => {
    const q = search.toLowerCase();
    return !q || b.titre?.toLowerCase().includes(q) || b.technique?.toLowerCase().includes(q) || b.auteur?.toLowerCase().includes(q);
  });

  if (!show) return null;

  const headerTitle = {
    list:          isGestion ? "Biens de l'artiste" : 'Tous les biens culturels',
    add:           'Ajouter un bien',
    edit:          "Modifier le bien",
    delete:        "Supprimer le bien",
    'text-editor': textEditorField ? fieldLabels[textEditorField]?.label : '',
  }[view];

  return (
    <>
      <style>{`
        .om-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1100; padding: 20px;
          animation: omFadeIn 0.25s ease;
        }
        @keyframes omFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .om-box {
          background: #fff; border-radius: 28px;
          width: 100%; max-width: 1160px; max-height: 92vh;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 100px rgba(0,0,0,0.3);
          animation: omSlideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        @keyframes omSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── HEADER ── */
        .om-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 30px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
        }
        .om-header-left { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .om-title { font-size: 22px; font-weight: 800; color: #000; margin: 0; letter-spacing: -0.4px; }
        .om-count { background: #000; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 11px; border-radius: 20px; }

        /* tag artiste (mode gestion uniquement) */
        .om-artiste-tag {
          display: flex; align-items: center; gap: 10px;
          background: #f3f4f6; border-radius: 40px;
          padding: 6px 14px 6px 6px; border: 1px solid #e5e7eb;
        }
        .om-artiste-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb; }
        .om-artiste-avatar-placeholder {
          width: 36px; height: 36px; border-radius: 50%;
          background: #e5e7eb; display: flex; align-items: center; justify-content: center;
          color: #9ca3af; border: 2px solid #d1d5db;
        }
        .om-artiste-info { display: flex; flex-direction: column; }
        .om-artiste-name { font-size: 13px; font-weight: 700; color: #000; line-height: 1.2; }
        .om-artiste-nat { font-size: 11px; color: #6b7280; display: flex; align-items: center; gap: 3px; }

        .om-close {
          background: #f3f4f6; border: none; border-radius: 10px;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .om-close:hover { background: #e5e7eb; color: #000; }

        /* ── CONTROLS ── */
        .om-controls {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          padding: 18px 30px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .om-search {
          display: flex; align-items: center; gap: 10px;
          background: #f8f9fa; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 10px 16px;
        }
        .om-search input {
          border: none; background: transparent; outline: none;
          font-size: 14px; color: #000; width: 220px;
        }
        .om-search input::placeholder { color: #9ca3af; }
        .om-btn-add {
          display: flex; align-items: center; gap: 10px;
          background: #000; color: #fff; border: none;
          padding: 12px 24px; border-radius: 14px;
          font-weight: 600; font-size: 14px; cursor: pointer;
          transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .om-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .om-btn-back {
          display: flex; align-items: center; gap: 8px;
          background: #f3f4f6; color: #374151; border: none;
          padding: 12px 20px; border-radius: 14px;
          font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
        }
        .om-btn-back:hover { background: #e5e7eb; }

        /* ── BODY ── */
        .om-body { overflow-y: auto; padding: 26px 30px; flex: 1; }

        /* ── GRID ── */
        .om-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 22px;
        }

        /* ── CARD ── */
        .om-card {
          position: relative; border-radius: 22px; overflow: hidden; height: 300px;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .om-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 24px 60px rgba(0,0,0,0.22); }
        .om-card:hover .om-card-actions { opacity: 1; transform: translateY(0); }
        .om-card-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .om-card-content {
          position: relative; z-index: 3; height: 100%;
          display: flex; flex-direction: column; justify-content: space-between; padding: 16px;
        }

        /* actions hover */
        .om-card-actions {
          display: flex; gap: 8px; justify-content: flex-end;
          opacity: 0; transform: translateY(-8px); transition: all 0.3s ease;
        }
        .om-btn-icon {
          width: 34px; height: 34px; border-radius: 10px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .om-btn-icon.present { background: rgba(59,130,246,0.3); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); }
        .om-btn-icon.present:hover { background: rgba(59,130,246,0.5); }
        .om-btn-icon.edit { background: rgba(255,255,255,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
        .om-btn-icon.edit:hover { background: rgba(255,255,255,0.45); }
        .om-btn-icon.delete { background: rgba(239,68,68,0.3); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }
        .om-btn-icon.delete:hover { background: rgba(239,68,68,0.5); }

        /* card bottom */
        .om-card-bottom { display: flex; flex-direction: column; gap: 7px; }
        .om-card-title {
          font-size: 15px; font-weight: 700; color: #fff; margin: 0;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .om-card-auteur {
          font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 500;
          display: flex; align-items: center; gap: 4px;
        }
        .om-card-technique {
          font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.8px;
          background: rgba(255,255,255,0.2); color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); width: fit-content;
        }
        .om-card-btn {
          width: 100%; padding: 11px; border-radius: 40px;
          font-size: 13px; font-weight: 600; cursor: pointer; border: none;
          background: rgba(255,255,255,0.72); color: #111;
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .om-card-btn:hover { background: rgba(255,255,255,0.92); box-shadow: 0 4px 18px rgba(0,0,0,0.15); }

        /* ── EMPTY / SPINNER ── */
        .om-empty { text-align: center; padding: 70px 20px; color: #64748b; grid-column: 1/-1; }
        .om-empty svg { width: 64px; height: 64px; margin-bottom: 18px; opacity: 0.35; }
        .om-empty h3 { font-size: 19px; color: #000; margin: 0 0 8px; }
        .om-empty p { font-size: 14px; margin: 0; }
        .om-spinner {
          width: 44px; height: 44px; border: 3px solid #e5e7eb; border-top-color: #000;
          border-radius: 50%; animation: omSpin 1s linear infinite; margin: 60px auto 16px;
        }
        @keyframes omSpin { to { transform: rotate(360deg); } }

        /* ── FORMULAIRE ── */
        .om-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .om-form-grid { grid-template-columns: 1fr; } .om-grid { grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); } }
        .om-section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px; }
        .om-field { display: flex; flex-direction: column; gap: 6px; }
        .om-label { font-size: 13px; font-weight: 600; color: #374151; }
        .om-input, .om-textarea {
          background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px;
          padding: 12px 14px; font-size: 14px; color: #000; outline: none;
          transition: all 0.2s; font-family: 'Segoe UI', system-ui, sans-serif;
          box-sizing: border-box; width: 100%;
        }
        .om-input:focus, .om-textarea:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
        .om-textarea { resize: vertical; min-height: 80px; }

        /* bannière artiste dans formulaire */
        .om-artiste-banner {
          display: flex; align-items: center; gap: 14px;
          background: #f3f4f6; border-radius: 16px; padding: 14px 18px;
          border: 1px solid #e5e7eb; margin-bottom: 20px;
        }
        .om-artiste-banner img, .om-artiste-banner-placeholder {
          width: 52px; height: 52px; border-radius: 50%; object-fit: cover;
          border: 2px solid #e5e7eb; flex-shrink: 0;
        }
        .om-artiste-banner-placeholder {
          background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af;
        }
        .om-artiste-banner-name { font-size: 15px; font-weight: 700; color: #000; }
        .om-artiste-banner-nat { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; margin-top: 3px; }

        /* upload */
        .om-upload {
          border: 2px dashed #d1d5db; border-radius: 12px;
          padding: 20px; text-align: center; cursor: pointer;
          background: #f9fafb; color: #9ca3af; transition: border-color 0.2s; position: relative;
        }
        .om-upload:hover { border-color: #000; }
        .om-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .om-upload p { margin: 8px 0 0; font-size: 13px; }
        .om-upload p.has-file { color: #10b981; font-weight: 600; }

        /* preview */
        .om-preview {
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px; overflow: hidden;
          border: 2px dashed #e5e7eb; min-height: 240px; background: #f9fafb;
        }
        .om-preview img { width: 100%; max-height: 380px; object-fit: cover; border-radius: 12px; }
        .om-preview-empty { color: #9ca3af; text-align: center; padding: 32px; }
        .om-preview-empty p { font-size: 13px; margin: 10px 0 0; }

        /* expand button (description / historique) */
        .om-expand-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          background: #f9fafb; border: 1px solid #d1d5db; border-radius: 12px;
          padding: 12px 14px; cursor: pointer; text-align: left;
          transition: all 0.2s; width: 100%;
        }
        .om-expand-btn:hover { border-color: #000; background: #f3f4f6; }
        .om-expand-preview { font-size: 13px; color: #374151; flex: 1; line-height: 1.5; }
        .om-expand-placeholder { font-size: 13px; color: #9ca3af; flex: 1; font-style: italic; }
        .om-expand-icon {
          font-size: 12px; font-weight: 600; color: #6b7280; white-space: nowrap;
          background: #e5e7eb; padding: 4px 10px; border-radius: 20px; flex-shrink: 0;
        }
        .om-expand-btn:hover .om-expand-icon { background: #000; color: #fff; }

        /* delete */
        .om-delete-body { text-align: center; padding: 30px 20px; }
        .om-delete-body p { color: #374151; font-size: 16px; margin: 0 0 8px; }
        .om-delete-body strong { color: #000; }
        .om-delete-warning { color: #ef4444 !important; font-size: 14px !important; }
        .om-delete-preview { width: 100%; max-height: 150px; object-fit: cover; border-radius: 12px; margin: 14px 0; border: 1px solid #e5e7eb; }

        /* éditeur texte plein écran */
        .om-text-editor-body { display: flex; flex-direction: column; }
        .om-text-editor-wrapper { display: flex; flex-direction: column; gap: 12px; height: 100%; }
        .om-text-editor-meta { display: flex; align-items: center; justify-content: space-between; padding: 4px 2px; }
        .om-text-editor-hint { font-size: 13px; font-weight: 600; color: #374151; }
        .om-big-textarea {
          flex: 1; width: 100%; min-height: 380px;
          background: #f9fafb; border: 1.5px solid #d1d5db; border-radius: 16px;
          padding: 20px 22px; font-size: 15px; line-height: 1.8;
          color: #000; outline: none; resize: none;
          font-family: 'Segoe UI', system-ui, sans-serif;
          transition: border-color 0.2s; box-sizing: border-box;
        }
        .om-big-textarea:focus { border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
        .om-big-textarea::placeholder { color: #9ca3af; }

        /* footer */
        .om-footer { display: flex; gap: 12px; padding: 18px 30px; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
        .om-btn-cancel {
          flex: 1; padding: 13px 20px; border-radius: 12px; font-weight: 600; font-size: 14px;
          cursor: pointer; background: #f3f4f6; border: 1px solid #d1d5db; color: #374151;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .om-btn-cancel:hover { background: #e5e7eb; }
        .om-btn-confirm {
          flex: 1; padding: 13px 20px; border-radius: 12px; font-weight: 600; font-size: 14px;
          cursor: pointer; background: #000; border: none; color: #fff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .om-btn-confirm:hover:not(:disabled) { background: #1a1a1a; }
        .om-btn-confirm.danger { background: #ef4444; box-shadow: 0 4px 15px rgba(239,68,68,0.35); }
        .om-btn-confirm.danger:hover:not(:disabled) { background: #dc2626; }
        .om-btn-confirm:disabled, .om-btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Badge déjà exposé ── */
        .om-badge-exposed {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(16,185,129,0.25); color: #ffffff;
          border: 1px solid rgba(16,185,129,0.4);
          font-size: 11px; font-weight: 700; padding: 5px 10px;
          border-radius: 10px; backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px); white-space: nowrap;
        }
        .om-card-already-exposed {
          width: 100%; padding: 10px; border-radius: 40px;
          font-size: 13px; font-weight: 600; text-align: center;
          background: rgba(16,185,129,0.2); color: #ffffff;
          border: 1px solid rgba(16,185,129,0.35);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
      `}</style>

      <div className="om-overlay" onClick={handleClose}>
        <div className="om-box" onClick={(e) => e.stopPropagation()}>

          {/* ══ HEADER ══ */}
          <div className="om-header">
            <div className="om-header-left">
              <h2 className="om-title">{headerTitle}</h2>
              {view === 'list' && <span className="om-count">{filtered.length}</span>}

              {/* Tag artiste — mode gestion uniquement */}
              {isGestion && (
                <div className="om-artiste-tag">
                  {artiste.photo_profil ? (
                    <img src={`${apiUrl}${userEndpoint}${artiste.photo_profil}`} alt="" className="om-artiste-avatar" />
                  ) : (
                    <div className="om-artiste-avatar-placeholder"><UserIcon size={18} /></div>
                  )}
                  <div className="om-artiste-info">
                    <span className="om-artiste-name">{artiste.prenom} {artiste.nom}</span>
                    {artiste.nationalite && (
                      <span className="om-artiste-nat"><LocationIcon />{artiste.nationalite}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="om-close" onClick={handleClose}><CloseIcon /></button>
          </div>

          {/* ══ CONTROLS ══ */}
          <div className="om-controls">
            {view === 'list' ? (
              <>
                <div className="om-search">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder={isGestion ? "Titre, technique…" : "Titre, auteur, technique…"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* Bouton Ajouter — mode gestion uniquement */}
                {isGestion && (
                  <button className="om-btn-add" onClick={() => { resetForm(); setView('add'); }}>
                    <PlusIcon /> Ajouter un bien
                  </button>
                )}
              </>
            ) : view === 'text-editor' ? (
              <button className="om-btn-back" onClick={() => setView(prevView)}>
                <ArrowLeftIcon /> Retour au formulaire
              </button>
            ) : (
              <button className="om-btn-back" onClick={() => { setView('list'); resetForm(); }}>
                <ArrowLeftIcon /> Retour à la liste
              </button>
            )}
          </div>

          {/* ══ LISTE ══ */}
          {view === 'list' && (
            <div className="om-body">
              {loading ? (
                <>
                  <div className="om-spinner" />
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14 }}>Chargement…</p>
                </>
              ) : (
                <div className="om-grid">
                  {filtered.length === 0 ? (
                    <div className="om-empty">
                      <OeuvreSvgIcon size={64} />
                      <h3>Aucun bien</h3>
                      <p>{isGestion ? "Cet artiste n'a pas encore de biens. Ajoutez-en un !" : "Aucun bien disponible."}</p>
                    </div>
                  ) : (
                    filtered.map((bien, idx) => (
                      <div key={bien.id} className="om-card">
                        <div
                          className="om-card-bg"
                          style={
                            bien.image
                              ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%), url(${bien.image})` }
                              : { background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length] }
                          }
                        />
                        <div className="om-card-content">

                          {/* Actions hover — contenu selon le mode */}
                          <div className="om-card-actions">
                            {!isGestion && (
                              bien.salle_id == null ? (
                                <button className="om-btn-icon present" title="Présenter dans le musée" onClick={() => presenterBien(bien)}>
                                  <PresentIcon />
                                </button>
                              ) : (
                                <span className="om-badge-exposed">📍 Déjà exposé</span>
                              )
                            )}
                            {isGestion && (
                              // Mode gestion : Modifier + Supprimer
                              <>
                                <button className="om-btn-icon edit" title="Modifier" onClick={() => openEditView(bien)}>
                                  <PencilIcon />
                                </button>
                                <button className="om-btn-icon delete" title="Supprimer"
                                  onClick={() => { setSelectedBien(bien); setView('delete'); }}>
                                  <TrashIcon />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Bas de card */}
                          <div className="om-card-bottom">
                            <p className="om-card-title">{bien.titre}</p>
                            {/* Auteur visible en mode présentation */}
                            {!isGestion && bien.auteur && (
                              <div className="om-card-auteur">
                                <UserIcon size={11} /> {bien.auteur}
                              </div>
                            )}
                            {bien.technique && <span className="om-card-technique">{bien.technique}</span>}
                            {/* Bouton Présenter en bas — mode présentation uniquement */}
                            {!isGestion && (
                              bien.salle_id == null ? (
                                <button className="om-card-btn" onClick={() => presenterBien(bien)}>
                                  <PresentIcon /> Présenter
                                </button>
                              ) : (
                                <div className="om-card-already-exposed">
                                  📍 Déjà exposé
                                </div>
                              )
                            )}
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ FORMULAIRE AJOUTER / MODIFIER — mode gestion uniquement ══ */}
          {isGestion && (view === 'add' || view === 'edit') && (
            <>
              <div className="om-body">
                {/* Bannière artiste */}
                <div className="om-artiste-banner">
                  {artiste?.photo_profil ? (
                    <img src={`${apiUrl}${userEndpoint}${artiste.photo_profil}`} alt="" />
                  ) : (
                    <div className="om-artiste-banner-placeholder"><UserIcon size={22} /></div>
                  )}
                  <div>
                    <div className="om-artiste-banner-name">{artiste?.prenom} {artiste?.nom}</div>
                    <div className="om-artiste-banner-nat">
                      <LocationIcon /> {artiste?.nationalite || 'Nationalité inconnue'}
                    </div>
                  </div>
                </div>

                <div className="om-form-grid">
                  {/* Col 1 – Infos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p className="om-section-title">Informations</p>
                    <div className="om-field">
                      <label className="om-label">Titre * <span style={{fontWeight:400,color:'#9ca3af',fontSize:11}}>{formData.titre.length}/100</span></label>
                      <input className="om-input" name="titre" value={formData.titre} onChange={handleChange} placeholder="Ex : La Joconde" maxLength={100} />
                    </div>
                    <div className="om-field">
                      <label className="om-label">Date <span style={{fontWeight:400,color:'#9ca3af',fontSize:11}}>{formData.date.length}/50</span></label>
                      <input className="om-input" name="date" value={formData.date} onChange={handleChange} placeholder="Ex : 1503" maxLength={50} />
                    </div>
                    <div className="om-field">
                      <label className="om-label">Technique <span style={{fontWeight:400,color:'#9ca3af',fontSize:11}}>{formData.technique.length}/100</span></label>
                      <input className="om-input" name="technique" value={formData.technique} onChange={handleChange} placeholder="Ex : Huile sur toile" maxLength={100} />
                    </div>
                    <div className="om-field">
                      <label className="om-label">Sujet <span style={{fontWeight:400,color:'#9ca3af',fontSize:11}}>{formData.sujet.length}/150</span></label>
                      <input className="om-input" name="sujet" value={formData.sujet} onChange={handleChange} placeholder="Ex : Portrait" maxLength={150} />
                    </div>
                    <div className="om-field">
                      <label className="om-label">Inscription <span style={{fontWeight:400,color:'#9ca3af',fontSize:11}}>{formData.inscription.length}/150</span></label>
                      <input className="om-input" name="inscription" value={formData.inscription} onChange={handleChange} maxLength={150} />
                    </div>
                    <div className="om-field">
                      <label className="om-label">
                        Description visuelle
                        <span style={{fontWeight:400,color:formData.description_visuelle.length>270?'#ef4444':'#9ca3af',fontSize:11}}> {formData.description_visuelle.length}/300</span>
                      </label>
                      <button className="om-expand-btn" onClick={() => openTextEditor('description_visuelle')}>
                        {formData.description_visuelle
                          ? <span className="om-expand-preview">{formData.description_visuelle.slice(0,80)}{formData.description_visuelle.length>80?'…':''}</span>
                          : <span className="om-expand-placeholder">Cliquez pour saisir la description…</span>}
                        <span className="om-expand-icon">✎ Éditer</span>
                      </button>
                    </div>
                    <div className="om-field">
                      <label className="om-label">
                        Historique
                        <span style={{fontWeight:400,color:formData.historique.length>450?'#ef4444':'#9ca3af',fontSize:11}}> {formData.historique.length}/500</span>
                      </label>
                      <button className="om-expand-btn" onClick={() => openTextEditor('historique')}>
                        {formData.historique
                          ? <span className="om-expand-preview">{formData.historique.slice(0,80)}{formData.historique.length>80?'…':''}</span>
                          : <span className="om-expand-placeholder">Cliquez pour saisir l'historique…</span>}
                        <span className="om-expand-icon">✎ Éditer</span>
                      </button>
                    </div>
                  </div>

                  {/* Col 2 – Image */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p className="om-section-title">Image</p>
                    <div className="om-upload">
                      <UploadIcon />
                      <p className={formData.image instanceof File ? 'has-file' : ''}>
                        {formData.image instanceof File
                          ? `✓ ${formData.image.name}`
                          : view === 'edit' ? "Changer l'image (optionnel)" : 'Cliquez ou déposez une image'}
                      </p>
                      <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>

                  {/* Col 3 – Aperçu */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p className="om-section-title">Aperçu</p>
                    <div className="om-preview">
                      {previewImage
                        ? <img src={previewImage} alt="Aperçu" />
                        : <div className="om-preview-empty"><OeuvreSvgIcon size={52} /><p>L'aperçu apparaîtra ici</p></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="om-footer">
                <button className="om-btn-cancel" onClick={() => { setView('list'); resetForm(); }}>Annuler</button>
                <button className="om-btn-confirm" onClick={view === 'add' ? handleAdd : handleEdit} disabled={formLoading || !formData.titre}>
                  <SaveIcon />
                  {formLoading ? 'Enregistrement…' : view === 'add' ? "Ajouter le bien" : 'Enregistrer les modifications'}
                </button>
              </div>
            </>
          )}

          {/* ══ SUPPRIMER — mode gestion uniquement ══ */}
          {isGestion && view === 'delete' && selectedBien && (
            <>
              <div className="om-body">
                <div className="om-delete-body">
                  {selectedBien.image && (
                    <img src={`${apiUrl}${biensEndpoint}${selectedBien.image}`} alt={selectedBien.titre} className="om-delete-preview" />
                  )}
                  <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedBien.titre}"</strong> ?</p>
                  <p className="om-delete-warning">Cette action est irréversible.</p>
                </div>
              </div>
              <div className="om-footer">
                <button className="om-btn-cancel" onClick={() => { setView('list'); resetForm(); }}>Annuler</button>
                <button className="om-btn-confirm danger" onClick={handleDelete} disabled={formLoading}>
                  <TrashIcon /> {formLoading ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </>
          )}

          {/* ══ ÉDITEUR TEXTE — mode gestion uniquement ══ */}
          {isGestion && view === 'text-editor' && textEditorField && (
            <>
              <div className="om-body om-text-editor-body">
                <div className="om-text-editor-wrapper">
                  <div className="om-text-editor-meta">
                    <span className="om-text-editor-hint">
                      {fieldLabels[textEditorField]?.label} — max {fieldLabels[textEditorField]?.max} caractères
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: formData[textEditorField].length > fieldLabels[textEditorField]?.max * 0.9 ? '#ef4444' : '#9ca3af'
                    }}>
                      {formData[textEditorField].length} / {fieldLabels[textEditorField]?.max}
                    </span>
                  </div>
                  <textarea
                    className="om-big-textarea"
                    autoFocus
                    name={textEditorField}
                    value={formData[textEditorField]}
                    onChange={handleChange}
                    maxLength={fieldLabels[textEditorField]?.max}
                    placeholder={`Saisissez ${fieldLabels[textEditorField]?.label.toLowerCase()} ici…`}
                  />
                </div>
              </div>
              <div className="om-footer">
                <button className="om-btn-cancel" onClick={() => setFormData((p) => ({ ...p, [textEditorField]: '' }))}>
                  Effacer
                </button>
                <button className="om-btn-confirm" onClick={() => setView(prevView)}>
                  <SaveIcon /> Valider
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}