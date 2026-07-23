import React, { useState, useEffect, useRef } from 'react';
// adapte le chemin
import { useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import { useSalle } from '../context/SalleContext';
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { m } from 'framer-motion';
import OrnementBackground from '../OrnementBackground';
import ExpoCarousel from '../ExpoCarousel';
import "../../styles/expo.css"
import axios from 'axios';

// ── Images locales des expositions (glob Vite) ───────────────────────────────
const _allExpoImages = import.meta.glob(
    '../../assets/images_expositions/*.{jpg,jpeg,png,webp}',
    { eager: true }
);

// Construit un objet { "image_femme": { url, filename } }
const allExpoImagesMap = Object.fromEntries(
    Object.entries(_allExpoImages).map(([path, mod]) => {
        const filename = path.split('/').pop();
        const key = filename.replace(/\.[^.]+$/, '');
        return [key, { url: mod.default, filename }];
    })
);

// URL seules pour l'affichage : { "image_femme": url }
const allExpoImages = Object.fromEntries(
    Object.entries(allExpoImagesMap).map(([key, { url }]) => [key, url])
);

// Retourne { url, filename } depuis une URL d'image locale
const getLocalImageMeta = (url) => {
    const entry = Object.values(allExpoImagesMap).find(e => e.url === url);
    return entry || null;
};

// Retourne toutes les images dont le nom commence par "image_<theme>"
const getImagesForTheme = (themeName) => {
    const prefix = `image_${themeName.toLowerCase()}`;
    return Object.entries(allExpoImages)
        .filter(([key]) => key === prefix || key.startsWith(prefix + '_'))
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([, url]) => url);
};

// Choix de type d'exposition (miroir du modèle Django)
const TYPE_EXPOSITION_CHOICES = [
    { value: 'artistique', label: 'Artistique' },
    { value: 'historique', label: 'Historique' },
    { value: 'scientifique', label: 'Scientifique' },
];

// Choix de statut d'exposition (miroir du modèle Django)
const STATUS_EXPOSITION_CHOICES = [
    { value: 'en_modification', label: 'En modification' },
    { value: 'publiee', label: 'Publiée' },
    { value: 'archivee', label: 'Archivée' },
];

const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const expoEndpoint = import.meta.env.VITE_EXPO_ENDPOINT;
export const BASE_URL = `${apiUrl}${expoEndpoint}`;

// Retourne l'image à utiliser pour une exposition (première image du premier thème trouvé)
const getExpoImage = (expo) => {
    if (expo?.image) return `${expo.image}`;
    for (const t of (expo?.themes || [])) {
        const imgs = getImagesForTheme(t?.nom || '');
        if (imgs.length > 0) return imgs[0];
    }
    return null;
};

// Retourne l'image à utiliser pour une salle (image de son exposition parente)
const getSalleImage = (salle, parentExpo = null) => {
    return getExpoImage(parentExpo || salle?.exposition || salle);
};

