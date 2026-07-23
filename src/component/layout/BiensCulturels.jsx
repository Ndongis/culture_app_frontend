import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ornements_clair from '../../assets/images/ornements_clair.png';
import OrnementBackground from '../OrnementBackground';
import axios from "axios";
import { useOutletContext } from 'react-router-dom';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIG MICROSERVICE
// ══════════════════════════════════════════════════════════════════════════════

const BIENS_API_URL = 'http://localhost:8080';
const USERS_API_URL = 'http://localhost:8181';

const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;
const biensEndpoint = import.meta.env.VITE_BIENS_ENDPOINT;

// ══════════════════════════════════════════════════════════════════════════════
// ICÔNES SVG
// ══════════════════════════════════════════════════════════════════════════════

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const ChevronIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const FilterIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
);
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="10" height="10">
        <polyline points="2 6 5 9 10 3" />
    </svg>
);
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const TYPE_META = {
    oeuvre: {
        label: 'Oeuvre',
        color: '#7c3aed',
        bg: '#ede9fe',
        text: '#6d28d9',
        dot: '#7c3aed',
        thumbBg: '#f3f0ff',
        thumbStroke: '#a78bfa',
    },
    portrait: {
        label: 'Portrait',
        color: '#0369a1',
        bg: '#e0f2fe',
        text: '#075985',
        dot: '#0369a1',
        thumbBg: '#dbeafe',
        thumbStroke: '#1d4ed8',
    },
    document: {
        label: 'Document',
        color: '#92400e',
        bg: '#fef3c7',
        text: '#78350f',
        dot: '#92400e',
        barColor: '#f59e0b',
    },
};

const FILTER_OPTIONS = [
    { value: 'all', label: 'Tous les types', dot: '#6b7280' },
    { value: 'oeuvre', label: 'Oeuvre', dot: '#7c3aed' },
    { value: 'portrait', label: 'Portrait', dot: '#0369a1' },
    { value: 'document', label: 'Document', dot: '#92400e' },
];

const ADD_OPTIONS = [
    { value: 'oeuvre', label: "Oeuvre d'art", sub: 'Peinture, sculpture…', dot: '#7c3aed', iconBg: '#ede9fe' },
    { value: 'portrait', label: 'Portrait', sub: 'Personnalité historique', dot: '#0369a1', iconBg: '#e0f2fe' },
    { value: 'document', label: 'Document', sub: 'Archive, manuscrit…', dot: '#92400e', iconBg: '#fef3c7' },
];

const EMPTY_FORM = {
    titre: '', description: '', auteur: '', image: null,
    categories: [],
    // date flexible
    type_date: '', annee: '', siecle: '',
    // oeuvre
    date: '', technique: '', sujet: '', inscription: '', historique: '',
    // portrait
    nom: '', date_naissance: '', date_deces: '', nationalite: '',
    // document
    source: '', reference: '',
};

// ── Conversion chiffre → romain ──────────────────────────────────────────────
const toRoman = (num) => {
    if (!num || isNaN(num) || num < 1 || num > 39) return String(num);
    const vals = [10, 'X', 9, 'IX', 5, 'V', 4, 'IV', 1, 'I'];
    let result = '';
    let n = parseInt(num);
    for (let i = 0; i < vals.length; i += 2) {
        while (n >= vals[i]) { result += vals[i + 1]; n -= vals[i]; }
    }
    return result;
};
const formatSiecle = (s) => s ? `${toRoman(s)}e siècle` : '';
// ══════════════════════════════════════════════════════════════════════════════

function OeuvreThumb() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" width="36" height="36">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
        </svg>
    );
}
function PortraitThumb() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5" width="26" height="26">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}
function DocumentThumbIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" width="28" height="28">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
    );
}

// ── Gradients par défaut si pas d'image ──────────────────────────────────────
const CARD_GRADIENTS = {
    oeuvre: 'linear-gradient(145deg, #7c3aed 0%, #a78bfa 60%, #ddd6fe 100%)',
    portrait: 'linear-gradient(145deg, #0369a1 0%, #38bdf8 60%, #bfdbfe 100%)',
    document: 'linear-gradient(145deg, #92400e 0%, #f59e0b 60%, #fef3c7 100%)',
};

