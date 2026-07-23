import React, { useState, useEffect, useRef } from 'react';
import image from "../../assets/slider_images_login/image4.jpg";
import Expositions from './Expositions'; // adapte le chemin
import Users from './Users'; // adapte le chemin
import BiensCulturels from './BiensCulturels'; // adapte le chemin

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES & CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const INSTITUTION_API = 'http://localhost:8383';

const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;
const institutionsEndpoint = import.meta.env.VITE_INSTITUTION_ENDPOINT;

const TYPE_INSTITUTION_CHOICES = [
    { value: 'all', label: 'Tous' },
    { value: 'musee', label: 'Musée' },
    { value: 'galerie', label: 'Galerie' },
    { value: 'centre', label: 'Centre Culturel' },
    { value: 'autre', label: 'Autre' },
];

const STATUT_VALIDATION = {
    pending: { label: 'En attente', color: '#f59e0b' },
    approved: { label: 'Validé', color: '#10b981' },
    rejected: { label: 'Rejeté', color: '#ef4444' },
};

// ══════════════════════════════════════════════════════════════════════════════
// ICÔNES SVG
// ══════════════════════════════════════════════════════════════════════════════

const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const BuildingIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const LocationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const DotsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
    </svg>
);

const ExpoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
    </svg>
);

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Institutions({ mode } = {}) {
    // Mode "visite" : page publique /visites/expositions => lecture seule
    // (pas d'ajout/suppression/modification, menu 3 points réduit)
    const isVisiteMode = mode === 'visite'
        || (typeof window !== 'undefined' && window.location.pathname.startsWith('/visites'));

    // États données
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Navigation & filtres
    const [activeTab, setActiveTab] = useState('list');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Références pour le drag du carrousel
    const dragStartX = useRef(0);
    const isDragging = useRef(false);

    // Vue expositions d'une institution (inline, sans changer de route)
    const [expoInstitution, setExpoInstitution] = useState(null);
    // Vue biens d'une institution (inline)
    const [biensInstitution, setBiensInstitution] = useState(null);
    // Vue utilisateurs d'une institution (inline)
    const [usersInstitution, setUsersInstitution] = useState(null);

    // Menu 3 points
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Fermer le menu au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [validating, setValidating] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        ninea: '',
        description: '',
        numero_telephone: '',
        type: 'musee',
        image: null,
        piece_identite: null,
        justicatif_domicile: null,
    });

    // ── Fetch institutions ────────────────────────────────────────────────────
    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institutions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Erreur de chargement');
            const data = await response.json();
            console.log('Institutions fetched:', data);
            setInstitutions(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Filtrage des institutions ─────────────────────────────────────────────
    const filteredInstitutions = institutions.filter((inst) => {
        const matchTab = activeTab === 'list' 
            ? true  
            : inst.statut_validation !== 'approved';
        const matchType = typeFilter === 'all' || inst.type === typeFilter;
        return matchTab && matchType;
    });

    // Reset carousel index when filter changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeTab, typeFilter]);

    // Carousel navigation
    const totalItems = filteredInstitutions.length;
    const prevSlide = () => setCurrentIndex((c) => (c - 1 + totalItems) % totalItems);
    const nextSlide = () => setCurrentIndex((c) => (c + 1) % totalItems);

    // ── DRAG & DROP CAROUSEL IMPLEMENTATION ───────────────────────────────────
    const handleDragStart = (clientX) => {
        dragStartX.current = clientX;
        isDragging.current = true;
    };

    const handleDragMove = (clientX) => {
        if (!isDragging.current) return;
        const diffX = dragStartX.current - clientX;

        // Seuil de défilement (60px) pour éviter les triggers involontaires
        if (Math.abs(diffX) > 60) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            isDragging.current = false; // Bloque les triggers en boucle pendant le mouvement
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
    };

    const getCardStyle = (index) => {
        if (totalItems === 0) return { display: 'none' };
        const diff = ((index - currentIndex) % totalItems + totalItems) % totalItems;
        const d = diff <= totalItems / 2 ? diff : diff - totalItems;
        
        // Carte centrale
        if (d === 0) {
            return { 
                transform: 'translateX(0%) scale(1) rotateY(0deg)', 
                zIndex: 10, 
                opacity: 1,
            };
        }
        // Première carte à droite
        if (d === 1) {
            return { 
                transform: 'translateX(70%) scale(0.85) rotateY(-15deg)', 
                zIndex: 5, 
                opacity: 0.85,
            };
        }
        // Première carte à gauche
        if (d === -1) {
            return { 
                transform: 'translateX(-70%) scale(0.85) rotateY(15deg)', 
                zIndex: 5, 
                opacity: 0.85,
            };
        }
        // Deuxième carte à droite
        if (d === 2) {
            return { 
                transform: 'translateX(120%) scale(0.7) rotateY(-25deg)', 
                zIndex: 2, 
                opacity: 0.6,
            };
        }
        // Deuxième carte à gauche
        if (d === -2) {
            return { 
                transform: 'translateX(-120%) scale(0.7) rotateY(25deg)', 
                zIndex: 2, 
                opacity: 0.6,
            };
        }
        return { display: 'none' };
    };

    // ── Handlers CRUD ─────────────────────────────────────────────────────────
    const handleAdd = async () => {
        console.log('Current formData state:', formData);
        
        setFormLoading(true);
        try {
            const formDataObj = new FormData();
            
            if (formData.nom) formDataObj.append('nom', formData.nom);
            if (formData.adresse) formDataObj.append('adresse', formData.adresse);
            if (formData.ninea) formDataObj.append('ninea', formData.ninea);
            if (formData.description) formDataObj.append('description', formData.description);
            if (formData.numero_telephone) formDataObj.append('numero_telephone', formData.numero_telephone);
            if (formData.type) formDataObj.append('type', formData.type);
            
            if (formData.image instanceof File) formDataObj.append('image', formData.image);
            if (formData.piece_identite instanceof File) formDataObj.append('piece_identite', formData.piece_identite);
            if (formData.justicatif_domicile instanceof File) formDataObj.append('justicatif_domicile', formData.justicatif_domicile);

            console.log('FormData contents:');
            for (let [key, value] of formDataObj.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institutions`, {
                method: 'POST',
                body: formDataObj,
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                console.error('Server error:', errorData.message);
                alert(errorData.message)
                throw new Error(errorData.detail || 'Erreur lors de l\'ajout');
            }
            
            await fetchInstitutions();
            setShowAddModal(false);
            resetForm();
        } catch (err) {
           // alert(err.message);
            
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async () => {
        setFormLoading(true);
        try {
            const hasFiles = (formData.image instanceof File) || 
                           (formData.piece_identite instanceof File) || 
                           (formData.justicatif_domicile instanceof File);

            let response;

            if (hasFiles) {
                const formDataObj = new FormData();
                
                if (formData.nom) formDataObj.append('nom', formData.nom);
                if (formData.adresse) formDataObj.append('adresse', formData.adresse);
                if (formData.ninea) formDataObj.append('ninea', formData.ninea);
                if (formData.description) formDataObj.append('description', formData.description);
                if (formData.numero_telephone) formDataObj.append('numero_telephone', formData.numero_telephone);
                if (formData.type) formDataObj.append('type', formData.type);
                
                if (formData.image instanceof File) formDataObj.append('image', formData.image);
                if (formData.piece_identite instanceof File) formDataObj.append('piece_identite', formData.piece_identite);
                if (formData.justicatif_domicile instanceof File) formDataObj.append('justicatif_domicile', formData.justicatif_domicile);

                response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institutions/${selectedInstitution.id}`, {
                    method: 'PATCH',
                    body: formDataObj,
                });
            } else {
                const jsonData = {
                    nom: formData.nom,
                    adresse: formData.adresse,
                    ninea: formData.ninea,
                    description: formData.description,
                    numero_telephone: formData.numero_telephone,
                    type: formData.type,
                };

                response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institutions/${selectedInstitution.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erreur lors de la modification');
            }
            
            await fetchInstitutions();
            setShowEditModal(false);
            resetForm();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institutions/${selectedInstitution.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');
            
            await fetchInstitutions();
            setShowDeleteModal(false);
            setSelectedInstitution(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            adresse: '',
            ninea: '',
            description: '',
            numero_telephone: '',
            type: 'musee',
            image: null,
            piece_identite: null,
            justicatif_domicile: null,
        });
        setSelectedInstitution(null);
    };

    const openEditModal = (institution) => {
        setSelectedInstitution(institution);
        setFormData({
            nom: institution.nom,
            adresse: institution.adresse,
            ninea: institution.ninea,
            description: institution.description,
            numero_telephone: institution.numero_telephone,
            type: institution.type,
            image: null,
            piece_identite: null,
            justicatif_domicile: null,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (institution) => {
        setSelectedInstitution(institution);
        setShowDeleteModal(true);
    };

    const openDetailsModal = (institution) => {
        setSelectedInstitution(institution);
        setShowDetailsModal(true);
    };

    const handleShare = async (institution) => {
        const shareUrl = `${window.location.origin}/visites/expositions?institution=${institution.id}`;
        const shareData = {
            title: institution.nom,
            text: `Découvrez les expositions de ${institution.nom}`,
            url: shareUrl,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Lien copié dans le presse-papiers !');
            }
        } catch (err) {
            // L'utilisateur a annulé le partage ou une erreur est survenue
        }
    };

    const handleValidate = async () => {
        if (!selectedInstitution) return;
        setValidating(true);
        try {
            const res = await fetch(`${apiUrl}${institutionsEndpoint}/auth/get-token/`,{
                credentials:"include",
             
            });
            const data=await res.json()
            const access_token=data.access_token
         
            const response = await fetch(`${apiUrl}${institutionsEndpoint}/api/institution/${selectedInstitution.id}/validate/`, {
                method: 'PATCH',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+access_token
                },
                body: JSON.stringify({ statut_validation: 'approved' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erreur lors de la validation');
            }
            
            await fetchInstitutions();
            setShowDetailsModal(false);
            setSelectedInstitution(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setValidating(false);
        }
    };

    // ── File input handler ────────────────────────────────────────────────────
    const handleFileChange = (field) => (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log(`File selected for ${field}:`, file.name);
            setFormData(prev => ({ ...prev, [field]: file }));
        }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════

    // ── Vue expositions d'une institution ──────────────────────────────────
    if (expoInstitution) {
         window.scrollTo({
      top: 0,
      behavior: "smooth" // défilement animé
    });
  
        return (
            <Expositions
            isVisitePage={true}
                institutionId={expoInstitution.id}
                institutionNom={expoInstitution.nom}
                onRetour={() => setExpoInstitution(null)}
                readOnly={isVisiteMode}
            />
        );
    }

    // ── Vue utilisateurs d'une institution ──────────────────────────────────
    if (usersInstitution) {
         window.scrollTo({
      top: 0,
      behavior: "smooth" // défilement animé
    });
        return (
            <Users
                institutionId={usersInstitution.id}
                institutionNom={usersInstitution.nom}
                onRetour={() => setUsersInstitution(null)}
            />
        );
    }

    if (biensInstitution) {
         window.scrollTo({
      top: 0,
      behavior: "smooth" // défilement animé
    });
        return (
            <BiensCulturels
                institutionId={biensInstitution.id}
                institutionNom={biensInstitution.nom}
                onRetour={() => setBiensInstitution(null)}
            />
        );
    }

    return (
        <>
            <style>{`
                /* ═══════════════════════════════════════════════════════════════
                   VARIABLES & BASE
                   ═══════════════════════════════════════════════════════════════ */
                .institutions-page {
                    --primary: #000000;
                    --primary-dark: #1a1a1a;
                    --danger: #ef4444;
                    --danger-dark: #dc2626;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --gray: #64748b;
                    
                    min-height: 100vh;
                    background: #ffffff;
                    padding: 40px 20px;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* ═══════════════════════════════════════════════════════════════
                   HEADER & NAVBAR
                   ═══════════════════════════════════════════════════════════════ */
                .page-header {
                    max-width: 1400px;
                    margin: 0 auto 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 30px;
                }

                .navbar-pill {
                    background: #ffffff;
                    border-radius: 50px;
                    border: 2px solid #000000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    padding: 6px 8px;
                    display: flex;
                    gap: 6px;
                }

                .nav-item {
                    padding: 14px 32px;
                    border-radius: 30px;
                    color: #000000;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 500;
                    font-size: 15px;
                    border: none;
                    background: transparent;
                }

                .nav-item:hover {
                    background: rgba(0, 0, 0, 0.08);
                }

                .nav-item.active {
                    background: #000000;
                    color: #ffffff;
                }

                /* ═══════════════════════════════════════════════════════════════
                   CONTROLS
                   ═══════════════════════════════════════════════════════════════ */
                .controls-bar {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8f9fa;
                    padding: 8px 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }

                .filter-label {
                    color: #374151;
                    font-size: 14px;
                }

                .filter-select {
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    color: #000;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                }

                .filter-select:focus {
                    border-color: #000000;
                    outline: none;
                }

                .btn-add {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #000000;
                    color: #fff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .btn-add:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }

                /* ═══════════════════════════════════════════════════════════════
                   CAROUSEL - STYLE IMAGE INCLINÉ & DRAG
                   ═══════════════════════════════════════════════════════════════ */
                .carousel-section {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 40px 20px 60px;
                    perspective: 1500px;
                }

                .carousel-track {
                    position: relative;
                    height: 480px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform-style: preserve-3d;
                    cursor: grab;
                    user-select: none;
                }
                
                .carousel-track:active {
                    cursor: grabbing;
                }

                .institution-card {
                    position: absolute;
                    width: 340px;
                    height: 480px;
                    border-radius: 24px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, box-shadow 0.6s ease;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
                    transform-style: preserve-3d;
                }

                .institution-card.active {
                    cursor: default;
                }

                .institution-card:not(.active):hover {
                    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.4);
                }

                /* Carousel Navigation */
                .carousel-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 40px;
                }

                .nav-arrow {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 2px solid #000000;
                    color: #000;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .nav-arrow:hover {
                    background: #000000;
                    color: #ffffff;
                    transform: scale(1.1);
                }

                .carousel-dots {
                    display: flex;
                    gap: 10px;
                }

                .carousel-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #d1d5db;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .carousel-dot.active {
                    background: #000000;
                    transform: scale(1.3);
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                }

                .card-background {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    pointer-events: none;
                }

                .card-gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to top,
                        rgba(0, 0, 0, 0.95) 0%,
                        rgba(0, 0, 0, 0.7) 40%,
                        rgba(0, 0, 0, 0.4) 100%
                    );
                    pointer-events: none;
                }

                .card-content {
                    position: relative;
                    z-index: 2;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 24px;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .card-type-badge {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #fff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .card-actions-top {
                    display: flex;
                    gap: 8px;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                }

                .card-actions-top.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .institution-card.active:hover .card-actions-top {
                    opacity: 1;
                    transform: translateY(0);
                }

                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-icon.edit {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    color: #fff;
                }

                .btn-icon.edit:hover {
                    background: rgba(255, 255, 255, 0.4);
                }

                .btn-icon.view {
                    background: rgba(59, 130, 246, 0.3);
                    backdrop-filter: blur(10px);
                    color: #93c5fd;
                }

                .btn-icon.view:hover {
                    background: rgba(59, 130, 246, 0.5);
                }

                .btn-icon.delete {
                    background: rgba(239, 68, 68, 0.3);
                    backdrop-filter: blur(10px);
                    color: #fca5a5;
                }

                .btn-icon.delete:hover {
                    background: rgba(239, 68, 68, 0.5);
                }

                .card-body {
                    margin-top: auto;
                    pointer-events: none;
                }
                
                /* Permettre le clic uniquement sur le menu d'actions de la carte active */
                .institution-card.active .card-header * {
                    pointer-events: auto;
                }

                .card-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 12px;
                    line-height: 1.2;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 12px;
                }

                .info-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 13px;
                }

                .info-row svg {
                    opacity: 0.7;
                    flex-shrink: 0;
                }

                .card-description {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* ═══════════════════════════════════════════════════════════════
                   EMPTY & LOADING STATES
                   ═══════════════════════════════════════════════════════════════ */
                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--gray);
                }

                .empty-state svg {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 24px;
                    opacity: 0.4;
                }

                .empty-state h3 {
                    font-size: 22px;
                    color: #000000;
                    margin: 0 0 12px;
                }

                .empty-state p {
                    font-size: 15px;
                    margin: 0;
                }

                .loading-state {
                    text-align: center;
                    padding: 100px 20px;
                    color: var(--gray);
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #000000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 24px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ═══════════════════════════════════════════════════════════════
                   MODALS
                   ═══════════════════════════════════════════════════════════════ */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-box {
                    background: #ffffff;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 560px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 28px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #000000;
                    margin: 0;
                }

                .modal-close {
                    background: #f3f4f6;
                    border: none;
                    border-radius: 10px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #fee2e2;
                    color: var(--danger);
                }

                .modal-body {
                    padding: 28px;
                }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .form-input, .form-select, .form-textarea {
                    background: #f9fafb;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: #000000;
                    font-size: 15px;
                    transition: all 0.2s;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #000000;
                    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-input::placeholder, .form-textarea::placeholder {
                    color: #9ca3af;
                }

                .file-upload {
                    position: relative;
                }

                .file-upload-area {
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .file-upload-area:hover {
                    border-color: #000000;
                    background: #f9fafb;
                }

                .file-upload-area.has-file {
                    border-color: var(--success);
                    background: #ecfdf5;
                }

                .file-upload-area svg {
                    color: var(--gray);
                    margin-bottom: 12px;
                }

                .file-upload-area p {
                    color: var(--gray);
                    font-size: 14px;
                    margin: 0;
                }

                .file-upload-area .file-name {
                    color: var(--success);
                    font-weight: 500;
                }

                .file-upload input {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                }

                /* Current image preview in edit modal */
                .current-image-preview {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                    padding: 10px;
                    background: #f3f4f6;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                }

                .current-image-preview img {
                    width: 80px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                }

                .current-image-preview span {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .current-image-preview.small {
                    padding: 8px;
                    gap: 8px;
                }

                .current-image-preview.small img {
                    width: 50px;
                    height: 40px;
                }

                .current-image-preview.small span {
                    font-size: 11px;
                }

                .modal-footer {
                    display: flex;
                    gap: 12px;
                    padding: 20px 28px;
                    border-top: 1px solid #e5e7eb;
                }

                .btn-modal {
                    flex: 1;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-cancel {
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    color: #374151;
                }

                .btn-cancel:hover {
                    background: #e5e7eb;
                }

                .btn-confirm {
                    background: #000000;
                    border: none;
                    color: #ffffff;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .btn-confirm:hover {
                    background: #1a1a1a;
                }

                .btn-confirm.danger {
                    background: #ef4444;
                    color: #ffffff;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }

                .btn-confirm.danger:hover {
                    background: #dc2626;
                }

                .btn-confirm.success {
                    background: #10b981;
                    color: #ffffff;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }

                .btn-confirm.success:hover {
                    background: #059669;
                }

                .btn-modal:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .delete-message {
                    text-align: center;
                    padding: 20px 0;
                }

                .delete-message p {
                    color: #374151;
                    font-size: 16px;
                    margin: 0 0 8px;
                }

                .delete-message strong {
                    color: #000000;
                }

                .delete-warning {
                    color: var(--danger);
                    font-size: 14px;
                }

                /* Modal Large */
                .modal-large {
                    max-width: 700px;
                }

                /* Details Content */
                .details-content {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .details-section {
                    background: #f9fafb;
                    border-radius: 16px;
                    padding: 20px;
                }

                .details-section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #000;
                    margin: 0 0 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-item.full-width {
                    grid-column: 1 / -1;
                }

                .detail-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    font-size: 15px;
                    color: #000;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    width: fit-content;
                }

                .status-badge.pending {
                    background: #fef3c7;
                    color: #d97706;
                }

                .status-badge.approved {
                    background: #d1fae5;
                    color: #059669;
                }

                .status-badge.rejected {
                    background: #fee2e2;
                    color: #dc2626;
                }

                /* Documents Grid */
                .documents-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .document-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .document-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #374151;
                }

                .document-image {
                    width: 100%;
                    height: 140px;
                    object-fit: cover;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .document-image:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .document-placeholder {
                    width: 100%;
                    height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    border-radius: 12px;
                    border: 2px dashed #d1d5db;
                    color: #9ca3af;
                    font-size: 13px;
                }

                /* ── Menu 3 points ── */
                .btn-icon.dots {
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(10px);
                    color: #fff;
                    position: relative;
                }
                .btn-icon.dots:hover { background: rgba(255,255,255,0.3); }

                .dots-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    min-width: 190px;
                    z-index: 50;
                    overflow: hidden;
                    animation: fadeIn 0.15s ease;
                }

                .dots-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #1a1a1a;
                    cursor: pointer;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    transition: background 0.15s;
                }
                .dots-menu-item:hover { background: #f3f4f6; }
                .dots-menu-item.expo { color: #6366f1; }
                .dots-menu-item.expo:hover { background: #ede9fe; }
                .dots-menu-item.danger { color: #ef4444; }
                .dots-menu-item.danger:hover { background: #fee2e2; }
                .dots-menu-divider { height: 1px; background: #e5e7eb; margin: 4px 0; }

                /* Responsive */
                @media (max-width: 768px) {
                    .carousel-track {
                        height: 420px;
                    }

                    .institution-card {
                        width: 280px;
                        height: 400px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .navbar-pill {
                        flex-direction: column;
                        border-radius: 20px;
                    }
                    
                    .nav-item {
                        text-align: center;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .documents-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="institutions-page">
                {/* ═══ HEADER ═══ */}
                <header className="page-header">
                    <nav className="navbar-pill">
                        <button 
                            className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            Liste des institutions
                        </button>
                    </nav>

                    <div className="controls-bar">
                        <div className="filter-group">
                            <span className="filter-label">Filtrer par type :</span>
                            <select 
                                className="filter-select"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                {TYPE_INSTITUTION_CHOICES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isVisiteMode && (
                            <button className="btn-add" onClick={() => setShowAddModal(true)}>
                                <PlusIcon /> Ajouter une institution
                            </button>
                        )}
                    </div>
                </header>

                {/* ═══ CONTENT ═══ */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Chargement des institutions...</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <p>Erreur : {error}</p>
                    </div>
                ) : filteredInstitutions.length === 0 ? (
                    <div className="empty-state">
                        <BuildingIcon />
                        <h3>Aucune institution trouvée</h3>
                        <p>
                            {activeTab === 'pending' 
                                ? 'Aucune institution en attente de validation.'
                                : 'Ajoutez votre première institution pour commencer.'}
                        </p>
                    </div>
                ) : (
                    <div className="carousel-section">
                        {/* Track avec les événements Mouse & Touch pour le drag progressif */}
                        <div 
                            className="carousel-track"
                            onMouseDown={(e) => handleDragStart(e.clientX)}
                            onMouseMove={(e) => handleDragMove(e.clientX)}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                            onTouchEnd={handleDragEnd}
                        >
                            {filteredInstitutions.map((institution, index) => {
                                const style = getCardStyle(index);
                                if (style.display === 'none') return null;
                                
                                const imageUrl = institution.image 
                                    ? `${institution.image}` 
                                    : image;
                                const typeLabel = TYPE_INSTITUTION_CHOICES.find(t => t.value === institution.type)?.label || institution.type;
                                const isActive = index === currentIndex;

                                return (
                                    <div 
                                        key={institution.id} 
                                        className={`institution-card ${isActive ? 'active' : ''}`}
                                        style={style}
                                        onClick={() => {
                                            if (!isActive) {
                                                setCurrentIndex(index);
                                            } else if (isVisiteMode) {
                                                setExpoInstitution({ id: institution.id, nom: institution.nom });
                                            }
                                        }}
                                    >
                                        <div 
                                            className="card-background" 
                                            style={{ backgroundImage: `url(${imageUrl})` }}
                                        />
                                        <div className="card-gradient-overlay" />
                                        
                                        <div className="card-content">
                                            <div className="card-header">
                                                <span className="card-type-badge">{typeLabel}</span>
                                                {isActive && (
                                                    <div className="card-actions-top visible" ref={openMenuId === institution.id ? menuRef : null} style={{ position: 'relative' }}>
                                                        <button
                                                            className="btn-icon dots"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setOpenMenuId(openMenuId === institution.id ? null : institution.id); 
                                                            }}
                                                            title="Actions"
                                                        >
                                                            <DotsIcon />
                                                        </button>
                                                        {openMenuId === institution.id && (
                                                            <div className="dots-menu" onClick={(e) => e.stopPropagation()}>
                                                                {isVisiteMode ? (
                                                                    <>
                                                                        <button className="dots-menu-item"
                                                                            onClick={() => { openDetailsModal(institution); setOpenMenuId(null); }}>
                                                                            <EyeIcon /> Informations
                                                                        </button>
                                                                        <button className="dots-menu-item"
                                                                            onClick={() => { handleShare(institution); setOpenMenuId(null); }}>
                                                                            <ShareIcon /> Partager
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button className="dots-menu-item expo"
                                                                            onClick={() => { setExpoInstitution({ id: institution.id, nom: institution.nom }); setOpenMenuId(null); }}>
                                                                            <ExpoIcon /> les expositions
                                                                        </button>
                                                                        <button className="dots-menu-item"
                                                                            style={{ color: '#0ea5e9' }}
                                                                            onClick={() => { setUsersInstitution({ id: institution.id, nom: institution.nom }); setOpenMenuId(null); }}>
                                                                            <UsersIcon /> les utilisateurs
                                                                        </button>
                                                                        <button className="dots-menu-item"
                                                                            style={{ color: '#0ea5e9' }}
                                                                            onClick={() => { setBiensInstitution({ id: institution.id, nom: institution.nom }); setOpenMenuId(null); }}>
                                                                            <UsersIcon /> les biens
                                                                        </button>
                                                                        <button className="dots-menu-item"
                                                                            onClick={() => { openDetailsModal(institution); setOpenMenuId(null); }}>
                                                                            <EyeIcon /> Voir les détails
                                                                        </button>
                                                                        <button className="dots-menu-item"
                                                                            onClick={() => { openEditModal(institution); setOpenMenuId(null); }}>
                                                                            <PencilIcon /> Modifier
                                                                        </button>
                                                                        <div className="dots-menu-divider" />
                                                                        <button className="dots-menu-item danger"
                                                                            onClick={() => { openDeleteModal(institution); setOpenMenuId(null); }}>
                                                                            <TrashIcon /> Supprimer
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="card-body">
                                                <h3 className="card-title">{institution.nom}</h3>
                                                {isActive && (
                                                    <>
                                                        <div className="card-info">
                                                            <div className="info-row">
                                                                <LocationIcon />
                                                                <span>{institution.adresse}</span>
                                                            </div>
                                                            <div className="info-row">
                                                                <PhoneIcon />
                                                                <span>{institution.numero_telephone}</span>
                                                            </div>
                                                        </div>
                                                        <p className="card-description">{institution.description}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Navigation */}
                        <div className="carousel-nav">
                            <button className="nav-arrow" onClick={prevSlide}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div className="carousel-dots">
                                {filteredInstitutions.map((_, i) => (
                                    <button 
                                        key={i} 
                                        className={`carousel-dot ${i === currentIndex ? 'active' : ''}`} 
                                        onClick={() => setCurrentIndex(i)} 
                                    />
                                ))}
                            </div>
                            <button className="nav-arrow" onClick={nextSlide}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ MODAL AJOUTER ═══ */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ajouter une institution</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label className="form-label">Nom de l'institution</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ex: Musée des Civilisations"
                                        value={formData.nom}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Type d'institution</label>
                                        <select
                                            className="form-select"
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            {TYPE_INSTITUTION_CHOICES.filter(t => t.value !== 'all').map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">NINEA (13 chiffres)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="0000000000000"
                                            maxLength={13}
                                            value={formData.ninea}
                                            onChange={(e) => setFormData(prev => ({ ...prev, ninea: e.target.value.replace(/\D/g, '') }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ex: Dakar, Plateau"
                                        value={formData.adresse}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Numéro de téléphone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="+221 77 123 45 67"
                                        value={formData.numero_telephone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, numero_telephone: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Décrivez l'institution..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Image de l'institution</label>
                                    <div className="file-upload">
                                        <div className={`file-upload-area ${formData.image ? 'has-file' : ''}`}>
                                            <UploadIcon />
                                            <p>
                                                {formData.image 
                                                    ? <span className="file-name">{formData.image.name}</span>
                                                    : 'Cliquez pour sélectionner une image'}
                                            </p>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange('image')} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    
                                    
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>
                                Annuler
                            </button>
                            <button className="btn-modal btn-confirm" onClick={handleAdd} disabled={formLoading}>
                                {formLoading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL MODIFIER ═══ */}
            {showEditModal && selectedInstitution && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Modifier l'institution</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label className="form-label">Nom de l'institution</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.nom}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Type d'institution</label>
                                        <select
                                            className="form-select"
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            {TYPE_INSTITUTION_CHOICES.filter(t => t.value !== 'all').map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">NINEA</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            maxLength={13}
                                            value={formData.ninea}
                                            onChange={(e) => setFormData(prev => ({ ...prev, ninea: e.target.value.replace(/\D/g, '') }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.adresse}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Numéro de téléphone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.numero_telephone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, numero_telephone: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                {/* Image de l'institution */}
                                <div className="form-group">
                                    <label className="form-label">Image de l'institution</label>
                                    {selectedInstitution.image && !formData.image && (
                                        <div className="current-image-preview">
                                            <img 
                                                src={`${selectedInstitution.image}`} 
                                                alt="Image actuelle" 
                                            />
                                            <span>Image actuelle</span>
                                        </div>
                                    )}
                                    <div className="file-upload">
                                        <div className={`file-upload-area ${formData.image ? 'has-file' : ''}`}>
                                            <UploadIcon />
                                            <p>
                                                {formData.image 
                                                    ? <span className="file-name">{formData.image.name}</span>
                                                    : 'Cliquez pour changer l\'image'}
                                            </p>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange('image')} />
                                    </div>
                                </div>

                               
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => { setShowEditModal(false); resetForm(); }}>
                                Annuler
                            </button>
                            <button className="btn-modal btn-confirm" onClick={handleEdit} disabled={formLoading}>
                                <PencilIcon /> {formLoading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL SUPPRIMER ═══ */}
            {showDeleteModal && selectedInstitution && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Supprimer l'institution</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="delete-message">
                                <p>Êtes-vous sûr de vouloir supprimer <strong>"{selectedInstitution.nom}"</strong> ?</p>
                                <p className="delete-warning">Cette action est irréversible.</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Annuler
                            </button>
                            <button className="btn-modal btn-confirm danger" onClick={handleDelete} disabled={formLoading}>
                                <TrashIcon /> {formLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODAL DÉTAILS ═══ */}
            {showDetailsModal && selectedInstitution && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-box modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Détails de l'institution</h2>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="details-content">
                                {/* Infos principales */}
                                <div className="details-section">
                                    <h3 className="details-section-title">Informations générales</h3>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Nom</span>
                                            <span className="detail-value">{selectedInstitution.nom}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Type</span>
                                            <span className="detail-value">
                                                {TYPE_INSTITUTION_CHOICES.find(t => t.value === selectedInstitution.type)?.label || selectedInstitution.type}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">NINEA</span>
                                            <span className="detail-value">{selectedInstitution.ninea}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Téléphone</span>
                                            <span className="detail-value">{selectedInstitution.numero_telephone}</span>
                                        </div>
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Adresse</span>
                                            <span className="detail-value">{selectedInstitution.adresse}</span>
                                        </div>
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Description</span>
                                            <span className="detail-value">{selectedInstitution.description}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Statut</span>
                                            <span className={`status-badge ${selectedInstitution.statut_validation}`}>
                                                {STATUT_VALIDATION[selectedInstitution.statut_validation]?.label || selectedInstitution.statut_validation}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="details-section">
                                    <h3 className="details-section-title">Documents</h3>
                                    <div className="documents-grid">
                                        <div className="document-item">
                                            <span className="document-label">Image de l'institution</span>
                                            {selectedInstitution.image ? (
                                                <img 
                                                    src={`${selectedInstitution.image}`} 
                                                    alt="Institution" 
                                                    className="document-image"
                                                    onClick={() => window.open(`${selectedInstitution.image}`, '_blank')}
                                                />
                                            ) : (
                                                <div className="document-placeholder">Aucune image</div>
                                            )}
                                        </div>
                                        
                                       
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal btn-cancel" onClick={() => setShowDetailsModal(false)}>
                                Fermer
                            </button>
                            {!isVisiteMode && selectedInstitution.statut_validation !== 'approved' && (
                                <button className="btn-modal btn-confirm success" onClick={handleValidate} disabled={validating}>
                                    <CheckIcon /> {validating ? 'Validation...' : 'Valider l\'institution'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}