// ── Icons ────────────────────────────────────────────────────────────────────
const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);
const BoxIcon = ({ size = 14, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" width={size} height={size}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);
const UploadIcon = ({ size = 16 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);
const RoomIcon = ({ size = 12 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const GridIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Expositions({ isVisitePage: isVisitePage = false, titreExpo: titreExpo = null, expositionUrl: expositionUrl = null, institutionId: propInstitutionId = null, institutionNom: propInstitutionNom = '', onRetour = null }) {
    const navigate = useNavigate();
    const location = useLocation();
    const outletContext = useOutletContext();
    const searchTerm = outletContext?.searchTerm ?? '';
    // ── Mode institution : via props (drawer) OU via navigate state (route)
    const institutionId = propInstitutionId ?? location.state?.institutionId ?? null;
    const institutionNom = propInstitutionNom || location.state?.institutionNom || '';
    const institutionMode = institutionId != null;
    const authContext = useContext(AuthContext);
    const user = authContext?.user ?? null;
    const loadingUser = authContext?.loadingUser ?? false;

    // Mode visite public
    // const isVisitePage = location.pathname === '/visites/expositions';

    // ── Rôles & permissions ───────────────────────────────────────────────────
    const canEdit = user?.role === 'administrateur' || ((user?.role === 'admin_institution' || user?.role === 'conservateur' || user?.role === 'curateur'));

    // institution_id effectif pour le fetch :
    // - toujours institutionId si fourni (prop ou state) → visites publiques incluses
    // - sinon pour les rôles institution → user.institution_id
    // - sinon null → tous les expositions
    const effectiveInstitutionId = institutionId
        ?? (['admin_institution', 'conservateur', 'curateur'].includes(user?.role) ? user?.institution_id : null);
    const [expositions, setExpositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // carousel states
    const [expoIndex, setExpoIndex] = useState(0);
    const [salleIndex, setSalleIndex] = useState(0);

    // ── Filtre par statut ────────────────────────────────────────────────────
    const [statusFilter, setStatusFilter] = useState('toutes'); // 'toutes' | 'en_modification' | 'publiee' | 'archivee'
    const [statusFilterOpen, setStatusFilterOpen] = useState(false);
    const statusFilterRef = useRef(null);

    // Ferme le dropdown de filtre au clic extérieur
    useEffect(() => {
        if (!statusFilterOpen) return;
        const handleClickOutside = (e) => {
            if (statusFilterRef.current && !statusFilterRef.current.contains(e.target)) {
                setStatusFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [statusFilterOpen]);

    // view: 'expositions' | 'salles'
    const [view, setView] = useState('expositions');
    const [activeExpo, setActiveExpo] = useState(null); // expo whose salles we show
    const [transitioning, setTransitioning] = useState(false);
    const [zoomAnim, setZoomAnim] = useState(null);

    // modals
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedExpo, setSelectedExpo] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ nom: '', description: '', user_id: user?.id, theme_ids: [], type_exposition: '', institution_id: effectiveInstitutionId, artiste_id: null });
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

    // ── Upload image pour nouvelle exposition ──────────────────────────────────
    const [uploadedImage, setUploadedImage] = useState(null); // { file, previewUrl }
    const fileInputRef = useRef(null);
    const pageRef = useRef(null);

    // ── Thèmes ─────────────────────────────────────────────────────────────────
    const [themes, setThemes] = useState([]);
    const [themesLoading, setThemesLoading] = useState(false);
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

    // Convertit une URL d'image (asset Vite) en File via canvas
    const urlToFile = (url, filename) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('toBlob failed'));
                resolve(new File([blob], filename, { type: blob.type || 'image/jpeg' }));
            }, 'image/jpeg', 0.92);
        };
        img.onerror = reject;
        img.src = url;
    });

    // Retourne l'image du premier thème sélectionné (si pas d'image uploadée)
    // Images disponibles pour les thèmes sélectionnés : { themeId: [url, ...] }
    const themeImagesMap = React.useMemo(() => {
        const map = {};
        for (const tid of (formData.theme_ids || [])) {
            const t = themes.find(th => String(th.id) === String(tid));
            if (t) map[tid] = getImagesForTheme(t.nom);
        }
        return map;
    }, [formData.theme_ids, themes]);

    // Image sélectionnée manuellement par thème : { themeId: url }
    const [selectedThemeImages, setSelectedThemeImages] = useState({});
    // Picker ouvert pour quel themeId (null = fermé, 'main' = galerie principale)
    const [imagePickerOpenFor, setImagePickerOpenFor] = useState(null);
    // Image sélectionnée depuis la galerie principale (colonne gauche)
    const [selectedLocalImage, setSelectedLocalImage] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const previewImage = React.useMemo(() => {
        if (uploadedImage?.previewUrl) return uploadedImage.previewUrl;
        if (selectedLocalImage) return selectedLocalImage;
        for (const tid of (formData.theme_ids || [])) {
            const chosen = selectedThemeImages[tid];
            if (chosen) return chosen;
            const themeImgs = themeImagesMap[tid] || [];
            if (themeImgs.length > 0) return themeImgs[0];
        }
        return null;
    }, [uploadedImage, selectedLocalImage, formData.theme_ids, selectedThemeImages, themeImagesMap]);

    // ── Salles modal states ───────────────────────────────────────────────────
    const [showSalleModal, setShowSalleModal] = useState(false);
    const [salleModalType, setSalleModalType] = useState('');
    const [selectedSalle, setSelectedSalle] = useState(null);
    const [showAddSalleModal, setShowAddSalleModal] = useState(false);
    const [salleFormData, setSalleFormData] = useState({ nom: '', description: '', modele_salle: null });
    const [salleLoading, setSalleLoading] = useState(false);
    const [expoIdForNewSalle, setExpoIdForNewSalle] = useState(null); // id capturé de façon synchrone
    const { salleId, setSalleId, expositionId, setExpositionId, updateContext } = useSalle();

    // ── Modèles de salle states ─────────────────────────────────────────────────
    const [modelesSalle, setModelesSalle] = useState([]);
    const [modelesSalleLoading, setModelesSalleLoading] = useState(false);
    const [selectedModeleSalle, setSelectedModeleSalle] = useState(null);
    const MODELE_SALLE_API = `${BASE_URL}/api/modeles_salle`;
    const EXPO_API = `${BASE_URL}/api/expositions`;
    const SALLE_API = `${BASE_URL}/api/salles`;
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    useEffect(() => {
        let url;

        if (expositionUrl != null) {
            url = `${EXPO_API}${expositionUrl}`;
        } else {
            const params = new URLSearchParams();

            if (effectiveInstitutionId) {
                params.set("institution_id", effectiveInstitutionId);
            }

            if (debouncedSearch) {
                params.set("q", debouncedSearch);
            }

            url = debouncedSearch
                ? `${EXPO_API}/search?${params.toString()}`
                : effectiveInstitutionId
                    ? `${EXPO_API}?${params.toString()}`
                    : EXPO_API;
        }


        setLoading(true);
        fetch(url)
            .then((res) => { if (!res.ok) throw new Error('Erreur de chargement'); return res.json(); })
            .then((data) => {
                setExpositions(data.map((expo) => ({
                    ...expo,
                    _resolvedImage: getExpoImage(expo),
                    salles: [],
                    _sallesLoaded: false,
                })));
                setLoading(false);
            })
            .catch((err) => { setError(err.message); setLoading(false); });
    }, [effectiveInstitutionId, debouncedSearch]);

    // ── Fetch thèmes ─────────────────────────────────────────────────────────
    useEffect(() => {

        setThemesLoading(true);
        fetch(`${BASE_URL}/api/themes`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => { setThemes(data); setThemesLoading(false); })
            .catch(() => setThemesLoading(false));
    }, []);

    // ── Fetch modèles de salle quand on ouvre le modal d'ajout ──────────────────
    const fetchModelesSalle = async () => {
        setModelesSalleLoading(true);
        try {
            const res = await fetch(MODELE_SALLE_API);
            if (!res.ok) throw new Error('Erreur de chargement des modèles');
            const data = await res.json();
            setModelesSalle(data);
        } catch (err) {
            console.error(err.message);
            setModelesSalle([]);
        }
        setModelesSalleLoading(false);
    };

    // ── Helper: Get full image URL for modele_salle ─────────────────────────────
    const getModeleSalleImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BASE_URL}${imagePath}`;
    };

    // ── Switch to salles view (chargement à la demande) ──────────────────────
    const [sallesLoading, setSallesLoading] = useState(false);

    const handleVoirSalles = async (expo) => {
        if (!expo?.id) {
            console.warn('handleVoirSalles: expo.id is undefined', expo);
            return;
        }
        setTransitioning(true);
        // Si les salles ne sont pas encore chargées pour cette expo, on les fetheightch
        if (!expo._sallesLoaded) {
            setSallesLoading(true);
            try {
                const res = await fetch(`${SALLE_API}?exposition_id=${expo.id}`);
                if (!res.ok) throw new Error('Erreur de chargement des salles');
                const data = await res.json();
                const sallesWithParent = data.map((s) => ({ ...s, _parentExpo: expo }));
                const updatedExpo = { ...expo, salles: sallesWithParent, _sallesLoaded: true };
                setExpositions((prev) => prev.map((e) => e.id === expo.id ? updatedExpo : e));
                setSallesLoading(false);
                setTimeout(() => {
                    setActiveExpo(updatedExpo);
                    setSalleIndex(0);
                    setView('salles');
                    setTransitioning(false);
                }, 300);
            } catch (err) {
                setSallesLoading(false);
                setTransitioning(false);
                alert(err.message);
            }
        } else {
            setTimeout(() => {
                setActiveExpo(expo);
                setSalleIndex(0);
                setView('salles');
                setTransitioning(false);
            }, 300);
        }
    };

    const handleRetour = () => {
        setTransitioning(true);
        setTimeout(() => {
            setView('expositions');
            setActiveExpo(null);
            setTransitioning(false);
        }, 300);
    };

    // ── CRUD helpers ──────────────────────────────────────────────────────────
    const [expoErrors, setExpoErrors] = useState({});

    const validateExpoForm = (data) => {
        const errs = {};
        if (!data.nom?.trim()) errs.nom = 'Le nom est requis';
        else if (data.nom.trim().length < 2) errs.nom = 'Le nom doit contenir au moins 2 caractères';
        if (!data.description?.trim()) errs.description = 'La description est requise';
        if (!data.type_exposition) errs.type_exposition = 'Le type est requis';
        return errs;
    };

    const handleAction = (type, expo) => {
        setModalType(type);
        setSelectedExpo(expo);
        setExpoErrors({});
        setEditUploadedImage(null);
        if (type === 'modifier') setFormData({
            nom: expo.nom || '',
            description: expo.description || '',
            type_exposition: expo.type_exposition || '',
            theme_ids: (expo.themes || []).map(t => (typeof t === 'object' ? t.id : t)),
        });
        setShowModal(true);
    };

    const [expoLoading, setExpoLoading] = useState(false);

    // PATCH exposition
    const handleUpdate = async () => {
        const errs = validateExpoForm(formData);

        if (Object.keys(errs).length > 0) {
            setExpoErrors(errs);
            return;
        }

        setExpoLoading(true);

        try {
            const fd = new FormData();

            fd.append("nom", formData.nom.trim());
            fd.append("description", formData.description.trim());

            if (formData.type_exposition) {
                fd.append("type_exposition", formData.type_exposition);
            }

            (formData.theme_ids || []).forEach((id) => {
                fd.append("themes", id);
            });

            if (editUploadedImage?.file) {
                fd.append("image", editUploadedImage.file);
            }

            const response = await axios.patch(
                `${EXPO_API}/${selectedExpo.id}`,
                fd,
                {
                    withCredentials: true,
                }
            );

            const updated = response.data;

            setExpositions((prev) =>
                prev.map((e) =>
                    e.id === selectedExpo.id
                        ? {
                            ...e,
                            ...updated,
                            _resolvedImage:
                                getExpoImage(updated) || e._resolvedImage,
                            salles: e.salles,
                            _sallesLoaded: e._sallesLoaded,
                        }
                        : e
                )
            );

            setExpoErrors({});

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de la modification"
            );
        } finally {
            setExpoLoading(false);
            setShowModal(false);
        }
    };

    // DELETE exposition
    const handleDelete = async () => {
        setExpoLoading(true);

        try {
            await axios.delete(
                `${EXPO_API}/${selectedExpo.id}`,
                {
                    withCredentials: true,
                }
            );

            setExpositions((prev) =>
                prev.filter((e) => e.id !== selectedExpo.id)
            );

            setExpoIndex((c) =>
                Math.max(0, c >= expositions.length - 1 ? c - 1 : c)
            );

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de la suppression"
            );
        } finally {
            setExpoLoading(false);
            setShowModal(false);
        }
    };


    // PATCH status exposition
    const handleUpdateStatus = async (expo, newStatus) => {
        try {
            await axios.patch(
                `${EXPO_API}/${expo.id}/status`,
                {
                    status_exposition: newStatus,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setExpositions((prev) =>
                prev.map((e) =>
                    e.id === expo.id
                        ? {
                            ...e,
                            status_exposition: newStatus,
                        }
                        : e
                )
            );

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de la mise à jour du statut"
            );
        }
    };
    const [confirmEditModal, setConfirmEditModal] = useState({ open: false, salleId: null, expositionId: null });

    const storeTransitionData = () => {
        const expoImg = activeExpo?._resolvedImage || getExpoImage(activeExpo);
        if (expoImg) localStorage.setItem('salle_transition_image', expoImg);
        else localStorage.removeItem('salle_transition_image');
        localStorage.setItem('salle_transition_nom', activeExpo?.nom || '');
    };

    const versSalle = (salleId, expositionId) => {
        if (!isVisitePage && activeExpo?.status_exposition === 'publiee') {
            setConfirmEditModal({ open: true, salleId, expositionId });
            return;
        }
        storeTransitionData();
        updateContext(salleId, expositionId);
        if (isVisitePage) {
            navigate("/visiter_salle");
        } else {
            navigate("/edit_salle_expo");
        }
    };

    const handleConfirmEdit = async () => {
        const { salleId, expositionId } = confirmEditModal;
        setConfirmEditModal({ open: false, salleId: null, expositionId: null });
        if (activeExpo) {
            await handleUpdateStatus(activeExpo, 'en_modification');
        }
        storeTransitionData();
        updateContext(expositionId, salleId);
        navigate("/edit_salle_expo");
    };



    // POST exposition
    const handleAdd = async () => {
        const errs = validateExpoForm(formData);

        if (Object.keys(errs).length > 0) {
            setExpoErrors(errs);
            return;
        }

        setExpoLoading(true);

        try {
            const fd = new FormData();

            fd.append("nom", formData.nom);
            fd.append("description", formData.description);

            if (formData.type_exposition) {
                fd.append("type_exposition", formData.type_exposition);
            }

            // institution_id selon le rôle
            if (effectiveInstitutionId) {
                fd.append("institution_id", effectiveInstitutionId);
            }

            if (formData.artiste_id) {
                fd.append("artiste_id", formData.artiste_id);
            }

            (formData.theme_ids || []).forEach((id) => {
                fd.append("themes", id);
            });

            if (uploadedImage?.file) {
                fd.append("image", uploadedImage.file);
            }

            const response = await axios.post(
                `${BASE_URL}/api/expositions`,
                fd,
                {
                    withCredentials: true,
                }
            );

            const json = response.data;

            const created = json.data ?? json;

            const newExpo = {
                ...created,
                salles: [],
                _sallesLoaded: false,
                _resolvedImage: previewImage,
            };

            setExpositions((prev) => [...prev, newExpo]);
            setExpoIndex(expositions.length);

            setFormData({
                nom: "",
                description: "",
                user_id: user?.id,
                theme_ids: [],
                type_exposition: "",
                institution_id: effectiveInstitutionId,
                artiste_id: null,
            });

            setUploadedImage(null);
            setSelectedLocalImage(null);
            setSelectedThemeImages({});

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de l'ajout"
            );
        } finally {
            setExpoLoading(false);
            setShowAddModal(false);
        }
    };
    const [salleErrors, setSalleErrors] = useState({});
    // Image upload pour modal modifier exposition
    const [editUploadedImage, setEditUploadedImage] = useState(null);
    const editFileInputRef = React.useRef(null);
    const [editDragOver, setEditDragOver] = useState(false);
    const [editImagePickerOpen, setEditImagePickerOpen] = useState(false);

    const validateSalleForm = (data) => {
        const errs = {};
        if (!data.nom?.trim()) errs.nom = 'Le nom est requis';
        else if (data.nom.trim().length < 2) errs.nom = 'Minimum 2 caractères';
        return errs;
    };

    const handleSalleAction = (type, salle) => {
        setSalleModalType(type);
        setSelectedSalle(salle);
        setSalleErrors({});
        if (type === 'modifier') {
            setSalleFormData({ nom: salle.nom || '', description: salle.description || '' });
            setSelectedModeleSalle(salle.modele_salle?.id || salle.modele_salle_id || null);
            fetchModelesSalle();
        }
        setShowSalleModal(true);
    };

    const handleSalleUpdate = async () => {
        const errs = validateSalleForm(salleFormData);

        if (Object.keys(errs).length > 0) {
            setSalleErrors(errs);
            return;
        }

        setSalleLoading(true);

        try {
            const response = await axios.patch(
                `${SALLE_API}/${selectedSalle.id}`,
                {
                    nom: salleFormData.nom.trim(),
                    description: salleFormData.description.trim(),
                    modele_salle_id: selectedModeleSalle ?? null,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const updated = response.data;

            const patch = (s) =>
                s.id === selectedSalle.id
                    ? { ...s, ...updated, _parentExpo: s._parentExpo }
                    : s;

            setActiveExpo((prev) => ({
                ...prev,
                salles: prev.salles.map(patch),
            }));

            setExpositions((prev) =>
                prev.map((e) =>
                    e.id === activeExpo.id
                        ? { ...e, salles: e.salles.map(patch) }
                        : e
                )
            );

            setSalleErrors({});

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de la modification"
            );
        } finally {
            setSalleLoading(false);
            setShowSalleModal(false);
            setSelectedModeleSalle(null);
        }
    };
    const handleSalleDelete = async () => {
        setSalleLoading(true);

        try {
            await axios.delete(
                `${SALLE_API}/${selectedSalle.id}`,
                {
                    withCredentials: true,
                }
            );

            const newSalles = activeExpo.salles.filter(
                (s) => s.id !== selectedSalle.id
            );

            setActiveExpo((prev) => ({
                ...prev,
                salles: newSalles,
            }));

            setExpositions((prev) =>
                prev.map((e) =>
                    e.id === activeExpo.id
                        ? { ...e, salles: newSalles }
                        : e
                )
            );

            setSalleIndex((c) =>
                Math.max(0, c >= newSalles.length ? c - 1 : c)
            );

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de la suppression"
            );
        } finally {
            setSalleLoading(false);
            setShowSalleModal(false);
        }
    };

    const handleSalleAdd = async () => {
        if (!salleFormData.nom.trim()) {
            alert("Le nom de la salle est requis");
            return;
        }

        if (!selectedModeleSalle) {
            alert("Veuillez sélectionner un modèle de salle");
            return;
        }

        console.log(
            "Adding salle with data:",
            salleFormData,
            "modele_salle:",
            selectedModeleSalle,
            "to expo ID:",
            expoIdForNewSalle
        );

        console.log("Selected modèle salle ID:", selectedModeleSalle);

        setSalleLoading(true);

        try {
            const response = await axios.post(
                `${SALLE_API}`,
                {
                    nom: salleFormData.nom,
                    description: salleFormData.description,
                    modele_salle_id: selectedModeleSalle,
                    exposition_id: expoIdForNewSalle,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const created = response.data;

            const newSalle = {
                ...created,
                _parentExpo: activeExpo,
            };

            const newSalles = [...activeExpo.salles, newSalle];

            const updatedExpo = {
                ...activeExpo,
                salles: newSalles,
            };

            setActiveExpo(updatedExpo);

            setExpositions((prev) =>
                prev.map((e) =>
                    e.id === activeExpo.id
                        ? { ...e, salles: newSalles }
                        : e
                )
            );

            setSalleFormData({
                nom: "",
                description: "",
                modele_salle: null,
            });

            setSelectedModeleSalle(null);

            // Afficher la nouvelle salle
            setSalleIndex(newSalles.length - 1);

            setShowAddSalleModal(false);

            setTransitioning(true);

            setTimeout(() => {
                setView("salles");
                setTransitioning(false);
            }, 300);

        } catch (err) {
            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erreur lors de l'ajout"
            );

        } finally {
            setSalleLoading(false);
            setShowAddSalleModal(false);
        }
    };

    // ── Expositions filtrées par statut ─────────────────────────────────────
    const filteredExpositions = React.useMemo(() => {
        if (statusFilter === 'toutes') return expositions;
        return expositions.filter((e) => e.status_exposition === statusFilter);
    }, [expositions, statusFilter]);

    // Recale l'index du carousel si le filtre réduit la liste
    useEffect(() => {
        setExpoIndex((c) => Math.min(c, Math.max(0, filteredExpositions.length - 1)));
    }, [filteredExpositions.length]);

    const isAndroid = () => {
        return /Android/i.test(navigator.userAgent);
    };

    const enableLandscape = async () => {
        if (!isAndroid()) return;

        try {
            // Passage en fullscreen (souvent nécessaire pour lock l'orientation)
            if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }

            if (screen.orientation?.lock) {
                await screen.orientation.lock("landscape");
                console.log("Orientation paysage activée");
            }

        } catch (error) {
            console.log("Orientation non supportée :", error);
        }
    };
    // ── Card renderers ────────────────────────────────────────────────────────
    const renderExpoCard = (expo, isActive) => (
        <>
            <img src={expo._resolvedImage || getExpoImage(expo)} alt={expo.nom} />
            <div className="expo-card-overlay" />
            {isActive &&
                (
                    user?.role === "administrateur" ||
                    (
                        ["admin_institution", "curateur"].includes(user?.role) &&
                        user?.institution_id === expo?.institution_id
                    )
                ) && (
                    <div className="expo-card-top">
                        <button className="btn-card-action" onClick={(e) => { e.stopPropagation(); handleAction('modifier', expo); }}>
                            <PencilIcon /><span> Modifier</span>
                        </button>
                        <button className="btn-card-action delete" onClick={(e) => { e.stopPropagation(); handleAction('supprimer', expo); }}>
                            <TrashIcon /><span> Supprimer</span>
                        </button>
                        {expo.status_exposition !== 'publiee' && (
                            <button className="btn-card-action publish" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(expo, 'publiee'); }}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg><span> Publier</span>
                            </button>
                        )}
                        {expo.status_exposition === 'publiee' && (
                            <button className="btn-card-action published" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(expo, 'en_modification'); }}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                </svg><span> Publiée</span>
                            </button>
                        )}
                        {expo.status_exposition !== 'archivee' && (
                            <button className="btn-card-action archive" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(expo, 'archivee'); }}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
                                    <line x1="10" y1="12" x2="14" y2="12" />
                                </svg><span> Archiver</span>
                            </button>
                        )}
                        {expo.status_exposition === 'archivee' && (
                            <button className="btn-card-action unarchive" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(expo, 'en_modification'); }}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
                                    <polyline points="10 12 12 10 14 12" /><line x1="12" y1="10" x2="12" y2="16" />
                                </svg><span> Archivée</span>
                            </button>
                        )}
                    </div>
                )}
            {isActive && canEdit && expo.status_exposition && (
                <div style={{ position: 'absolute', top: 'calc(1rem + 36px + 8px)', right: '1rem', zIndex: 20 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px',
                        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                        whiteSpace: 'nowrap',
                        ...(expo.status_exposition === 'publiee' ? {
                            background: 'rgba(22,163,74,0.30)', border: '1px solid rgba(22,163,74,0.65)', color: '#bbf7d0',
                        } : expo.status_exposition === 'archivee' ? {
                            background: 'rgba(220,38,38,0.30)', border: '1px solid rgba(220,38,38,0.65)', color: '#fecaca',
                        } : {
                            background: 'rgba(234,88,12,0.30)', border: '1px solid rgba(234,88,12,0.65)', color: '#fed7aa',
                        }),
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                            background: expo.status_exposition === 'publiee' ? '#4ade80'
                                : expo.status_exposition === 'archivee' ? '#f87171' : '#fb923c',
                            boxShadow: `0 0 6px ${expo.status_exposition === 'publiee' ? '#4ade80'
                                : expo.status_exposition === 'archivee' ? '#f87171' : '#fb923c'}`,
                        }} />
                        {expo.status_exposition === 'publiee' ? 'Publiée'
                            : expo.status_exposition === 'archivee' ? 'Archivée'
                                : 'En modification'}
                    </span>
                </div>
            )}
            {isActive && (
                <div className="expo-card-bottom">
                    <div className="expo-card-info">
                        <p className="expo-card-name">{expo.nom}</p>
                        <p className="expo-card-desc">{expo.description}</p>
                        <div className="expo-card-meta">
                            <RoomIcon /> {expo._sallesLoaded ? `${expo.salles?.length || 0} salle${expo.salles?.length !== 1 ? 's' : ''}` : 'Voir les salles'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                        <button className="btn-voir-salles" style={{ marginLeft: 0 }} onClick={(e) => { e.stopPropagation(); handleVoirSalles(expo); }}>
                            Voir les salles
                        </button>
                        {(
                            user?.role === "administrateur" ||
                            (
                                ["admin_institution", "curateur"].includes(user?.role)
                            )
                        ) && (
                                <button className="btn-voir-salles" style={{ marginLeft: 0 }} onClick={(e) => {
                                    e.stopPropagation();
                                    if (!expo?.id) return;
                                    setSalleFormData({ nom: '', description: '', modele_salle: null });
                                    setSelectedModeleSalle(null);
                                    setExpoIdForNewSalle(expo.id);
                                    setActiveExpo(expo);
                                    fetchModelesSalle();
                                    setShowAddSalleModal(true);
                                }}>
                                    + Salle
                                </button>
                            )}
                    </div>
                </div>
            )}
        </>
    );

    const renderSalleCard = (salle, isActive) => {
        const expoImg = activeExpo?._resolvedImage || getExpoImage(activeExpo);
        return (
            <>
                {/* Image de l'exposition parente, avec fallback icône */}
                {expoImg ? (
                    <>
                        <img src={expoImg} alt={activeExpo?.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 100%)',
                        }} />
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BoxIcon size={60} color="#D4AF37" />
                    </div>
                )}
                <div className="expo-card-overlay" style={{ pointerEvents: 'none' }} />
                {isActive &&
                    (
                        user?.role === "administrateur" ||
                        (
                            ["admin_institution", "curateur"].includes(user?.role) &&
                            user?.institution_id === salle?.exposition.institution_id
                        )
                    ) && (
                        <div className="expo-card-top">
                            <button className="btn-card-action" onClick={(e) => { e.stopPropagation(); handleSalleAction('modifier', salle); }}>
                                <PencilIcon /><span> Modifier</span>
                            </button>
                            <button className="btn-card-action delete" onClick={(e) => { e.stopPropagation(); handleSalleAction('supprimer', salle); }}>
                                <TrashIcon /><span> Supprimer</span>
                            </button>
                        </div>
                    )}
                {isActive && (
                    <div className="expo-card-bottom">
                        <div className="expo-card-info">
                            <p className="expo-card-name">{salle.nom}</p>
                            {salle.modele_salle?.id && (
                                <p className="expo-card-desc">Modèle : {salle.modele_salle.id}</p>
                            )}
                        </div>
                        <button
                            className="btn-voir-salles btn-icon-box"
                            onClick={async (e) => {
                                e.stopPropagation();

                                const card = e.currentTarget.closest('.expo-card');
                                const rect = card ? card.getBoundingClientRect() : null;
                                const src = activeExpo?._resolvedImage || getExpoImage(activeExpo);

                                // Orientation Android
                                await enableLandscape();

                                // Attendre que la rotation soit appliquée
                                setTimeout(() => {

                                    if (rect && src) {
                                        setZoomAnim({
                                            src,
                                            rect: {
                                                top: rect.top,
                                                left: rect.left,
                                                width: rect.width,
                                                height: rect.height
                                            }
                                        });

                                        setTimeout(() => {
                                            setZoomAnim(null);
                                            versSalle(salle.id, activeExpo.id);
                                        }, 700);

                                    } else {
                                        versSalle(salle.id, activeExpo.id);
                                    }

                                }, 500);
                            }}
                            title="Visiter la salle"
                        >
                            <BoxIcon size={16} />
                            Visiter
                        </button>
                    </div>
                )}
            </>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {zoomAnim && (
                <>
                    <style>{`
                        @keyframes zoomFS {
                            0%   { top: ${zoomAnim.rect.top}px; left: ${zoomAnim.rect.left}px; width: ${zoomAnim.rect.width}px; height: ${zoomAnim.rect.height}px; border-radius: 22px; }
                            100% { top: 0px; left: 0px; width: 100vw; height: 100vh; border-radius: 0px; }
                        }
                    `}</style>
                    <div style={{
                        position: 'fixed',
                        zIndex: 99999,
                        top: zoomAnim.rect.top,
                        left: zoomAnim.rect.left,
                        width: zoomAnim.rect.width,
                        height: zoomAnim.rect.height,
                        borderRadius: 22,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        animation: 'zoomFS 0.65s cubic-bezier(0.4,0,0.2,1) forwards',
                    }}>
                        <img src={zoomAnim.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }} />
                    </div>
                </>
            )}


            <div className={`expo-page${isVisitePage ? ' expo-page--visite' : ' expo-page--admin'}`} ref={pageRef}>

                {/* ═══ FOND ORNEMENTS ANIMÉ ═══ */}
                <OrnementBackground containerRef={pageRef} opacity={0.1} duration={6} useAbsolute />

                {/* ── Header ── */}
                <div className="expo-header">
                    <div>
                        {/* Bouton retour */}
                        {institutionMode && view === 'expositions' && (
                            <button className="btn-retour" style={{ marginBottom: '0.5rem' }} onClick={() => {
                                if (onRetour) { onRetour(); return; }
                                if (isVisitePage) { navigate('/visites/institutions'); return; }
                                navigate('/institutions');
                            }}>
                                <ArrowLeftIcon /> Retour aux institutions
                            </button>
                        )}
                        <h1 className="expo-title">
                            {view === 'expositions'
                                ? institutionMode
                                    ? <>{institutionNom} <span className="expo-subtitle">Expositions</span></>
                                    : 'Liste des Expositions'
                                : 'Salles'
                            }
                            {view === 'salles' && activeExpo && (
                                <span className="expo-subtitle">{activeExpo.nom}</span>
                            )}
                        </h1>
                    </div>

                    <div className="header-actions">
                        {view === 'salles' && (
                            <button className="btn-retour" onClick={handleRetour}>
                                <ArrowLeftIcon /> Retour aux expositions
                            </button>
                        )}
                        {view === 'salles' &&
                            (
                                user?.role === "administrateur" ||
                                (
                                    ["admin_institution", "curateur"].includes(user?.role)
                                )
                            ) && (
                                <button className="btn-add-expo" onClick={() => {
                                    setSalleFormData({ nom: '', description: '', modele_salle: null });
                                    setSelectedModeleSalle(null);
                                    setExpoIdForNewSalle(activeExpo.id);
                                    fetchModelesSalle();
                                    setShowAddSalleModal(true);
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Ajouter une Salle
                                </button>
                            )}
                        {view === 'expositions' && (
                            <div className="filter-status-wrap" ref={statusFilterRef}>
                                <button
                                    className={`btn-filter-status${statusFilter !== 'toutes' ? ' active' : ''}`}
                                    onClick={() => setStatusFilterOpen((o) => !o)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                    Filtrer
                                    {statusFilter !== 'toutes' && (
                                        <span className="filter-status-tag">
                                            {STATUS_EXPOSITION_CHOICES.find(c => c.value === statusFilter)?.label}
                                        </span>
                                    )}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ marginLeft: 2 }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {statusFilterOpen && (
                                    <div className="filter-status-menu">
                                        <div
                                            className={`filter-status-item ${statusFilter === 'toutes' ? 'selected' : ''}`}
                                            onClick={() => { setStatusFilter('toutes'); setStatusFilterOpen(false); }}
                                        >
                                            Toutes
                                        </div>
                                        {STATUS_EXPOSITION_CHOICES.map((c) => (
                                            <div
                                                key={c.value}
                                                className={`filter-status-item ${statusFilter === c.value ? 'selected' : ''}`}
                                                onClick={() => { setStatusFilter(c.value); setStatusFilterOpen(false); }}
                                            >
                                                {c.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {view === 'expositions' && (
                            user?.role === "administrateur" ||
                            (
                                ["admin_institution", "curateur"].includes(user?.role)

                            )
                        ) && (
                                <button className="btn-add-expo" onClick={() => { setFormData({ nom: '', description: '', user_id: user?.id, theme_ids: [], type_exposition: '', institution_id: effectiveInstitutionId, artiste_id: null }); setExpoErrors({}); setTypeDropdownOpen(false); setSelectedThemeImages({}); setImagePickerOpenFor(null); setShowAddModal(true); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Ajouter une Expo
                                </button>
                            )}
                    </div>
                </div>

                {/* ── Breadcrumb ── */}
                {view === 'salles' && (
                    <div className="breadcrumb-bar">
                        <GridIcon />
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={handleRetour}
                        >
                            Expositions
                        </span>
                        <span className="crumb-sep">›</span>
                        <span className="crumb-active">{activeExpo?.nom}</span>
                        <span className="crumb-sep">›</span>
                        <span>Salles</span>
                    </div>
                )}

                {/* ── States ── */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Chargement des expositions...</p>
                    </div>
                )}
                {error && <div className="status-msg error">⚠️ {error}</div>}

                {/* ── Views ── */}
                {!loading && !error && (
                    <div className={`view-container ${transitioning ? 'transitioning' : ''}`}>

                        {/* EXPOSITIONS VIEW */}
                        {view === 'expositions' && (
                            filteredExpositions.length === 0
                                ? (
                                    <div className="status-msg empty">
                                        {expositions.length === 0
                                            ? 'Aucune exposition disponible.'
                                            : 'Aucune exposition ne correspond à ce statut.'}
                                    </div>
                                )
                                : <ExpoCarousel
                                    items={filteredExpositions}
                                    current={expoIndex}
                                    setCurrent={setExpoIndex}
                                    renderCard={renderExpoCard}
                                />
                        )}

                        {/* SALLES VIEW */}
                        {view === 'salles' && activeExpo && (
                            sallesLoading
                                ? (
                                    <div className="loading-state">
                                        <div className="spinner" />
                                        <p>Chargement des salles...</p>
                                    </div>
                                )
                                : activeExpo.salles?.length === 0
                                    ? (
                                        <div className="no-salles">
                                            <RoomIcon size={32} />
                                            <p style={{ marginTop: '1rem' }}>Aucune salle pour cette exposition.</p>
                                            <button className="btn-retour" style={{ margin: '1rem auto', display: 'flex' }} onClick={handleRetour}>
                                                <ArrowLeftIcon /> Retour
                                            </button>
                                        </div>
                                    )
                                    : (
                                        <div className="salle-carousel">
                                            <ExpoCarousel
                                                items={activeExpo.salles}
                                                current={salleIndex}
                                                setCurrent={setSalleIndex}
                                                renderCard={renderSalleCard}
                                            />
                                        </div>
                                    )
                        )}

                    </div>
                )}
            </div>

            {/* ── Modal Modifier / Supprimer ── */}
            {showModal && selectedExpo && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditImagePickerOpen(false); }}>
                    <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
                        {modalType === 'modifier' ? (
                            <>
                                {editImagePickerOpen ? (
                                    /* ── Vue galerie ── */
                                    <div className="gallery-fullview">
                                        <div className="gallery-fullview-header">
                                            <h2 className="modal-title" style={{ margin: 0 }}>Choisir une image</h2>
                                            <button type="button" className="btn-cancel" onClick={() => setEditImagePickerOpen(false)}>✕ Annuler</button>
                                        </div>
                                        <div className="gallery-fullview-grid">
                                            {Object.values(allExpoImages).map((url, i) => (
                                                <div
                                                    key={i}
                                                    className={`gallery-fullview-item ${editUploadedImage?.previewUrl === url ? 'selected' : ''}`}
                                                    onClick={async () => {
                                                        setEditImagePickerOpen(false);
                                                        try {
                                                            const meta = getLocalImageMeta(url);
                                                            const filename = meta?.filename || 'image.jpg';
                                                            const file = await urlToFile(url, filename);
                                                            setEditUploadedImage({ file, previewUrl: url });
                                                        } catch (e) {
                                                            console.warn('urlToFile failed:', e);
                                                        }
                                                    }}
                                                >
                                                    <img src={url} alt={`image ${i + 1}`} />
                                                    {editUploadedImage?.previewUrl === url && (
                                                        <div className="theme-img-check">✓</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="modal-title">Modifier l'exposition</h2>
                                        <div className="modal-salle-layout">
                                            {/* Colonne gauche : aperçu image */}
                                            <div className="modal-expo-image-col">
                                                <div
                                                    className={`modal-expo-image-preview${editDragOver ? ' drag-over' : ''}`}
                                                    onClick={() => editFileInputRef.current?.click()}
                                                    onDragOver={(e) => { e.preventDefault(); setEditDragOver(true); }}
                                                    onDragLeave={() => setEditDragOver(false)}
                                                    onDrop={(e) => {
                                                        e.preventDefault(); setEditDragOver(false);
                                                        const file = e.dataTransfer.files[0];
                                                        if (file?.type.startsWith('image/')) setEditUploadedImage({ file, previewUrl: URL.createObjectURL(file) });
                                                    }}
                                                >
                                                    {(() => {
                                                        const src = editUploadedImage?.previewUrl || selectedExpo?._resolvedImage || getExpoImage(selectedExpo);
                                                        return src ? (
                                                            <>
                                                                <img src={src} alt="Aperçu" className="modal-expo-img" />
                                                                <div className="modal-expo-img-overlay"><UploadIcon size={20} /><span>Remplacer</span></div>
                                                            </>
                                                        ) : (
                                                            <div className="modal-expo-img-placeholder">
                                                                <div className="upload-icon-anim"><UploadIcon size={32} /></div>
                                                                <span className="upload-hint-main">Glisser une image</span>
                                                                <span className="upload-hint-sub">ou cliquer pour parcourir</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                <input ref={editFileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                                                    onChange={(e) => { const f = e.target.files[0]; if (f) setEditUploadedImage({ file: f, previewUrl: URL.createObjectURL(f) }); }} />

                                                {/* Bouton Choisir depuis le dossier — même style que modal Ajouter */}
                                                <button
                                                    type="button"
                                                    className="btn-choose-image"
                                                    onClick={() => setEditImagePickerOpen(true)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                    Choisir une image
                                                </button>
                                            </div>
                                            {/* Colonne droite : formulaire */}
                                            <div className="modal-salle-left" style={{ flex: 2 }}>
                                                <div className="modal-form">
                                                    <label>Nom de l'exposition <span className="field-required">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={formData.nom}
                                                        className={expoErrors.nom ? 'input-error' : ''}
                                                        onChange={(e) => { setFormData({ ...formData, nom: e.target.value }); setExpoErrors(p => ({ ...p, nom: '' })); }}
                                                    />
                                                    {expoErrors.nom && <span className="error-msg">{expoErrors.nom}</span>}

                                                    <label>Description <span className="field-required">*</span></label>
                                                    <textarea
                                                        rows={3}
                                                        value={formData.description}
                                                        className={expoErrors.description ? 'input-error' : ''}
                                                        onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setExpoErrors(p => ({ ...p, description: '' })); }}
                                                    />
                                                    {expoErrors.description && <span className="error-msg">{expoErrors.description}</span>}

                                                    <label>Type d'exposition <span className="field-required">*</span></label>
                                                    <div className={`theme-dropdown-wrap${expoErrors.type_exposition ? ' input-error-wrap' : ''}`} style={{ marginBottom: '0.25rem' }}>
                                                        <button type="button" className="theme-dropdown-trigger" onClick={() => setTypeDropdownOpen(o => !o)}>
                                                            <span style={{ color: formData.type_exposition ? '#1a1a1a' : '#aaa' }}>
                                                                {TYPE_EXPOSITION_CHOICES.find(c => c.value === formData.type_exposition)?.label || 'Choisir un type'}
                                                            </span>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                                                                style={{ transform: typeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                                <polyline points="18 15 12 9 6 15" />
                                                            </svg>
                                                        </button>
                                                        {typeDropdownOpen && (
                                                            <div className="theme-dropdown-menu">
                                                                <div className={`theme-dropdown-item ${!formData.type_exposition ? 'selected' : ''}`}
                                                                    onClick={() => { setFormData(f => ({ ...f, type_exposition: '' })); setTypeDropdownOpen(false); setExpoErrors(p => ({ ...p, type_exposition: '' })); }}>
                                                                    — Aucun type
                                                                </div>
                                                                {TYPE_EXPOSITION_CHOICES.map(c => (
                                                                    <div key={c.value}
                                                                        className={`theme-dropdown-item ${formData.type_exposition === c.value ? 'selected' : ''}`}
                                                                        onClick={() => { setFormData(f => ({ ...f, type_exposition: c.value })); setTypeDropdownOpen(false); setExpoErrors(p => ({ ...p, type_exposition: '' })); }}>
                                                                        {c.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {expoErrors.type_exposition && <span className="error-msg">{expoErrors.type_exposition}</span>}

                                                    <label>Thèmes <span style={{ color: '#aaa', fontWeight: 400 }}>(3 max)</span></label>
                                                    <div className="theme-multiselect">
                                                        <div className="theme-tags-zone">
                                                            {themesLoading
                                                                ? <span className="theme-tags-empty">Chargement des thèmes...</span>
                                                                : formData.theme_ids.length === 0
                                                                    ? <span className="theme-tags-empty">Aucun thème sélectionné</span>
                                                                    : formData.theme_ids.map(tid => {
                                                                        const t = themes.find(th => String(th.id) === String(tid));
                                                                        return t ? (
                                                                            <span key={tid} className="theme-tag">
                                                                                {t.nom}
                                                                                <button type="button" className="theme-tag-remove"
                                                                                    onClick={() => setFormData(prev => ({ ...prev, theme_ids: prev.theme_ids.filter(id => id !== tid) }))}>×</button>
                                                                            </span>
                                                                        ) : (
                                                                            <span key={tid} className="theme-tag" style={{ opacity: 0.5 }}>
                                                                                #{tid}
                                                                                <button type="button" className="theme-tag-remove"
                                                                                    onClick={() => setFormData(prev => ({ ...prev, theme_ids: prev.theme_ids.filter(id => id !== tid) }))}>×</button>
                                                                            </span>
                                                                        );
                                                                    })
                                                            }
                                                        </div>
                                                        <div className="theme-dropdown-wrap">
                                                            <button type="button"
                                                                className={`theme-dropdown-trigger ${formData.theme_ids.length >= 3 ? 'disabled' : ''}`}
                                                                onClick={() => formData.theme_ids.length < 3 && setThemeDropdownOpen(o => !o)}
                                                                disabled={formData.theme_ids.length >= 3}>
                                                                <span style={{ color: formData.theme_ids.length >= 3 ? '#bbb' : '' }}>
                                                                    {formData.theme_ids.length >= 3 ? 'Maximum atteint (3)' : '+ Ajouter un thème'}
                                                                </span>
                                                                {formData.theme_ids.length < 3 && (
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                                                                        style={{ transform: themeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                                        <polyline points="18 15 12 9 6 15" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                            {themeDropdownOpen && (
                                                                <div className="theme-dropdown-menu">
                                                                    {themes.filter(t => !formData.theme_ids.map(String).includes(String(t.id))).map(theme => (
                                                                        <div key={theme.id} className="theme-dropdown-item"
                                                                            onClick={() => { setFormData(prev => ({ ...prev, theme_ids: [...prev.theme_ids, theme.id] })); setThemeDropdownOpen(false); }}>
                                                                            {theme.nom}
                                                                        </div>
                                                                    ))}
                                                                    {themes.filter(t => !formData.theme_ids.map(String).includes(String(t.id))).length === 0 && (
                                                                        <div className="theme-dropdown-item" style={{ color: '#aaa', cursor: 'default' }}>Tous les thèmes ajoutés</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>{/* theme-dropdown-wrap */}
                                                    </div>{/* theme-multiselect */}
                                                </div>{/* modal-form */}
                                            </div>{/* modal-salle-left */}
                                        </div>{/* modal-salle-layout */}
                                        <div className="modal-actions">
                                            <button className="btn-cancel" onClick={() => { setShowModal(false); setExpoErrors({}); setEditUploadedImage(null); setEditImagePickerOpen(false); }}>Annuler</button>
                                            <button className="btn-confirm primary" onClick={handleUpdate} disabled={expoLoading}>
                                                <PencilIcon /> {expoLoading ? 'Enregistrement...' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 className="modal-title">Supprimer l'exposition</h2>
                                <p className="delete-warning">
                                    Êtes-vous sûr de vouloir supprimer <strong>"{selectedExpo.nom}"</strong> ?<br />Cette action est irréversible.
                                </p>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button className="btn-confirm danger" onClick={handleDelete} disabled={expoLoading}>
                                        <TrashIcon /> {expoLoading ? 'Suppression...' : 'Supprimer'}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal Ajouter ── */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => { setShowAddModal(false); setUploadedImage(null); setSelectedLocalImage(null); setTypeDropdownOpen(false); setSelectedThemeImages({}); setImagePickerOpenFor(null); }}>
                    <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
                        {imagePickerOpenFor === 'main' ? (
                            /* ── Vue galerie : remplace tout le contenu du modal ── */
                            <div className="gallery-fullview">
                                <div className="gallery-fullview-header">
                                    <h2 className="modal-title" style={{ margin: 0 }}>Choisir une image</h2>
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setImagePickerOpenFor(null)}
                                    >✕ Annuler</button>
                                </div>
                                <div className="gallery-fullview-grid">
                                    {Object.values(allExpoImages).map((url, i) => (
                                        <div
                                            key={i}
                                            className={`gallery-fullview-item ${(selectedLocalImage === url || (!selectedLocalImage && !uploadedImage && previewImage === url)) ? 'selected' : ''}`}
                                            onClick={async () => {
                                                setSelectedLocalImage(url);
                                                setImagePickerOpenFor(null);
                                                try {
                                                    const meta = getLocalImageMeta(url);
                                                    const filename = meta?.filename || 'image.jpg';
                                                    const file = await urlToFile(url, filename);
                                                    setUploadedImage({ file, previewUrl: url });
                                                } catch (e) {
                                                    console.warn('urlToFile failed:', e);
                                                    setUploadedImage(null);
                                                }
                                            }}
                                        >
                                            <img src={url} alt={`image ${i + 1}`} />
                                            {(selectedLocalImage === url || (!selectedLocalImage && !uploadedImage && previewImage === url)) && (
                                                <div className="theme-img-check">✓</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* ── Vue formulaire normale ── */
                            <><h2 className="modal-title">Ajouter une exposition</h2>
                                <div className="modal-salle-layout">
                                    {/* ── Colonne gauche : aperçu + upload ── */}
                                    <div className="modal-expo-image-col">
                                        {/* Zone drag & drop / aperçu */}
                                        <div
                                            className={`modal-expo-image-preview${dragOver ? ' drag-over' : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOver(false);
                                                const file = e.dataTransfer.files[0];
                                                if (file && file.type.startsWith('image/')) {
                                                    setUploadedImage({ file, previewUrl: URL.createObjectURL(file) });
                                                    setSelectedLocalImage(null);
                                                }
                                            }}
                                        >
                                            {previewImage ? (
                                                <>
                                                    <img src={previewImage} alt="Aperçu" className="modal-expo-img" />
                                                    <div className="modal-expo-img-overlay">
                                                        <UploadIcon size={20} />
                                                        <span>Remplacer</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="modal-expo-img-placeholder">
                                                    <div className="upload-icon-anim">
                                                        <UploadIcon size={32} />
                                                    </div>
                                                    <span className="upload-hint-main">Glisser une image</span>
                                                    <span className="upload-hint-sub">ou cliquer pour parcourir</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bouton Choisir depuis le dossier */}
                                        <button
                                            type="button"
                                            className="btn-choose-image"
                                            onClick={() => setImagePickerOpenFor(p => p === 'main' ? null : 'main')}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            Choisir une image
                                        </button>

                                        {/* Input file caché */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) { setUploadedImage({ file, previewUrl: URL.createObjectURL(file) }); setSelectedLocalImage(null); }
                                            }}
                                        />
                                        {(uploadedImage || selectedLocalImage) && (
                                            <button className="btn-remove-img" onClick={() => { setUploadedImage(null); setSelectedLocalImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                                                ✕ Supprimer l'image
                                            </button>
                                        )}
                                    </div>

                                    {/* ── Colonne droite : formulaire ── */}
                                    <div className="modal-salle-left" style={{ flex: 2 }}>
                                        <div className="modal-form">
                                            <label>Nom de l'exposition <span className="field-required">*</span></label>
                                            <input type="text" placeholder="Ex: Art Africain"
                                                className={expoErrors.nom ? 'input-error' : ''}
                                                value={formData.nom}
                                                onChange={(e) => { setFormData({ ...formData, nom: e.target.value }); setExpoErrors(p => ({ ...p, nom: '' })); }} />
                                            {expoErrors.nom && <span className="error-msg">{expoErrors.nom}</span>}
                                            <label>Description <span className="field-required">*</span></label>
                                            <textarea rows={3} placeholder="Décrivez l'exposition..."
                                                className={expoErrors.description ? 'input-error' : ''}
                                                value={formData.description}
                                                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setExpoErrors(p => ({ ...p, description: '' })); }} />
                                            {expoErrors.description && <span className="error-msg">{expoErrors.description}</span>}
                                            <label>Type d'exposition <span className="field-required">*</span></label>
                                            <div className="theme-dropdown-wrap" style={{ marginBottom: '0.75rem' }}>
                                                <button
                                                    type="button"
                                                    className="theme-dropdown-trigger"
                                                    onClick={() => setTypeDropdownOpen(o => !o)}
                                                >
                                                    <span style={{ color: formData.type_exposition ? '#1a1a1a' : '#aaa' }}>
                                                        {TYPE_EXPOSITION_CHOICES.find(c => c.value === formData.type_exposition)?.label || 'Choisir un type'}
                                                    </span>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                                                        style={{ transform: typeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                        <polyline points="18 15 12 9 6 15" />
                                                    </svg>
                                                </button>
                                                {typeDropdownOpen && (
                                                    <div className="theme-dropdown-menu">
                                                        <div
                                                            className={`theme-dropdown-item ${!formData.type_exposition ? 'selected' : ''}`}
                                                            onClick={() => { setFormData(f => ({ ...f, type_exposition: '' })); setTypeDropdownOpen(false); }}
                                                        >— Aucun type</div>
                                                        {TYPE_EXPOSITION_CHOICES.map(c => (
                                                            <div
                                                                key={c.value}
                                                                className={`theme-dropdown-item ${formData.type_exposition === c.value ? 'selected' : ''}`}
                                                                onClick={() => { setFormData(f => ({ ...f, type_exposition: c.value })); setTypeDropdownOpen(false); }}
                                                            >{c.label}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {expoErrors.type_exposition && <span className="error-msg">{expoErrors.type_exposition}</span>}
                                            <label>Thèmes <span style={{ color: '#aaa', fontWeight: 400 }}>(3 max)</span></label>
                                            <div className="theme-multiselect">
                                                {/* ── Tags des thèmes sélectionnés ── */}
                                                <div className="theme-tags-zone">
                                                    {formData.theme_ids.length === 0 ? (
                                                        <span className="theme-tags-empty">Aucun thème sélectionné</span>
                                                    ) : (
                                                        formData.theme_ids.map(tid => {
                                                            const t = themes.find(th => th.id === tid);
                                                            const themeImgs = themeImagesMap[tid] || [];
                                                            // Fallback : si aucune image trouvée pour ce thème, afficher toutes les images du dossier
                                                            const allImgs = Object.values(allExpoImages);
                                                            const imgs = themeImgs.length > 0 ? themeImgs : allImgs;
                                                            const chosen = selectedThemeImages[tid] || imgs[0];
                                                            return t ? (
                                                                <span key={tid} className="theme-tag">
                                                                    {t.nom}
                                                                    <button
                                                                        type="button"
                                                                        className="theme-tag-remove"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, theme_ids: prev.theme_ids.filter(id => id !== tid) }));
                                                                            setSelectedThemeImages(prev => { const n = { ...prev }; delete n[tid]; return n; });
                                                                        }}
                                                                    >×</button>
                                                                </span>
                                                            ) : null;
                                                        })
                                                    )}
                                                </div>
                                                {/* ── Dropdown en bas ── */}
                                                {themesLoading ? (
                                                    <div style={{ padding: '0.5rem', fontSize: '0.82rem', color: '#aaa' }}>Chargement...</div>
                                                ) : (
                                                    <div className="theme-dropdown-wrap">
                                                        <button
                                                            type="button"
                                                            className={`theme-dropdown-trigger ${formData.theme_ids.length >= 3 ? 'disabled' : ''}`}
                                                            onClick={() => formData.theme_ids.length < 3 && setThemeDropdownOpen(o => !o)}
                                                            disabled={formData.theme_ids.length >= 3}
                                                        >
                                                            <span style={{ color: formData.theme_ids.length >= 3 ? '#bbb' : '' }}>
                                                                {formData.theme_ids.length >= 3 ? 'Maximum atteint (3)' : '+ Ajouter un thème'}
                                                            </span>
                                                            {formData.theme_ids.length < 3 && (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                                                                    style={{ transform: themeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                                    <polyline points="18 15 12 9 6 15" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        {themeDropdownOpen && (
                                                            <div className="theme-dropdown-menu">
                                                                {themes
                                                                    .filter(t => !formData.theme_ids.includes(t.id))
                                                                    .map(theme => (
                                                                        <div
                                                                            key={theme.id}
                                                                            className="theme-dropdown-item"
                                                                            onClick={() => {
                                                                                setFormData(prev => ({ ...prev, theme_ids: [...prev.theme_ids, theme.id] }));
                                                                                setThemeDropdownOpen(false);
                                                                            }}
                                                                        >
                                                                            {theme.nom}
                                                                        </div>
                                                                    ))
                                                                }
                                                                {themes.filter(t => !formData.theme_ids.includes(t.id)).length === 0 && (
                                                                    <div className="theme-dropdown-item" style={{ color: '#aaa', cursor: 'default' }}>Tous les thèmes ajoutés</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => { setShowAddModal(false); setUploadedImage(null); setSelectedLocalImage(null); setTypeDropdownOpen(false); setSelectedThemeImages({}); setImagePickerOpenFor(null); }}>Annuler</button>
                                    <button className="btn-confirm primary" onClick={handleAdd} disabled={expoLoading}>
                                        {expoLoading ? 'Ajout...' : 'Ajouter'}
                                    </button>
                                </div>
                            </>)}
                    </div>
                </div>
            )}
            {/* ── Modal Modifier / Supprimer Salle ── */}
            {showSalleModal && selectedSalle && (
                <div className="modal-overlay" onClick={() => { setShowSalleModal(false); setSelectedModeleSalle(null); }}>
                    <div className={`modal-box ${salleModalType === 'modifier' ? 'modal-box-large' : ''}`} onClick={(e) => e.stopPropagation()}>
                        {salleModalType === 'modifier' ? (
                            <>
                                <h2 className="modal-title">Modifier la salle</h2>
                                <div className="modal-salle-layout">
                                    {/* Colonne gauche : Champs de saisie */}
                                    <div className="modal-salle-left">
                                        <div className="modal-form">
                                            <label>Nom de la salle <span className="field-required">*</span></label>
                                            <input
                                                type="text"
                                                value={salleFormData.nom}
                                                className={salleErrors.nom ? 'input-error' : ''}
                                                onChange={(e) => { setSalleFormData({ ...salleFormData, nom: e.target.value }); setSalleErrors(p => ({ ...p, nom: '' })); }}
                                            />
                                            {salleErrors.nom && <span className="error-msg">{salleErrors.nom}</span>}
                                            <label>Description</label>
                                            <textarea
                                                rows={5}
                                                placeholder="Décrivez la salle..."
                                                value={salleFormData.description}
                                                onChange={(e) => setSalleFormData({ ...salleFormData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Colonne droite : Sélection du modèle */}
                                    <div className="modal-salle-right">
                                        <span className="modal-salle-right-label">Choisir un modèle de salle</span>
                                        {modelesSalleLoading ? (
                                            <div className="modeles-loading">Chargement des modèles...</div>
                                        ) : modelesSalle.length === 0 ? (
                                            <div className="modeles-empty">Aucun modèle de salle disponible</div>
                                        ) : (
                                            <div className="modeles-grid">
                                                {modelesSalle.map((modele) => (
                                                    <div
                                                        key={modele.id}
                                                        className={`modele-item ${selectedModeleSalle === modele.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedModeleSalle(modele.id)}
                                                    >
                                                        {modele.image ? (
                                                            <img
                                                                src={getModeleSalleImageUrl(modele.image)}
                                                                alt={modele.nom}
                                                                className="modele-item-image"
                                                            />
                                                        ) : (
                                                            <div className="modele-item-placeholder">
                                                                <RoomIcon size={28} />
                                                            </div>
                                                        )}
                                                        <p className="modele-item-name">{modele.nom}</p>
                                                        {selectedModeleSalle === modele.id && (
                                                            <div className="modele-check">
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => { setShowSalleModal(false); setSelectedModeleSalle(null); setSalleErrors({}); }}>Annuler</button>
                                    <button className="btn-confirm primary" onClick={handleSalleUpdate} disabled={salleLoading}>
                                        <PencilIcon /> {salleLoading ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="modal-title">Supprimer la salle</h2>
                                <p className="delete-warning">
                                    Êtes-vous sûr de vouloir supprimer <strong>"{selectedSalle.nom}"</strong> ?<br />Cette action est irréversible.
                                </p>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowSalleModal(false)}>Annuler</button>
                                    <button className="btn-confirm danger" onClick={handleSalleDelete} disabled={salleLoading}>
                                        <TrashIcon /> {salleLoading ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal Ajouter Salle ── */}
            {showAddSalleModal && (
                <div className="modal-overlay" onClick={() => { setShowAddSalleModal(false); setSelectedModeleSalle(null); }}>
                    <div className="modal-box modal-box-large" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Ajouter une salle</h2>
                        <div className="modal-salle-layout">
                            {/* Colonne gauche : Champs de saisie */}
                            <div className="modal-salle-left">
                                <div className="modal-form">
                                    <label>Nom de la salle</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Salle Peulh"
                                        value={salleFormData.nom}
                                        onChange={(e) => setSalleFormData({ ...salleFormData, nom: e.target.value })}
                                    />
                                    <label>Description</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Décrivez la salle..."
                                        value={salleFormData.description}
                                        onChange={(e) => setSalleFormData({ ...salleFormData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Colonne droite : Sélection du modèle */}
                            <div className="modal-salle-right">
                                <span className="modal-salle-right-label">Choisir un modèle de salle</span>
                                {modelesSalleLoading ? (
                                    <div className="modeles-loading">Chargement des modèles...</div>
                                ) : modelesSalle.length === 0 ? (
                                    <div className="modeles-empty">Aucun modèle de salle disponible</div>
                                ) : (
                                    <div className="modeles-grid">
                                        {modelesSalle.map((modele) => (
                                            <div
                                                key={modele.id}
                                                className={`modele-item ${selectedModeleSalle === modele.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedModeleSalle(modele.id)}
                                            >
                                                {modele.image ? (
                                                    <img
                                                        src={getModeleSalleImageUrl(modele.image)}
                                                        alt={modele.nom}
                                                        className="modele-item-image"
                                                    />
                                                ) : (
                                                    <div className="modele-item-placeholder">
                                                        <RoomIcon size={28} />
                                                    </div>
                                                )}
                                                <p className="modele-item-name">{modele.nom}</p>
                                                {selectedModeleSalle === modele.id && (
                                                    <div className="modele-check">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => { setShowAddSalleModal(false); setSelectedModeleSalle(null); }}>Annuler</button>
                            <button className="btn-confirm primary" onClick={handleSalleAdd} disabled={salleLoading || !selectedModeleSalle}>
                                {salleLoading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Confirmation Modifier Exposition Publiée ── */}
            {confirmEditModal.open && (
                <div className="modal-overlay" onClick={() => setConfirmEditModal({ open: false, salleId: null, expositionId: null })}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                background: 'rgba(234,88,12,0.12)', border: '1.5px solid rgba(234,88,12,0.4)',
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" width="18" height="18">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </span>
                            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>Exposition publiée</h2>
                        </div>
                        <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            Vous allez modifier une exposition <strong>publiée</strong>. Les changements seront visibles par les visiteurs.
                            <br /><br />
                            Voulez-vous continuer ?
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setConfirmEditModal({ open: false, salleId: null, expositionId: null })}>
                                Annuler
                            </button>
                            <button className="btn-confirm primary" onClick={handleConfirmEdit}>
                                <PencilIcon /> Continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}