function BienCard({ bien, type, onView, onEdit, onDelete }) {
    const authContext = useContext(AuthContext);
    const user = authContext?.user ?? null;
    const cardRef = useRef(null);

    const img = bien.image ? `${bien.image}` : null;
    const meta = TYPE_META[type] || TYPE_META.oeuvre;
    const bg = img ? null : CARD_GRADIENTS[type] || CARD_GRADIENTS.oeuvre;

    const dateStr = bien.type_date === 'ANNEE' && bien.annee
        ? String(bien.annee)
        : bien.type_date === 'SIECLE' && bien.siecle
            ? formatSiecle(bien.siecle)
            : bien.date || bien.date_naissance || null;

    const subtitle = type === 'oeuvre'
        ? bien.technique || null
        : type === 'portrait'
            ? bien.nationalite || null
            : bien.source || null;

    const name = type === 'portrait' ? (bien.nom || bien.titre) : bien.titre;
    console.log({
        role: user?.role,
        userInstitution: user?.institution_id,
        bienInstitution: bien?.institution_id
    });
    // ── Effet dock ───────────────────────────────────────────────────────────
    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        const onEnter = () => { el.style.transform = 'scale(1.12)'; el.style.zIndex = '10'; };
        const onLeave = () => { el.style.transform = 'scale(1)'; el.style.zIndex = '1'; };
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mouseenter', onEnter);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className="bc-vcard"
            style={{ transition: 'transform 0.12s ease-out', transformOrigin: 'center center' }}
        >
            {img
                ? <div className="bc-vcard-bg" style={{ backgroundImage: `url(${img})` }} />
                : <div className="bc-vcard-bg" style={{ background: bg }} />
            }
            <div className="bc-vcard-overlay" />
            <div className="bc-vcard-blur" />

            <div className="bc-vcard-content">
                <div className="bc-vcard-top">
                    <span className={`bc-vcard-badge bc-vcard-badge-${type}`}>{meta.label}</span>
                </div>
                <div className="bc-vcard-bottom">
                    <p className="bc-vcard-title">{name}</p>
                    {bien.auteur && type !== 'portrait' && (
                        <p className="bc-vcard-sub">{bien.auteur}{dateStr ? ` · ${dateStr}` : ''}</p>
                    )}
                    {type === 'portrait' && dateStr && (
                        <p className="bc-vcard-sub">Né en {dateStr}</p>
                    )}
                    {subtitle && <p className="bc-vcard-tech">{subtitle}</p>}
                    <div className="bc-vcard-actions">
                        <button
                            className="bc-vcard-btn"
                            onClick={() => onView(bien)}
                        >
                            <EyeIcon />
                        </button>

                        {
                            (
                                user?.role === "administrateur" ||
                                (
                                    ["admin_institution", "conservateur"].includes(user?.role) &&
                                    user?.institution_id === bien?.institution_id
                                )
                            ) && (
                                <>
                                    {onEdit && (
                                        <button
                                            className="bc-vcard-btn"
                                            onClick={() => onEdit(bien)}
                                        >
                                            <PencilIcon />
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            className="bc-vcard-btn bc-vcard-btn-danger"
                                            onClick={() => onDelete(bien)}
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardOeuvre({ bien, onView, onEdit, onDelete }) {
    return <BienCard bien={bien} type="oeuvre" onView={onView} onEdit={onEdit} onDelete={onDelete} />;
}
function CardPortrait({ bien, onView, onEdit, onDelete }) {
    return <BienCard bien={bien} type="portrait" onView={onView} onEdit={onEdit} onDelete={onDelete} />;
}
function CardDocument({ bien, onView, onEdit, onDelete }) {
    return <BienCard bien={bien} type="document" onView={onView} onEdit={onEdit} onDelete={onDelete} />;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL AJOUTER / MODIFIER
// ══════════════════════════════════════════════════════════════════════════════

// ── Sélecteur d'artiste (step 1 pour oeuvre) ─────────────────────────────────

const AS_GRADIENTS = [
    'linear-gradient(145deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
    'linear-gradient(145deg, #84cc16 0%, #a3e635 50%, #d9f99d 100%)',
    'linear-gradient(145deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%)',
    'linear-gradient(145deg, #f97316 0%, #fb923c 50%, #fed7aa 100%)',
    'linear-gradient(145deg, #ec4899 0%, #f472b6 50%, #fbcfe8 100%)',
    'linear-gradient(145deg, #8b5cf6 0%, #a78bfa 50%, #ddd6fe 100%)',
];

function ArtisteSelector({ onSelect }) {
    const [artistes, setArtistes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${apiUrl}${usersEndpoint}/api/artistes`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setArtistes(Array.isArray(d) ? d : (d.results || [])))
            .catch(() => setArtistes([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = artistes.filter(a =>
        `${a.prenom || ''} ${a.nom || ''}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleAjouterArtiste = () => {
        window.location.href = '/artistes?openModal=true';
    };

    return (
        <div className="bc-as-wrap">
            {/* Barre de recherche */}
            <div className="bc-as-search">
                <SearchIcon />
                <input
                    autoFocus
                    placeholder="Rechercher un artiste…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bc-as-search-input"
                />
            </div>

            {/* Avertissement + bouton ajouter */}
            <div className="bc-as-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Si l'artiste n'existe pas —</span>
                <button className="bc-as-add-btn" onClick={handleAjouterArtiste}>
                    <PlusIcon /> Ajouter un artiste
                </button>
            </div>

            {/* Contenu */}
            {loading ? (
                <div className="bc-as-loading">
                    <div className="bc-spinner bc-spinner-sm" />
                    <p>Chargement des artistes…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bc-as-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{ opacity: 0.3, marginBottom: 8 }}>
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <p>Aucun artiste trouvé</p>
                </div>
            ) : (
                <div className="bc-as-grid">
                    {filtered.map((a, i) => {
                        const fullName = a.nom_complet || `${a.prenom || ''} ${a.nom || ''}`.trim() || 'Artiste';
                        const gradient = AS_GRADIENTS[i % AS_GRADIENTS.length];
                        return (
                            <div key={a.id} className="bc-as-card" onClick={() => onSelect(a)}>
                                {/* Fond photo ou dégradé */}
                                {a.photo_profil
                                    ? <div className="bc-as-card-bg" style={{ backgroundImage: `url(${a.photo_profil})` }} />
                                    : <div className="bc-as-card-bg" style={{ background: gradient }} />
                                }
                                {/* Overlay sombre */}
                                <div className="bc-as-card-overlay" />
                                {/* Blur bas */}
                                <div className="bc-as-card-blur" />
                                {/* Contenu */}
                                <div className="bc-as-card-content">
                                    <div className="bc-as-card-top">
                                        <span className={`bc-as-badge ${a.is_active ? 'active' : 'inactive'}`}>
                                            ● {a.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <div className="bc-as-card-bottom">
                                        <p className="bc-as-card-name">{fullName}</p>
                                        {a.pays && (
                                            <p className="bc-as-card-sub">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {a.pays}
                                            </p>
                                        )}
                                        <button className="bc-as-card-select-btn">
                                            Sélectionner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── ModalForm ─────────────────────────────────────────────────────────────────

function ModalForm({ type, bien, institutionId, onClose, onSuccess }) {
    const isEdit = !!bien;

    // step 1 = artiste (oeuvre only), step 2 = formulaire, step 3 = catégories
    // En mode edit oeuvre, on commence au step 2 aussi, mais on charge l'artiste existant
    const [step, setStep] = useState(type === 'oeuvre' && !isEdit ? 1 : 2);
    const [prevStep, setPrevStep] = useState(2);
    const [artiste, setArtiste] = useState(null);
    const [artisteLoading, setArtisteLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [catSearch, setCatSearch] = useState('');

    const [form, setForm] = useState(() => {
        if (isEdit) {
            const cats = (bien.categories || []).map(c => typeof c === 'object' ? c.id : c);
            return { ...EMPTY_FORM, ...bien, image: null, categories: cats };
        }
        return { ...EMPTY_FORM };
    });
    const [loading, setLoading] = useState(false);

    // Fetch catégories
    useEffect(() => {
        fetch(`${apiUrl}${biensEndpoint}/api/categories`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setCategories(Array.isArray(d) ? d : (d.results || [])))
            .catch(() => setCategories([]));
    }, []);

    // En mode edit oeuvre : charger l'artiste existant depuis artiste_id
    useEffect(() => {
        if (type === 'oeuvre' && isEdit && bien.artiste_id) {
            setArtisteLoading(true);
            fetch(`${apiUrl}${usersEndpoint}/api/artistes/${bien.artiste_id}`, { credentials: 'include' })
                .then(r => r.json())
                .then(a => setArtiste(a))
                .catch(() => setArtiste(null))
                .finally(() => setArtisteLoading(false));
        }
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleCategorie = (id) => {
        setForm(p => ({
            ...p,
            categories: p.categories.includes(id)
                ? p.categories.filter(c => c !== id)
                : [...p.categories, id],
        }));
    };

    const goToCats = () => { setPrevStep(step); setCatSearch(''); setStep(3); };
    const backFromCats = () => setStep(prevStep);

    const handleSelectArtiste = (a) => {
        setArtiste(a);
        set('artiste_id', a.id);
        set('auteur', `${a.prenom || ''} ${a.nom || ''}`.trim());
        setStep(2);
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};

        // Commun à tous les types
        if (!form.titre?.trim()) e.titre = 'Le titre est obligatoire.';

        // Auteur obligatoire seulement pour oeuvre
        if (type === 'oeuvre') {
            if (!form.artiste_id && !artiste) e.artiste = "L'artiste est obligatoire.";
            if (!form.technique?.trim()) e.technique = 'La technique est obligatoire.';
            if (!form.sujet?.trim()) e.sujet = 'Le sujet est obligatoire.';
        }

        // Portrait — auteur optionnel
        if (type === 'portrait') {
            if (!form.nom?.trim()) e.nom = 'Le nom est obligatoire.';
            if (!form.nationalite?.trim()) e.nationalite = 'La nationalité est obligatoire.';
        }

        // Document — auteur optionnel
        if (type === 'document') {
            if (!form.source?.trim()) e.source = 'La source est obligatoire.';
            if (!form.reference?.trim()) e.reference = 'La référence est obligatoire.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };



    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            const fd = new FormData();

            fd.append("type", type);

            // Injecter l'institution_id depuis le contexte utilisateur
            if (institutionId) {
                fd.append("institution_id", institutionId);
            }

            Object.entries(form).forEach(([k, v]) => {
                if (k === "categories") return;
                if (v !== null && v !== "") {
                    fd.append(k, v);
                }
            });

            // Envoyer chaque catégorie séparément
            (form.categories || []).forEach((id) =>
                fd.append("categories", id)
            );


            const url = isEdit
                ? `${apiUrl}${biensEndpoint}/api/biens/${bien.id}`
                : `${apiUrl}${biensEndpoint}/api/biens`;

            const res = isEdit
                ? await axios.patch(url, fd, {
                    withCredentials: true,
                })
                : await axios.post(url, fd, {
                    withCredentials: true,
                });

            onSuccess();
        } catch (err) {
            let message = "Une erreur est survenue.";

            if (axios.isAxiosError(err)) {
                if (err.response?.data) {
                    message =
                        typeof err.response.data === "string"
                            ? err.response.data
                            : JSON.stringify(err.response.data);
                } else {
                    message = err.message;
                }
            }

            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const meta = TYPE_META[type] || TYPE_META.oeuvre;

    return (
        <div className="bc-overlay" onClick={onClose}>
            <div className={`bc-modal ${step >= 1 ? 'bc-modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="bc-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Bouton retour pour step 3 */}
                        {step === 3 && (
                            <button className="bc-back-btn" onClick={backFromCats}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        )}
                        {/* Breadcrumb steps pour oeuvre (ajout ET modification) */}
                        {type === 'oeuvre' && step !== 3 && (
                            <div className="bc-steps">
                                <div className={`bc-step ${step >= 1 ? 'done' : ''}`}>
                                    <span className="bc-step-dot">1</span>
                                    <span className="bc-step-label">Artiste</span>
                                </div>
                                <div className="bc-step-line" />
                                <div className={`bc-step ${step === 2 ? 'done' : ''}`}>
                                    <span className="bc-step-dot">2</span>
                                    <span className="bc-step-label">Détails</span>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <>
                                <h2 className="bc-modal-title">Catégories</h2>
                                {form.categories.length > 0 && (
                                    <span className="bc-count" style={{ fontSize: 12 }}>{form.categories.length} sélectionnée{form.categories.length > 1 ? 's' : ''}</span>
                                )}
                            </>
                        )}
                        {step !== 3 && type !== 'oeuvre' && (
                            <>
                                <span className={`bc-tag bc-tag-${type}`}>{meta.label}</span>
                                <h2 className="bc-modal-title">
                                    {isEdit ? `Modifier ${meta.label.toLowerCase()}` : `Ajouter ${meta.label.toLowerCase()}`}
                                </h2>
                            </>
                        )}
                    </div>
                    <button className="bc-modal-close" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* ── STEP 1 : Sélection artiste ── */}
                {step === 1 && (
                    <div className="bc-modal-body">
                        <p className="bc-step-intro">
                            Sélectionnez l'artiste associé à cette oeuvre
                        </p>
                        <ArtisteSelector onSelect={handleSelectArtiste} />
                    </div>
                )}

                {/* ── STEP 3 : Catégories ── */}
                {step === 3 && (
                    <>
                        <div className="bc-modal-body">
                            {/* Barre de recherche */}
                            <div className="bc-cats-search-bar">
                                <SearchIcon />
                                <input
                                    autoFocus
                                    className="bc-cats-search-input"
                                    placeholder="Rechercher une catégorie…"
                                    value={catSearch}
                                    onChange={e => setCatSearch(e.target.value)}
                                />
                                {catSearch && (
                                    <button className="bc-cats-search-clear" onClick={() => setCatSearch('')}>
                                        <CloseIcon />
                                    </button>
                                )}
                            </div>

                            {/* Liste */}
                            <div className="bc-cats-list">
                                {categories
                                    .filter(c => c.nom.toLowerCase().includes(catSearch.toLowerCase()))
                                    .map(cat => {
                                        const selected = form.categories.includes(cat.id);
                                        return (
                                            <div
                                                key={cat.id}
                                                className={`bc-cats-row ${selected ? 'selected' : ''}`}
                                                onClick={() => toggleCategorie(cat.id)}
                                            >
                                                <div className="bc-cats-row-left">
                                                    <div className={`bc-cats-chk ${selected ? 'on' : ''}`}>
                                                        {selected && <CheckIcon />}
                                                    </div>
                                                    <div>
                                                        <div className="bc-cats-row-name">{cat.nom}</div>
                                                        {cat.description && (
                                                            <div className="bc-cats-row-desc">{cat.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {selected && <span className="bc-cats-row-badge">Sélectionné</span>}
                                            </div>
                                        );
                                    })
                                }
                                {categories.filter(c => c.nom.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                                    <div className="bc-cats-empty">Aucune catégorie trouvée</div>
                                )}
                            </div>
                        </div>
                        <div className="bc-modal-footer">
                            <button className="bc-btn-cancel" onClick={backFromCats}>Annuler</button>
                            <button className="bc-btn-confirm" onClick={backFromCats}>
                                <CheckIcon /> Confirmer ({form.categories.length} sélectionnée{form.categories.length > 1 ? 's' : ''})
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 2 : Formulaire ── */}
                {step === 2 && (
                    <>
                        <div className="bc-modal-body">
                            <div className="bc-step2-layout">

                                {/* ── Colonne gauche : miniature artiste (oeuvre uniquement) ── */}
                                {type === 'oeuvre' && (
                                    <div className="bc-step2-sidebar">
                                        {artisteLoading ? (
                                            <div className="bc-step2-artiste-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                                                <div className="bc-spinner bc-spinner-sm" />
                                            </div>
                                        ) : artiste ? (
                                            <div className="bc-step2-artiste-card">
                                                {artiste.photo_profil
                                                    ? <div className="bc-step2-artiste-bg" style={{ backgroundImage: `url(${artiste.photo_profil})` }} />
                                                    : <div className="bc-step2-artiste-bg" style={{ background: AS_GRADIENTS[0] }} />
                                                }
                                                <div className="bc-step2-artiste-overlay" />
                                                <div className="bc-step2-artiste-blur" />
                                                <div className="bc-step2-artiste-content">
                                                    <span className={`bc-as-badge ${artiste.is_active ? 'active' : 'inactive'}`}>
                                                        ● {artiste.is_active ? 'Actif' : 'Inactif'}
                                                    </span>
                                                    <div>
                                                        <p className="bc-step2-artiste-name">
                                                            {artiste.prenom} {artiste.nom}
                                                        </p>
                                                        {artiste.pays && (
                                                            <p className="bc-step2-artiste-pays">
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                                    <circle cx="12" cy="10" r="3" />
                                                                </svg>
                                                                {artiste.pays}
                                                            </p>
                                                        )}
                                                        <button className="bc-step2-change-btn" onClick={() => setStep(1)}>
                                                            Changer d'artiste
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Pas d'artiste chargé : bouton pour en choisir un */
                                            <div className="bc-step2-artiste-empty" onClick={() => setStep(1)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" width="28" height="28">
                                                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                                </svg>
                                                <span>Choisir un artiste</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Colonne droite : formulaire ── */}
                                <div className="bc-modal-form">

                                    {/* Champs communs */}
                                    <div className="bc-form-row">
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">Titre <span className="bc-required">*</span></label>
                                            <input className={`bc-form-input ${errors.titre ? 'bc-input-error' : ''}`} value={form.titre} onChange={e => { set('titre', e.target.value); setErrors(p => ({ ...p, titre: '' })); }} placeholder="Titre du bien" maxLength={50} />
                                            {errors.titre && <span className="bc-field-error">{errors.titre}</span>}
                                        </div>
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">
                                                Auteur <span className="bc-optional">(optionnel)</span>
                                            </label>
                                            <input className={`bc-form-input ${errors.auteur ? 'bc-input-error' : ''}`} value={form.auteur} onChange={e => { set('auteur', e.target.value); setErrors(p => ({ ...p, auteur: '' })); }} placeholder="Nom de l'auteur" maxLength={100} />
                                            {errors.auteur && <span className="bc-field-error">{errors.auteur}</span>}
                                        </div>
                                    </div>

                                    <div className="bc-form-group">
                                        <label className="bc-form-label">Description <span className="bc-optional">(optionnel)</span></label>
                                        <textarea className={`bc-form-textarea ${errors.description ? 'bc-input-error' : ''}`} value={form.description} onChange={e => { set('description', e.target.value); setErrors(p => ({ ...p, description: '' })); }} placeholder="Description du bien culturel…" maxLength={300} />
                                        {errors.description && <span className="bc-field-error">{errors.description}</span>}
                                    </div>

                                    <div className="bc-form-group">
                                        <label className="bc-form-label">Historique <span className="bc-optional">(optionnel)</span></label>
                                        <textarea className="bc-form-textarea" value={form.historique} onChange={e => set('historique', e.target.value)} placeholder="Historique du bien culturel…" />
                                    </div>

                                    {/* Date flexible : type_date + annee/siecle */}
                                    <div className="bc-form-group">
                                        <label className="bc-form-label">Type de date</label>
                                        <div className="bc-type-date-wrap">
                                            <button
                                                type="button"
                                                className={`bc-type-date-btn ${form.type_date === 'ANNEE' ? 'selected' : ''}`}
                                                onClick={() => { set('type_date', 'ANNEE'); set('siecle', ''); }}
                                            >
                                                Année
                                            </button>
                                            <button
                                                type="button"
                                                className={`bc-type-date-btn ${form.type_date === 'SIECLE' ? 'selected' : ''}`}
                                                onClick={() => { set('type_date', 'SIECLE'); set('annee', ''); }}
                                            >
                                                Siècle
                                            </button>
                                        </div>
                                    </div>

                                    {form.type_date === 'ANNEE' && (
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">Année</label>
                                            <input
                                                className="bc-form-input"
                                                type="number"
                                                value={form.annee}
                                                onChange={e => set('annee', e.target.value)}
                                                placeholder="Ex: 1972"
                                            />
                                        </div>
                                    )}
                                    {form.type_date === 'SIECLE' && (
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">
                                                Siècle
                                                {form.siecle && (
                                                    <span className="bc-siecle-preview">{formatSiecle(form.siecle)}</span>
                                                )}
                                            </label>
                                            <input
                                                className="bc-form-input"
                                                type="number"
                                                min="1"
                                                max="39"
                                                value={form.siecle}
                                                onChange={e => set('siecle', e.target.value)}
                                                placeholder="Ex: 17"
                                            />
                                        </div>
                                    )}

                                    {/* Champs spécifiques Oeuvre */}
                                    {type === 'oeuvre' && <>
                                        {errors.artiste && <span className="bc-field-error bc-field-error-block">{errors.artiste}</span>}
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">Technique <span className="bc-required">*</span></label>
                                            <input className={`bc-form-input ${errors.technique ? 'bc-input-error' : ''}`} value={form.technique} onChange={e => { set('technique', e.target.value); setErrors(p => ({ ...p, technique: '' })); }} placeholder="Ex: Huile sur toile" maxLength={100} />
                                            {errors.technique && <span className="bc-field-error">{errors.technique}</span>}
                                        </div>
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">Sujet <span className="bc-required">*</span></label>
                                            <input className={`bc-form-input ${errors.sujet ? 'bc-input-error' : ''}`} value={form.sujet} onChange={e => { set('sujet', e.target.value); setErrors(p => ({ ...p, sujet: '' })); }} placeholder="Sujet de l'oeuvre" maxLength={150} />
                                            {errors.sujet && <span className="bc-field-error">{errors.sujet}</span>}
                                        </div>
                                        <div className="bc-form-group">
                                            <label className="bc-form-label">Inscription <span className="bc-optional">(optionnel)</span></label>
                                            <input className="bc-form-input" value={form.inscription} onChange={e => set('inscription', e.target.value)} placeholder="Inscription sur l'oeuvre" maxLength={150} />
                                        </div>
                                    </>}

                                    {/* Champs spécifiques Portrait */}
                                    {type === 'portrait' && <>
                                        <div className="bc-form-row">
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Nom complet <span className="bc-required">*</span></label>
                                                <input className={`bc-form-input ${errors.nom ? 'bc-input-error' : ''}`} value={form.nom} onChange={e => { set('nom', e.target.value); setErrors(p => ({ ...p, nom: '' })); }} placeholder="Nom du personnage" maxLength={100} />
                                                {errors.nom && <span className="bc-field-error">{errors.nom}</span>}
                                            </div>
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Nationalité <span className="bc-required">*</span></label>
                                                <input className={`bc-form-input ${errors.nationalite ? 'bc-input-error' : ''}`} value={form.nationalite} onChange={e => { set('nationalite', e.target.value); setErrors(p => ({ ...p, nationalite: '' })); }} placeholder="Ex: Sénégalais" maxLength={50} />
                                                {errors.nationalite && <span className="bc-field-error">{errors.nationalite}</span>}
                                            </div>
                                        </div>
                                        <div className="bc-form-row">
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Date de naissance <span className="bc-optional">(optionnel)</span></label>
                                                <input
                                                    className={`bc-form-input bc-date-input ${errors.date_naissance ? 'bc-input-error' : ''}`}
                                                    type="text"
                                                    value={form.date_naissance}
                                                    onChange={e => { set('date_naissance', e.target.value); setErrors(p => ({ ...p, date_naissance: '' })); }}
                                                />
                                                {errors.date_naissance && <span className="bc-field-error">{errors.date_naissance}</span>}
                                            </div>
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Date de décès <span className="bc-optional">(optionnel)</span></label>
                                                <input
                                                    className="bc-form-input bc-date-input"
                                                    type="text"
                                                    value={form.date_deces}
                                                    onChange={e => set('date_deces', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </>}

                                    {/* Champs spécifiques Document */}
                                    {type === 'document' && <>
                                        <div className="bc-form-row">
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Source <span className="bc-required">*</span></label>
                                                <input className={`bc-form-input ${errors.source ? 'bc-input-error' : ''}`} value={form.source} onChange={e => { set('source', e.target.value); setErrors(p => ({ ...p, source: '' })); }} placeholder="Ex: Archives nationales" maxLength={100} />
                                                {errors.source && <span className="bc-field-error">{errors.source}</span>}
                                            </div>
                                            <div className="bc-form-group">
                                                <label className="bc-form-label">Référence <span className="bc-required">*</span></label>
                                                <input className={`bc-form-input ${errors.reference ? 'bc-input-error' : ''}`} value={form.reference} onChange={e => { set('reference', e.target.value); setErrors(p => ({ ...p, reference: '' })); }} placeholder="Ex: MS-0042" maxLength={100} />
                                                {errors.reference && <span className="bc-field-error">{errors.reference}</span>}
                                            </div>
                                        </div>
                                    </>}

                                    {/* Catégories — bouton déclencheur */}
                                    <div className="bc-form-group">
                                        <label className="bc-form-label">Catégories</label>
                                        <button type="button" className="bc-cats-trigger" onClick={goToCats}>
                                            <div className="bc-cats-trigger-left">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                    <path d="M4 6h16M4 12h8m-8 6h16" />
                                                </svg>
                                                {form.categories.length === 0
                                                    ? <span className="bc-cats-placeholder">Choisir des catégories…</span>
                                                    : <div className="bc-cats-pills-preview">
                                                        {categories
                                                            .filter(c => form.categories.includes(c.id))
                                                            .map(c => (
                                                                <span key={c.id} className="bc-cat-pill-mini">{c.nom}</span>
                                                            ))
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            <div className="bc-cats-trigger-right">
                                                {form.categories.length > 0 && (
                                                    <span className="bc-cats-count">{form.categories.length}</span>
                                                )}
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Image */}
                                    <div className="bc-form-group">
                                        <label className="bc-form-label">Image</label>
                                        <div className={`bc-file-area ${form.image ? 'has-file' : ''}`}>
                                            <UploadIcon />
                                            <p className={form.image ? 'has-name' : ''}>
                                                {form.image ? form.image.name : 'Cliquez pour ajouter une image'}
                                            </p>
                                            <input type="file" accept="image/*"
                                                onChange={e => { const f = e.target.files[0]; if (f) set('image', f); }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bc-modal-footer">
                            <button className="bc-btn-cancel" onClick={onClose}>Annuler</button>
                            <button className="bc-btn-confirm" onClick={handleSubmit} disabled={loading}>
                                {isEdit ? <PencilIcon /> : <PlusIcon />}
                                {loading ? (isEdit ? 'Modification…' : 'Ajout…') : (isEdit ? 'Modifier' : 'Ajouter')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL SUPPRIMER
// ══════════════════════════════════════════════════════════════════════════════

function ModalDelete({ bien, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}${biensEndpoint}/api/biens/${bien.id}`, {
                method: 'DELETE', credentials: 'include',
            });
            if (!res.ok) throw new Error('Erreur de suppression');
            onSuccess();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };
    return (
        <div className="bc-overlay" onClick={onClose}>
            <div className="bc-modal bc-modal-sm" onClick={e => e.stopPropagation()}>
                <div className="bc-modal-header">
                    <h2 className="bc-modal-title">Supprimer le bien</h2>
                    <button className="bc-modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="bc-modal-body">
                    <div className="bc-delete-msg">
                        <p>Êtes-vous sûr de vouloir supprimer <strong>"{bien.titre}"</strong> ?</p>
                        <p className="bc-delete-warn">Cette action est irréversible.</p>
                    </div>
                </div>
                <div className="bc-modal-footer">
                    <button className="bc-btn-cancel" onClick={onClose}>Annuler</button>
                    <button className="bc-btn-confirm bc-btn-danger-confirm" onClick={handleDelete} disabled={loading}>
                        <TrashIcon /> {loading ? 'Suppression…' : 'Supprimer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL DÉTAILS
// ══════════════════════════════════════════════════════════════════════════════

function ModalDetails({ bien, onClose, onEdit }) {
    const raw = (bien.resourcetype || bien.type || bien.polymorphic_ctype_name || '').toLowerCase();
    const type = raw.includes('oeuvre') ? 'oeuvre' : raw.includes('portrait') ? 'portrait' : raw.includes('document') ? 'document' : raw || 'oeuvre';
    const meta = TYPE_META[type] || TYPE_META.oeuvre;
    return (
        <div className="bc-overlay" onClick={onClose}>
            <div className="bc-modal" onClick={e => e.stopPropagation()}>
                <div className="bc-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={`bc-tag bc-tag-${type}`}>{meta.label}</span>
                        <h2 className="bc-modal-title">{bien.titre}</h2>
                    </div>
                    <button className="bc-modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="bc-modal-body">
                    <div className="bc-details-grid">
                        <div className="bc-details-section">
                            <h3 className="bc-details-section-title">Informations générales</h3>
                            {[
                                ['Titre', bien.titre],
                                ['Auteur', bien.auteur],
                                ['Description', bien.description],
                                // Date flexible
                                ...(bien.type_date === 'ANNEE' ? [['Année', bien.annee != null ? String(bien.annee) : null]] : []),
                                ...(bien.type_date === 'SIECLE' ? [['Siècle', bien.siecle != null ? formatSiecle(bien.siecle) : null]] : []),
                                ...(type === 'oeuvre' ? [
                                    ['Technique', bien.technique],
                                    ['Sujet', bien.sujet],
                                    ['Historique', bien.historique],
                                ] : []),
                                ...(type === 'portrait' ? [
                                    ['Nom', bien.nom],
                                    ['Date de naissance', bien.date_naissance],
                                    ['Date de décès', bien.date_deces],
                                    ['Nationalité', bien.nationalite],
                                ] : []),
                                ...(type === 'document' ? [
                                    ['Source', bien.source],
                                    ['Référence', bien.reference],
                                ] : []),
                            ].filter(([, v]) => v).map(([label, value]) => (
                                <div key={label} className="bc-detail-row">
                                    <span className="bc-detail-label">{label}</span>
                                    <span className="bc-detail-value">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bc-details-section">
                            <h3 className="bc-details-section-title">Image</h3>
                            {bien.image
                                ? <img src={`${bien.image}`} alt={bien.titre} className="bc-detail-img" onClick={() => window.open(`${bien.image}`, '_blank')} style={{ cursor: 'pointer' }} />
                                : <div className="bc-detail-img-placeholder">Aucune image</div>
                            }
                        </div>
                    </div>
                </div>
                <div className="bc-modal-footer">
                    <button className="bc-btn-cancel" onClick={onClose}>Fermer</button>
                    <button className="bc-btn-confirm" onClick={() => { onClose(); onEdit(bien); }}>
                        <PencilIcon /> Modifier
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function BiensCulturels({ institutionId: propInstitutionId = null, institutionNom: propInstitutionNom = '', onRetour = null }) {
 
    const outletContext = useOutletContext();
    const searchTerm = outletContext?.searchTerm ?? '';
    const authContext = useContext(AuthContext);
    const user = authContext?.user ?? null;
    // Rôles autorisés à modifier
    const canEdit = user?.role === 'admin_institution' || user?.role === 'conservateur' || user?.role === 'administrateur';

    // institution_id effectif selon le rôle :
    // - admin_institution / conservateur → toujours user.institution_id
    // - administrateur sans prop         → null (tous les biens)
    // - administrateur avec prop         → propInstitutionId (filtre par institution)
    const institutionId =
        (user?.role === 'admin_institution' || user?.role === 'conservateur')
            ? (user?.institution_id ?? null)
            : user?.role === 'administrateur'
                ? (propInstitutionId ?? null)
                : null;

    // Contexte institution actif :
    // - administrateur avec institutionId (prop)
    // - admin_institution / conservateur avec user.institution_id
    const isInstitutionContext =
        (user?.role === 'administrateur' && propInstitutionId != null) ||
        ((user?.role === 'admin_institution' || user?.role === 'conservateur') && user?.institution_id != null);
    console.log("inst " + institutionId)

    const [biens, setBiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [filterOpen, setFilterOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const [modalAdd, setModalAdd] = useState(null);
    const [modalEdit, setModalEdit] = useState(null);
    const [modalDelete, setModalDelete] = useState(null);
    const [modalDetails, setModalDetails] = useState(null);

    const filterRef = useRef();
    const addRef = useRef();
    const pageRef = useRef();
    const gridRef = useRef();
    const [mousePos, setMousePos] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);
    // ── Fetch ─────────────────────────────────────────────────────────────────
   useEffect(() => { fetchBiens(); }, [institutionId, debouncedSearch]);

const fetchBiens = async () => {
    setLoading(true);
    try {
        let url = "";

        if (debouncedSearch) {
            // ── Recherche active : route /search, avec le bon filtre selon le rôle ──
            const params = new URLSearchParams();
            params.set('q', debouncedSearch);

            if (user.institution_id != null) {
                params.set('institution_id', user.institution_id);
            } else if (user?.role === "artiste" && !institutionId) {
                params.set('artiste_id', user?.artiste_profile?.id);
            } else if (institutionId) {
                params.set('institution_id', institutionId);
            }

            url = `${apiUrl}${biensEndpoint}/api/biens/search?${params.toString()}`;

        } else if (user.institution_id != null) {
            url = `${apiUrl}${biensEndpoint}/api/biens?institution_id=${user.institution_id}`;

        } else if (user?.role === "artiste" && !institutionId) {
            url = `${apiUrl}${biensEndpoint}/api/oeuvres?artiste_id=${user?.artiste_profile?.id}`;

        } else {
            url = institutionId
                ? `${apiUrl}${biensEndpoint}/api/biens?institution_id=${institutionId}`
                : `${apiUrl}${biensEndpoint}/api/biens`;
        }

        console.log("url " + url);
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Erreur de chargement');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        console.log('[BiensCulturels] types reçus:', [...new Set(list.map(b => b.resourcetype || b.type || '(vide)'))]);
        setBiens(list);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
};

    // ── Fermer dropdowns au clic extérieur ────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
            if (addRef.current && !addRef.current.contains(e.target)) setAddOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Filtrage ──────────────────────────────────────────────────────────────
    const getType = (b) => {
        // Django polymorphic peut retourner le type dans différents champs
        const raw = b.resourcetype || b.type || b.polymorphic_ctype_name || '';
        const val = raw.toLowerCase().trim();
        // Normalise les variantes possibles
        if (val.includes('oeuvre')) return 'oeuvre';
        if (val.includes('portrait')) return 'portrait';
        if (val.includes('document')) return 'document';
        return val || 'oeuvre';
    };

    const filtered = biens.filter(b => {
        const typeOk = typeFilter === 'all' || getType(b) === typeFilter;
        const q = search.toLowerCase();
        const textOk = !q ||
            b.titre?.toLowerCase().includes(q) ||
            b.auteur?.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q);
        return typeOk && textOk;
    });

    const countByType = (t) => t === 'all' ? biens.length : biens.filter(b => getType(b) === t).length;

    const handleSuccess = () => {
        setModalAdd(null); setModalEdit(null); setModalDelete(null);
        fetchBiens();
    };

    // ── Render carte selon type ───────────────────────────────────────────────
    const renderCard = (bien) => {
        const type = getType(bien);
        const props = {
            bien,
            type,
            onView: setModalDetails,
            onEdit: canEdit ? (b) => setModalEdit(b) : null,
            onDelete: canEdit ? setModalDelete : null,
        };
        return <BienCard key={bien.id} {...props} />;
    };

    const activeFilterLabel = FILTER_OPTIONS.find(o => o.value === typeFilter)?.label || 'Filtrer';

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

                .bc-container {
                    position: relative;
                    z-index: 1;
                }
                .bc-header { z-index: 10; position: relative; }

                .bc-page {
                    position: relative;
                    --primary: #000;
                    --danger: #ef4444;
                    --success: #10b981;
                    min-height: 100vh;
                    background: #ffffff;
                    padding: 40px 24px;
                    font-family: 'Cormorant Garamond', Georgia, serif;
                }

                /* ── HEADER ── */
                .bc-header {
                    max-width: 1400px;
                    margin: 0 auto 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .bc-title-row { display: flex; align-items: center; gap: 12px; }
                .bc-title { font-size: 32px; font-weight: 800; color: #000; margin: 0; letter-spacing: -0.5px; }
                .bc-count { background: #000; color: #fff; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
                .btn-retour {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: none; border: 1.5px solid #e0e0e0; border-radius: 10px;
                    padding: 8px 14px; font-size: 13px; font-weight: 500;
                    color: #444; cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .btn-retour:hover { border-color: #000; color: #000; }

                /* ── CONTROLS ── */
                .bc-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
                .bc-search {
                    display: flex; align-items: center; gap: 8px;
                    background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 12px;
                    padding: 10px 14px;
                }
                .bc-search input { border: none; background: transparent; outline: none; font-size: 14px; color: #000; width: 200px; }
                .bc-search input::placeholder { color: #9ca3af; }

                /* ── DROPDOWN ── */
                .bc-dd-wrap { position: relative; z-index: 200; }
                .bc-dd-btn {
                    display: flex; align-items: center; gap: 8px;
                    border: 1px solid #e5e7eb; border-radius: 12px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    background: #f8f9fa; color: #374151;
                }
                .bc-dd-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
                .bc-dd-btn.active { background: #000; color: #fff; border-color: #000; }
                .bc-btn-add {
                    display: flex; align-items: center; gap: 8px;
                    background: #000; color: #fff; border: none;
                    padding: 12px 22px; border-radius: 14px;
                    font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
                }
                .bc-btn-add:hover { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.22); }
                .bc-dd-menu {
                    position: absolute; left: 0; top: calc(100% + 8px);
                    background: #fff; border: 1px solid #e5e7eb;
                    border-radius: 14px; padding: 6px; min-width: 200px;
                    min-height: 48px;
                    z-index: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                    animation: bcFadeIn 0.15s ease;
                }
                .bc-dd-menu.right { left: auto; right: 0; }
                @keyframes bcFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
                .bc-dd-sep { height: 1px; background: #f3f4f6; margin: 4px 0; }
                .bc-dd-item {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 10px 12px; border-radius: 10px; cursor: pointer;
                    font-size: 13px; color: #374151; transition: background 0.15s;
                }
                .bc-dd-item:hover { background: #f9fafb; }
                .bc-dd-item.selected { background: #f3f4f6; font-weight: 600; color: #000; }
                .bc-dd-item-left { display: flex; align-items: center; gap: 9px; }
                .bc-dd-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .bc-dd-item-sub { font-size: 11px; color: #9ca3af; margin-top: 1px; }
                .bc-dd-chk {
                    width: 16px; height: 16px; border-radius: 5px;
                    border: 1.5px solid #d1d5db; display: flex;
                    align-items: center; justify-content: center; flex-shrink: 0;
                }
                .bc-dd-chk.on { background: #000; border-color: #000; }
                .bc-dd-cnt { font-size: 11px; color: #9ca3af; background: #f3f4f6; padding: 2px 7px; border-radius: 20px; }
                .bc-dd-reset { text-align: center; padding: 8px; font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 8px; }
                .bc-dd-reset:hover { background: #f9fafb; }

                /* ── GRID ── */
                .bc-grid {
                    max-width: 1400px; margin: 0 auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 25px;
                    align-items: flex-start;
                    position: relative; z-index: 1;
                }

                /* ── VCARD (carte photo plein fond) ── */
                .bc-vcard {
                    position: relative; border-radius: 14px; overflow: hidden;
                    width: calc(30% - 7px);
                    flex-shrink: 0;
                    height: 320px;
                    cursor: pointer;
                    transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @media (max-width: 1100px) { .bc-vcard { width: calc(50% - 6px); } }
                @media (max-width: 750px)  { .bc-vcard { width: 100%; } }

                .bc-vcard:hover .bc-vcard-bg { transform: none; }
                .bc-vcard-bg {
                    position: absolute; inset: 0;
                    background-size: cover; background-position: center;
                    transition: transform 0.4s ease;
                }
                .bc-vcard-overlay {
                    position: absolute; inset: 0; z-index: 1;
                    background: rgba(0,0,0,0.15);
                }
                .bc-vcard-blur {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 60%; z-index: 2;
                    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%);
                }
                .bc-vcard-content {
                    position: absolute; inset: 0; z-index: 3;
                    display: flex; flex-direction: column; justify-content: space-between;
                    padding: 12px;
                }
                .bc-vcard-top { display: flex; justify-content: flex-start; }
                .bc-vcard-badge {
                    font-size: 10px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.6px; padding: 3px 10px; border-radius: 20px;
                    backdrop-filter: blur(8px);
                }
                .bc-vcard-badge-oeuvre   { background: rgba(124,58,237,0.75); color: #fff; }
                .bc-vcard-badge-portrait { background: rgba(3,105,161,0.75);  color: #fff; }
                .bc-vcard-badge-document { background: rgba(146,64,14,0.75);  color: #fff; }
                .bc-vcard-bottom { display: flex; flex-direction: column; gap: 3px; }
                .bc-vcard-title {
                    font-size: 18px; font-weight: 800; color: #fff; margin: 0;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                    text-shadow: 0 1px 6px rgba(0,0,0,0.5);
                }
                .bc-vcard-sub  { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.75); margin: 0; }
                .bc-vcard-tech { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); font-style: italic; margin: 0; }
                .bc-vcard-actions {
                    display: flex; gap: 5px; margin-top: 8px;
                    opacity: 0;
                    transform: translateY(6px);
                    transition: opacity 0.2s ease, transform 0.2s ease;
                }
                .bc-vcard:hover .bc-vcard-actions {
                    opacity: 1;
                    transform: translateY(0);
                }
                .bc-vcard-btn {
                    width: 30px; height: 30px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.2); color: #fff;
                    backdrop-filter: blur(8px); cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .bc-vcard-btn:hover { background: rgba(255,255,255,0.35); }
                .bc-vcard-btn-danger { background: rgba(239,68,68,0.35); }
                .bc-vcard-btn-danger:hover { background: rgba(239,68,68,0.55); }

                /* ── EMPTY / LOADING ── */
                .bc-empty { text-align: center; padding: 80px 20px; color: #9ca3af; grid-column: 1 / -1; }
                .bc-empty h3 { font-size: 20px; color: #000; margin: 0 0 8px; }
                .bc-loading { text-align: center; padding: 100px; }
                .bc-spinner {
                    width: 44px; height: 44px; border: 3px solid #e5e7eb; border-top-color: #000;
                    border-radius: 50%; animation: bcSpin 0.9s linear infinite; margin: 0 auto 20px;
                }
                @keyframes bcSpin { to { transform: rotate(360deg); } }

                /* ── MODALS ── */
                .bc-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
                    backdrop-filter: blur(6px); display: flex;
                    align-items: center; justify-content: center;
                    z-index: 1000; padding: 20px;
                    animation: bcFadeIn 0.2s ease;
                }
                .bc-modal {
                    background: #fff; border-radius: 24px; width: 100%; max-width: 600px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.25);
                    animation: bcSlideUp 0.25s ease;
                }
                .bc-modal-sm   { max-width: 440px; }
                .bc-modal-wide { max-width: 860px; }
                @keyframes bcSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: none; }
                }
                .bc-modal-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 22px 26px; border-bottom: 1px solid #f0f0f0;
                }
                .bc-modal-title { font-size: 18px; font-weight: 800; color: #000; margin: 0; }
                .bc-modal-close {
                    background: #f3f4f6; border: none; border-radius: 10px;
                    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
                    color: #6b7280; cursor: pointer; transition: all 0.2s;
                }
                .bc-modal-close:hover { background: #fee2e2; color: #ef4444; }
                .bc-modal-body { padding: 24px 26px; }
                .bc-modal-footer {
                    display: flex; gap: 10px; padding: 18px 26px;
                    border-top: 1px solid #f0f0f0;
                }
                .bc-modal-form { display: flex; flex-direction: column; gap: 16px; }
                .bc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .bc-form-group { display: flex; flex-direction: column; gap: 6px; }
                .bc-form-label { font-size: 13px; font-weight: 600; color: #374151; }
                .bc-form-input, .bc-form-textarea, .bc-form-select {
                    background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;
                    padding: 12px 14px; color: #000; font-size: 14px; transition: all 0.2s;
                    width: 100%; box-sizing: border-box; font-family: inherit;
                }
                .bc-form-input:focus, .bc-form-textarea:focus {
                    outline: none; border-color: #000; box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
                }
                .bc-form-input::placeholder, .bc-form-textarea::placeholder { color: #9ca3af; }
                .bc-form-textarea { resize: vertical; min-height: 80px; }
                .bc-file-area {
                    border: 2px dashed #e5e7eb; border-radius: 12px;
                    padding: 18px; text-align: center; cursor: pointer;
                    transition: all 0.2s; position: relative;
                }
                .bc-file-area:hover { border-color: #000; background: #f9fafb; }
                .bc-file-area.has-file { border-color: #10b981; background: #ecfdf5; }
                .bc-file-area p { color: #9ca3af; font-size: 13px; margin: 6px 0 0; }
                .bc-file-area .has-name { color: #10b981; font-weight: 600; }
                .bc-file-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
                .bc-btn-cancel {
                    flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600;
                    border: 1px solid #e5e7eb; background: #f3f4f6; color: #374151; cursor: pointer;
                    transition: background 0.15s;
                }
                .bc-btn-cancel:hover { background: #e5e7eb; }
                .bc-btn-confirm {
                    flex: 1; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 600;
                    border: none; background: #000; color: #fff; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: background 0.15s; box-shadow: 0 4px 14px rgba(0,0,0,0.18);
                }
                .bc-btn-confirm:hover { background: #1a1a1a; }
                .bc-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
                .bc-btn-danger-confirm { background: #ef4444; box-shadow: 0 4px 14px rgba(239,68,68,0.35); }
                .bc-btn-danger-confirm:hover { background: #dc2626; }
                .bc-delete-msg { text-align: center; padding: 16px 0; }
                .bc-delete-msg p { font-size: 15px; color: #374151; margin: 0 0 8px; }
                .bc-delete-msg strong { color: #000; }
                .bc-delete-warn { color: #ef4444; font-size: 13px; }
                .bc-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .bc-details-section { background: #f9fafb; border-radius: 14px; padding: 18px; }
                .bc-details-section-title { font-size: 14px; font-weight: 700; color: #000; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
                .bc-detail-row { display: flex; flex-direction: column; gap: 3px; margin-bottom: 12px; }
                .bc-detail-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
                .bc-detail-value { font-size: 14px; color: #000; }
                .bc-detail-img { width: 100%; border-radius: 10px; border: 1px solid #e5e7eb; display: block; }
                .bc-detail-img-placeholder { width: 100%; height: 160px; border-radius: 10px; border: 1px dashed #e5e7eb; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 13px; }

                /* ── STEPS ── */
                .bc-steps { display: flex; align-items: center; gap: 8px; }
                .bc-step { display: flex; align-items: center; gap: 6px; }
                .bc-step-dot {
                    width: 24px; height: 24px; border-radius: 50%;
                    background: #e5e7eb; color: #9ca3af;
                    font-size: 12px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .bc-step.done .bc-step-dot { background: #000; color: #fff; }
                .bc-step-label { font-size: 13px; font-weight: 600; color: #9ca3af; }
                .bc-step.done .bc-step-label { color: #000; }
                .bc-step-line { width: 32px; height: 1px; background: #e5e7eb; }
                .bc-step-intro { font-size: 14px; color: #6b7280; margin: 0 0 16px; }

                /* ── ARTISTE SELECTOR ── */
                .bc-as-wrap { display: flex; flex-direction: column; gap: 14px; }
                .bc-as-search {
                    display: flex; align-items: center; gap: 8px;
                    background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;
                    padding: 11px 14px;
                }
                .bc-as-search-input { border: none; background: transparent; outline: none; font-size: 14px; color: #000; flex: 1; }
                .bc-as-search-input::placeholder { color: #9ca3af; }

                /* Avertissement */
                .bc-as-warning {
                    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
                    background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
                    padding: 10px 14px; font-size: 13px; color: #92400e;
                }
                .bc-as-add-btn {
                    display: flex; align-items: center; gap: 5px;
                    background: #000; color: #fff; border: none;
                    padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .bc-as-add-btn:hover { background: #1a1a1a; transform: translateY(-1px); }

                /* Grid cartes */
                .bc-as-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
                    max-height: 400px; overflow-y: auto; padding-right: 4px;
                }
                .bc-as-grid::-webkit-scrollbar { width: 4px; }
                .bc-as-grid::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

                /* Carte artiste */
                .bc-as-card {
                    border-radius: 12px; overflow: hidden; position: relative;
                    aspect-ratio: 2/3; cursor: pointer;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .bc-as-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,0.2); }
                .bc-as-card:hover .bc-as-card-select-btn { background: rgba(255,255,255,0.95); }
                .bc-as-card-bg {
                    position: absolute; inset: 0; background-size: cover; background-position: center;
                    transition: transform 0.4s ease;
                }
                .bc-as-card:hover .bc-as-card-bg { transform: scale(1.05); }
                .bc-as-card-overlay {
                    position: absolute; inset: 0; z-index: 1; background: rgba(0,0,0,0.18);
                }
                .bc-as-card-blur {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 55%; z-index: 2;
                    background: linear-gradient(to top, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 100%);
                    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                    -webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
                    mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
                }
                .bc-as-card-content {
                    position: absolute; inset: 0; z-index: 3;
                    display: flex; flex-direction: column; justify-content: space-between; padding: 10px;
                }
                .bc-as-card-top { display: flex; justify-content: flex-end; }
                .bc-as-badge {
                    font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px;
                    white-space: nowrap;
                }
                .bc-as-badge.active   { background: rgba(16,185,129,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
                .bc-as-badge.inactive { background: rgba(239,68,68,0.3);  color: #fff; border: 1px solid rgba(255,255,255,0.3); }
                .bc-as-card-bottom { display: flex; flex-direction: column; gap: 4px; }
                .bc-as-card-name {
                    font-size: 12px; font-weight: 700; color: #111; margin: 0;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .bc-as-card-sub {
                    font-size: 10px; color: #64748b; margin: 0;
                    display: flex; align-items: center; gap: 3px;
                }
                .bc-as-card-select-btn {
                    width: 100%; padding: 6px; border-radius: 40px; font-size: 11px; font-weight: 600;
                    cursor: pointer; border: none; background: rgba(255,255,255,0.72); color: #111;
                    backdrop-filter: blur(14px); box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.2s; margin-top: 2px;
                }

                /* Loading / empty */
                .bc-as-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 10px; color: #9ca3af; font-size: 13px; }
                .bc-as-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: #9ca3af; font-size: 13px; }
                .bc-spinner-sm { width: 28px !important; height: 28px !important; border-width: 2px !important; }

                /* ── TYPE DATE ── */
                .bc-type-date-wrap { display: flex; gap: 8px; }
                .bc-type-date-btn {
                    flex: 1; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600;
                    border: 1px solid #e5e7eb; background: #f9fafb; color: #374151;
                    cursor: pointer; transition: all 0.15s;
                }
                .bc-type-date-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
                .bc-type-date-btn.selected { background: #000; color: #fff; border-color: #000; }

                /* ── DATE PICKER ── */
                .bc-date-input { cursor: pointer; }
                .bc-date-input::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    opacity: 0.6;
                    filter: invert(0);
                    transition: opacity 0.15s;
                }
                .bc-date-input::-webkit-calendar-picker-indicator:hover { opacity: 1; }

                /* ── VALIDATION ERRORS ── */
                .bc-input-error { border-color: #ef4444 !important; background: #fff5f5 !important; }
                .bc-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }
                .bc-field-error { font-size: 11px; color: #ef4444; font-weight: 500; margin-top: 2px; }
                .bc-field-error-block { display: block; margin-bottom: 4px; }
                .bc-optional { font-size: 11px; font-weight: 400; color: #9ca3af; margin-left: 4px; }
                .bc-required { color: #ef4444; font-weight: 700; margin-left: 2px; }

                /* ── SIÈCLE PREVIEW ── */
                .bc-siecle-preview {
                    margin-left: 8px; font-size: 12px; font-weight: 700;
                    background: #000; color: #fff;
                    padding: 2px 8px; border-radius: 20px;
                    font-family: serif; letter-spacing: 0.5px;
                }

                /* ── CATÉGORIES TRIGGER ── */
                .bc-cats-trigger {
                    display: flex; align-items: center; justify-content: space-between;
                    width: 100%; padding: 11px 14px; border-radius: 10px;
                    border: 1px solid #e5e7eb; background: #f9fafb;
                    cursor: pointer; transition: all 0.15s; text-align: left;
                }
                .bc-cats-trigger:hover { border-color: #000; background: #f3f4f6; }
                .bc-cats-trigger-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
                .bc-cats-trigger-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; color: #9ca3af; }
                .bc-cats-placeholder { font-size: 14px; color: #9ca3af; }
                .bc-cats-pills-preview { display: flex; flex-wrap: wrap; gap: 5px; }
                .bc-cat-pill-mini {
                    font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px;
                    background: #000; color: #fff;
                }
                .bc-cats-count {
                    font-size: 11px; font-weight: 700; background: #000; color: #fff;
                    padding: 2px 8px; border-radius: 20px;
                }

                /* ── CATÉGORIES PANEL (step 3) ── */
                .bc-cats-search-bar {
                    display: flex; align-items: center; gap: 8px;
                    background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;
                    padding: 11px 14px; margin-bottom: 12px;
                }
                .bc-cats-search-input { border: none; background: transparent; outline: none; font-size: 14px; color: #000; flex: 1; }
                .bc-cats-search-input::placeholder { color: #9ca3af; }
                .bc-cats-search-clear { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; padding: 0; }
                .bc-cats-list { display: flex; flex-direction: column; gap: 4px; max-height: 400px; overflow-y: auto; }
                .bc-cats-list::-webkit-scrollbar { width: 4px; }
                .bc-cats-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .bc-cats-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 14px; border-radius: 12px; cursor: pointer;
                    border: 1px solid transparent; transition: all 0.15s;
                }
                .bc-cats-row:hover { background: #f9fafb; border-color: #e5e7eb; }
                .bc-cats-row.selected { background: #f9fafb; border-color: #000; }
                .bc-cats-row-left { display: flex; align-items: center; gap: 12px; }
                .bc-cats-chk {
                    width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
                    border: 1.5px solid #d1d5db; display: flex; align-items: center; justify-content: center;
                    transition: all 0.15s;
                }
                .bc-cats-chk.on { background: #000; border-color: #000; }
                .bc-cats-row-name { font-size: 14px; font-weight: 500; color: #000; }
                .bc-cats-row-desc { font-size: 12px; color: #9ca3af; margin-top: 1px; }
                .bc-cats-row-badge {
                    font-size: 11px; font-weight: 600; color: #000;
                    background: #f3f4f6; padding: 3px 10px; border-radius: 20px; border: 1px solid #e5e7eb;
                }
                .bc-cats-empty { text-align: center; padding: 40px; color: #9ca3af; font-size: 14px; }

                /* Bouton retour */
                .bc-back-btn {
                    width: 32px; height: 32px; border-radius: 9px;
                    border: 1px solid #e5e7eb; background: #f9fafb;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #374151; transition: all 0.15s; flex-shrink: 0;
                }
                .bc-back-btn:hover { background: #f3f4f6; border-color: #d1d5db; }

                /* ── STEP 2 LAYOUT (sidebar artiste + formulaire) ── */
                .bc-step2-layout {
                    display: flex; gap: 20px; align-items: flex-start;
                }
                .bc-step2-sidebar {
                    width: 160px; flex-shrink: 0;
                }
                .bc-step2-artiste-card {
                    border-radius: 16px; overflow: hidden; position: relative;
                    aspect-ratio: 2/3; width: 100%;
                }
                .bc-step2-artiste-bg {
                    position: absolute; inset: 0; background-size: cover; background-position: center;
                }
                .bc-step2-artiste-overlay {
                    position: absolute; inset: 0; z-index: 1; background: rgba(0,0,0,0.18);
                }
                .bc-step2-artiste-blur {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 55%; z-index: 2;
                    background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 100%);
                    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                    -webkit-mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
                    mask-image: linear-gradient(to top, black 0%, black 40%, transparent 100%);
                }
                .bc-step2-artiste-content {
                    position: absolute; inset: 0; z-index: 3;
                    display: flex; flex-direction: column; justify-content: space-between;
                    padding: 10px;
                }
                .bc-step2-artiste-name {
                    font-size: 12px; font-weight: 700; color: #111; margin: 0 0 3px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .bc-step2-artiste-pays {
                    font-size: 10px; color: #64748b; margin: 0 0 8px;
                    display: flex; align-items: center; gap: 3px;
                }
                .bc-step2-change-btn {
                    width: 100%; padding: 6px 4px; border-radius: 40px; font-size: 10px; font-weight: 600;
                    cursor: pointer; border: none; background: rgba(255,255,255,0.75); color: #111;
                    backdrop-filter: blur(14px); transition: all 0.2s; text-align: center;
                }
                .bc-step2-change-btn:hover { background: rgba(255,255,255,0.95); }
                .bc-step2-layout .bc-modal-form { flex: 1; min-width: 0; }
                .bc-step2-artiste-empty {
                    width: 100%; aspect-ratio: 2/3; border-radius: 16px;
                    border: 2px dashed #e5e7eb; background: #f9fafb;
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; gap: 8px; cursor: pointer;
                    transition: all 0.2s; color: #9ca3af; font-size: 12px; font-weight: 500;
                }
                .bc-step2-artiste-empty:hover { border-color: #000; background: #f3f4f6; color: #374151; }
                .bc-artiste-selected {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
                    padding: 12px 14px;
                }
                .bc-artiste-selected-left { display: flex; align-items: center; gap: 10px; }
                .bc-artiste-selected-name { font-size: 14px; font-weight: 700; color: #000; }
                .bc-artiste-selected-label { font-size: 11px; color: #10b981; font-weight: 500; margin-top: 1px; }
                .bc-artiste-change {
                    font-size: 12px; font-weight: 600; color: #374151;
                    background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
                    padding: 5px 12px; cursor: pointer; transition: all 0.15s;
                }
                .bc-artiste-change:hover { background: #f3f4f6; }

                @media (max-width: 600px) {
                    .bc-form-row { grid-template-columns: 1fr; }
                    .bc-details-grid { grid-template-columns: 1fr; }
                    .bc-header { flex-direction: column; align-items: flex-start; }
                }
            `}</style>

            <div className="bc-page" ref={pageRef}>

                {/* ═══ FOND ORNEMENTS ANIMÉ ═══ */}
                <OrnementBackground containerRef={pageRef} opacity={0.15} duration={8} />

                {/* ═══ HEADER ═══ */}
                <div className="bc-header">
                    <div className="bc-title-row">
                        <div>
                            {/* Bouton retour */}
                            {onRetour && (
                                <button className="btn-retour" style={{ marginBottom: '0.5rem' }} onClick={onRetour}>
                                    <ArrowLeftIcon /> Retour aux institutions
                                </button>
                            )}
                            <h1 className="bc-title">{propInstitutionNom ? propInstitutionNom : 'Biens culturels'}</h1>
                        </div>
                        <span className="bc-count">{filtered.length}</span>
                    </div>

                    <div className="bc-controls">
                        {/* Recherche */}
                        <div className="bc-search">
                            <SearchIcon />
                            <input
                                placeholder="Rechercher…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Dropdown Filtrer */}
                        <div className="bc-dd-wrap" ref={filterRef}>
                            <button
                                className={`bc-dd-btn ${typeFilter !== 'all' ? 'active' : ''}`}
                                onClick={() => { setFilterOpen(o => !o); setAddOpen(false); }}
                            >
                                <FilterIcon />
                                {typeFilter === 'all' ? 'Filtrer' : FILTER_OPTIONS.find(o => o.value === typeFilter)?.label}
                                <ChevronIcon />
                            </button>
                            {filterOpen && (
                                <div className="bc-dd-menu">
                                    {FILTER_OPTIONS.map(opt => (
                                        <div
                                            key={opt.value}
                                            className={`bc-dd-item ${typeFilter === opt.value ? 'selected' : ''}`}
                                            onMouseDown={(e) => { e.preventDefault(); setTypeFilter(opt.value); setFilterOpen(false); }}
                                        >
                                            <div className="bc-dd-item-left">
                                                <span className="bc-dd-dot" style={{ background: opt.dot }} />
                                                {opt.label}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span className="bc-dd-cnt">{countByType(opt.value)}</span>
                                                <div className={`bc-dd-chk ${typeFilter === opt.value ? 'on' : ''}`}>
                                                    {typeFilter === opt.value && <CheckIcon />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {typeFilter !== 'all' && (
                                        <>
                                            <div className="bc-dd-sep" />
                                            <div className="bc-dd-reset" onMouseDown={(e) => { e.preventDefault(); setTypeFilter('all'); setFilterOpen(false); }}>
                                                Réinitialiser
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dropdown Ajouter — visible seulement pour admin_institution et conservateur */}
                        {canEdit && (
                            <div className="bc-dd-wrap" ref={addRef}>
                                <button
                                    className="bc-btn-add"
                                    onClick={() => { setAddOpen(o => !o); setFilterOpen(false); }}
                                >
                                    <PlusIcon />
                                    Ajouter
                                    <ChevronIcon />
                                </button>
                                {addOpen && (
                                    <div className="bc-dd-menu right">
                                        {ADD_OPTIONS.map(opt => (
                                            <div
                                                key={opt.value}
                                                className="bc-dd-item"
                                                onMouseDown={(e) => { e.preventDefault(); setModalAdd(opt.value); setAddOpen(false); }}
                                            >
                                                <div className="bc-dd-item-left">
                                                    <span className="bc-dd-dot" style={{ background: opt.dot }} />
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{opt.label}</div>
                                                        <div className="bc-dd-item-sub">{opt.sub}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ GRID ═══ */}
                {loading ? (
                    <div className="bc-loading">
                        <div className="bc-spinner" />
                        <p style={{ color: '#9ca3af' }}>Chargement des biens…</p>
                    </div>
                ) : error ? (
                    <div className="bc-empty"><h3>Erreur</h3><p>{error}</p></div>
                ) : filtered.length === 0 ? (
                    <div className="bc-empty">
                        <h3>Aucun bien trouvé</h3>
                        <p>{search || typeFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Ajoutez votre premier bien culturel.'}</p>
                    </div>
                ) : (
                    <div className="bc-grid" ref={gridRef}>
                        {filtered.map(renderCard)}
                    </div>
                )}


            </div>

            {/* ═══ MODALS ═══ */}
            {modalAdd && (
                <ModalForm
                    type={modalAdd}
                    bien={null}
                    institutionId={institutionId}
                    onClose={() => setModalAdd(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modalEdit && (
                <ModalForm
                    type={getType(modalEdit) || 'oeuvre'}
                    bien={modalEdit}
                    institutionId={institutionId}
                    onClose={() => setModalEdit(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modalDelete && (
                <ModalDelete
                    bien={modalDelete}
                    onClose={() => setModalDelete(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modalDetails && (
                <ModalDetails
                    bien={modalDetails}
                    onClose={() => setModalDetails(null)}
                    onEdit={(b) => { setModalDetails(null); setModalEdit(b); }}
                />
            )}
        </>
    );
}