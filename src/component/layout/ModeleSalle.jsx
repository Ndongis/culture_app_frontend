import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from "react-router-dom";

// ── API Configuration ───────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8282';
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const exposEndpoint = import.meta.env.VITE_EXPO_ENDPOINT;

const MODELE_SALLE_API = `${apiUrl}${exposEndpoint}/api/modeles_salle`;
  import axios from "axios";

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

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CubeIcon = ({ size = 12 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const ImageIcon = ({ size = 48 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

// ── Generic Carousel ─────────────────────────────────────────────────────────
function Carousel({ items, current, setCurrent, renderCard }) {
    const total = items.length;
    const prev = () => setCurrent((c) => (c - 1 + total) % total);
    const next = () => setCurrent((c) => (c + 1) % total);

    // Refs toujours à jour pour éviter stale closure dans les handlers touch
    const totalRef = useRef(total);
    const setCurrentRef = useRef(setCurrent);
    useLayoutEffect(() => {
        totalRef.current = total;
        setCurrentRef.current = setCurrent;
    });

    // ── Drag souris ─────────────────────────────────────────────────────────
    const dragState = useRef({ dragging: false, startX: 0, offsetX: 0, moved: false });
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const onMouseDown = (e) => {
        dragState.current = { dragging: true, startX: e.clientX, offsetX: 0, moved: false };
        setIsDragging(true);
    };
    const onMouseMove = (e) => {
        if (!dragState.current.dragging) return;
        const dx = e.clientX - dragState.current.startX;
        dragState.current.offsetX = dx;
        dragState.current.moved = Math.abs(dx) > 5;
        setDragOffset(dx);
    };
    const onMouseUp = () => {
        if (!dragState.current.dragging) return;
        const dx = dragState.current.offsetX;
        dragState.current.dragging = false;
        setIsDragging(false);
        setDragOffset(0);
        if (Math.abs(dx) > 60) { dx < 0 ? next() : prev(); }
    };

    // ── Swipe tactile ───────────────────────────────────────────────────────
    const touchState = useRef({ startX: 0, startY: 0, offsetX: 0, locked: null });

    const onTouchStart = (e) => {
        touchState.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, offsetX: 0, locked: null };
        setIsDragging(true);
    };
    const onTouchMove = (e) => {
        const t = touchState.current;
        const dx = e.touches[0].clientX - t.startX;
        const dy = e.touches[0].clientY - t.startY;
        if (t.locked === null) {
            if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
            t.locked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
        if (t.locked === 'v') return;
        t.offsetX = dx;
        setDragOffset(dx);
    };
    const onTouchEnd = () => {
        const dx = touchState.current.offsetX;
        const locked = touchState.current.locked;
        setIsDragging(false);
        setDragOffset(0);
        if (locked === 'h' && Math.abs(dx) > 40) {
            const t = totalRef.current;
            const sc = setCurrentRef.current;
            if (dx < 0) sc((c) => (c + 1) % t);
            else        sc((c) => (c - 1 + t) % t);
        }
    };

    const getStyle = (index) => {
        const diff = ((index - current) % total + total) % total;
        const d = diff <= total / 2 ? diff : diff - total;
        const transition = isDragging ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        const pct = isDragging ? dragOffset / 500 : 0;

        if (d === 0) {
            const tx = isDragging ? dragOffset * 0.6 : 0;
            const sc = isDragging ? 1 - Math.abs(pct) * 0.18 : 1;
            return { transform: `translateX(${tx}px) scale(${sc})`, zIndex: 10, opacity: 1, transition };
        }
        if (Math.abs(d) === 1) {
            const dir = d > 0 ? 1 : -1;
            const baseX = dir * 58;
            const comingIn = (dragOffset < 0 && dir === 1) || (dragOffset > 0 && dir === -1);
            const tx = isDragging
                ? `calc(${baseX}% + ${dragOffset * 0.6 + (comingIn ? dragOffset * 0.4 * -dir : 0)}px)`
                : `${baseX}%`;
            const sc = isDragging && comingIn ? 0.82 + Math.abs(pct) * 0.18 : 0.82;
            const zIndex = comingIn ? 9 : 5;
            return { transform: `translateX(${tx}) scale(${sc})`, zIndex, opacity: Math.max(0.4, 0.75 - Math.abs(pct) * 0.3), transition };
        }
        if (Math.abs(d) === 2) {
            const dir = d > 0 ? 1 : -1;
            return { transform: `translateX(${dir * 93}%) scale(0.67)`, zIndex: 2, opacity: 0.4, transition };
        }
        return { display: 'none' };
    };

    return (
        <div
            className="carousel-wrapper"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDragStart={(e) => e.preventDefault()}
            style={{ touchAction: 'none', userSelect: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className="carousel-track">
                {items.map((item, index) => {
                    const style = getStyle(index);
                    if (style.display === 'none') return null;
                    return (
                        <div
                            key={item.id}
                            className="modele-card"
                            style={style}
                            draggable="false"
                            onClick={() => {
                                if (dragState.current.moved) return;
                                if (touchState.current.locked === 'h' && Math.abs(touchState.current.offsetX) > 40) return;
                                if (index !== current) setCurrent(index);
                            }}
                        >
                            {renderCard(item, index === current)}
                        </div>
                    );
                })}
            </div>
            <div className="carousel-nav">
                <button className="nav-arrow" onClick={prev}>&#8592;</button>
                <div className="dots">
                    {items.map((_, i) => (
                        <button 
                            key={i} 
                            className={`dot ${i === current ? 'active' : ''}`} 
                            onClick={() => setCurrent(i)} 
                        />
                    ))}
                </div>
                <button className="nav-arrow" onClick={next}>&#8594;</button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ModeleSalle() {
    const navigate = useNavigate();
    
    // ── State ────────────────────────────────────────────────────────────────
    const [modeles, setModeles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // ── Modal states ─────────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'modifier' | 'supprimer'
    const [selectedModele, setSelectedModele] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // ── Form data ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    // ── Fetch modèles ────────────────────────────────────────────────────────
    useEffect(() => {
        fetchModeles();
    }, []);

    const fetchModeles = () => {
        setLoading(true);
        fetch(MODELE_SALLE_API)
            .then((res) => {
                if (!res.ok) throw new Error('Erreur de chargement des modèles');
                return res.json();
            })
            .then((data) => {
                setModeles(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    // ── Helper: Get full image URL ───────────────────────────────────────────
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${apiUrl}${exposEndpoint}${imagePath}`;
    };

    // ── Handle image selection ───────────────────────────────────────────────
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ── Open modal for edit/delete ───────────────────────────────────────────
    const handleAction = (type, modele) => {
        setModalType(type);
        setSelectedModele(modele);
        if (type === 'modifier') {
            setFormData({
                nom: modele.nom,
                description: modele.description,
                image: null
            });
            setImagePreview(getImageUrl(modele.image));
        }
        setShowModal(true);
    };

    // ── Open add modal ───────────────────────────────────────────────────────
    const openAddModal = () => {
        setFormData({ nom: '', description: '', image: null });
        setImagePreview(null);
        setShowAddModal(true);
    };

    // ── CRUD: Create ─────────────────────────────────────────────────────────
  

const handleAdd = async () => {
    if (!formData.nom.trim()) {
        alert("Le nom est requis");
        return;
    }

    setFormLoading(true);

    try {
        let response;

        if (formData.image) {
            // Avec image : FormData
            const submitData = new FormData();
            submitData.append("nom", formData.nom);
            submitData.append("description", formData.description);
            submitData.append("image", formData.image);

            response = await axios.post(
                MODELE_SALLE_API,
                submitData,
                {
                    withCredentials: true,
                    // Ne pas définir Content-Type, Axios le fait automatiquement
                }
            );
        } else {
            // Sans image : JSON
            response = await axios.post(
                MODELE_SALLE_API,
                {
                    nom: formData.nom,
                    description: formData.description,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const created = response.data;

        setModeles((prev) => [...prev, created]);
        setCurrentIndex(modeles.length);
        setShowAddModal(false);
        setFormData({
            nom: "",
            description: "",
            image: null,
        });
        setImagePreview(null);

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
    // ── CRUD: Update ─────────────────────────────────────────────────────────
    // ── CRUD: Update ─────────────────────────────────────────────────────────
const handleUpdate = async () => {
    if (!formData.nom.trim()) {
        alert("Le nom est requis");
        return;
    }

    setFormLoading(true);

    try {
        let response;

        const url = `${apiUrl}${exposEndpoint}/api/modeles_salle/${selectedModele.id}`;

        if (formData.image) {
            // Avec nouvelle image : FormData
            const submitData = new FormData();
            submitData.append("nom", formData.nom);
            submitData.append("description", formData.description);
            submitData.append("image", formData.image);

            response = await axios.patch(url, submitData, {
                withCredentials: true,
            });
        } else {
            // Sans nouvelle image : JSON
            response = await axios.patch(
                url,
                {
                    nom: formData.nom,
                    description: formData.description,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const updated = response.data;

        setModeles((prev) =>
            prev.map((m) =>
                m.id === selectedModele.id ? updated : m
            )
        );

        setShowModal(false);

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

    // ── CRUD: Delete ─────────────────────────────────────────────────────────
const handleDelete = async () => {
    setFormLoading(true);

    try {
        await axios.delete(
            `${apiUrl}${exposEndpoint}/api/modeles_salle/${selectedModele.id}`,
            {
                withCredentials: true,
            }
        );

        setModeles((prev) =>
            prev.filter((m) => m.id !== selectedModele.id)
        );

        setCurrentIndex((c) =>
            Math.max(0, c >= modeles.length - 1 ? c - 1 : c)
        );

        setShowModal(false);

    } catch (err) {
        const message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la suppression";

        alert(message);
    } finally {
        setFormLoading(false);
    }
};

    // ── Card renderer ────────────────────────────────────────────────────────
    const renderModeleCard = (modele, isActive) => {
        const imageUrl = getImageUrl(modele.image);

        return (
            <>
                {/* Image or placeholder */}
                {imageUrl ? (
                    <img src={imageUrl} alt={modele.nom} />
                ) : (
                    <div className="no-image-placeholder">
                        <ImageIcon size={48} />
                        <span>Aucune image</span>
                    </div>
                )}
                
                <div className="modele-card-overlay" />

                {/* Top action buttons (only on active card) */}
                {isActive && (
                    <div className="modele-card-top">
                        <button
                            className="btn-card-action"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction('modifier', modele);
                            }}
                        >
                            <PencilIcon /> Modifier
                        </button>
                        <button
                            className="btn-card-action delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction('supprimer', modele);
                            }}
                        >
                            <TrashIcon /> Supprimer
                        </button>
                    </div>
                )}

                {/* Bottom info (only on active card) */}
                {isActive && (
                    <div className="modele-card-bottom">
                        <div className="modele-card-info">
                            <p className="modele-card-name">{modele.nom}</p>
                            <p className="modele-card-desc">
                                {modele.description || 'Aucune description'}
                            </p>
                        </div>
                        <div className="modele-card-badge">
                            <CubeIcon size={14} />
                            <span>Modèle 3D</span>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

                .modele-page {
                    font-family: 'DM Sans', sans-serif;
                    min-height: 100%;
                    background: #fff;
                    padding: 2rem 2rem 3rem;
                }

                /* ── Header ── */
                .modele-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3rem;
                }

                .modele-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.4rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    border-left: 4px solid #1a1a1a;
                    padding-left: 1rem;
                    margin: 0;
                    line-height: 1.1;
                }

                .modele-title .modele-subtitle {
                    display: block;
                    font-size: 1rem;
                    font-weight: 400;
                    color: #888;
                    font-family: 'DM Sans', sans-serif;
                    margin-top: 0.2rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn-add-modele {
                    background: transparent;
                    border: 2px solid #1a1a1a;
                    border-radius: 50px;
                    padding: 0.55rem 1.6rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #1a1a1a;
                    cursor: pointer;
                    transition: all 0.25s;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .btn-add-modele:hover {
                    background: #1a1a1a;
                    color: white;
                }

                /* ── Carousel ── */
                .carousel-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                .carousel-track {
                    position: relative;
                    width: 100%;
                    height: 320px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modele-card {
                    position: absolute;
                    width: 500px;
                    height: 350px;
                    border-radius: 18px;
                    overflow: hidden;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                    background: #f5f5f5;
                }

                .modele-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .no-image-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: rgba(255,255,255,0.7);
                    gap: 0.5rem;
                }
                .no-image-placeholder span {
                    font-size: 0.85rem;
                    font-weight: 400;
                }

                .modele-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%);
                    pointer-events: none;
                }

                /* ── Card top buttons ── */
                .modele-card-top {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    display: flex;
                    gap: 0.45rem;
                    z-index: 2;
                }

                .btn-card-action {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    background: rgba(255,255,255,0.18);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.35);
                    border-radius: 20px;
                    color: white;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.76rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0.28rem 0.65rem;
                    transition: all 0.2s;
                }
                .btn-card-action:hover {
                    background: rgba(255,255,255,0.32);
                }
                .btn-card-action.delete:hover {
                    background: rgba(239,68,68,0.65);
                    border-color: rgba(239,68,68,0.5);
                }

                /* ── Card bottom info ── */
                .modele-card-bottom {
                    position: absolute;
                    bottom: 1rem;
                    left: 1rem;
                    right: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    z-index: 2;
                }

                .modele-card-info {
                    border-left: 3px solid white;
                    padding-left: 0.65rem;
                    flex: 1;
                    min-width: 0;
                }

                .modele-card-name {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 0.15rem;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .modele-card-desc {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.85);
                    margin: 0;
                    font-weight: 300;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .modele-card-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: rgba(99, 102, 241, 0.85);
                    backdrop-filter: blur(8px);
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.72rem;
                    font-weight: 500;
                    flex-shrink: 0;
                    margin-left: 0.75rem;
                }

                /* ── Navigation ── */
                .carousel-nav {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1.75rem;
                }

                .nav-arrow {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 1.1rem;
                    padding: 0.2rem 0.4rem;
                    transition: color 0.2s;
                    line-height: 1;
                }
                .nav-arrow:hover {
                    color: #1a1a1a;
                }

                .dots {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #ccc;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: background 0.3s;
                }
                .dot.active {
                    background: #6366f1;
                }

                /* ── Empty state ── */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #999;
                }
                .empty-state svg {
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                .empty-state p {
                    font-size: 1rem;
                    margin: 0 0 1.5rem;
                }
                .empty-state .btn-add-modele {
                    margin: 0 auto;
                }

                /* ── Modal ── */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-box {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    width: 480px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }

                .modal-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.6rem;
                    font-weight: 600;
                    margin: 0 0 1.5rem;
                    color: #1a1a1a;
                }

                .modal-form label {
                    display: block;
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: #555;
                    margin-bottom: 0.35rem;
                    margin-top: 1rem;
                }
                .modal-form label:first-child {
                    margin-top: 0;
                }

                .modal-form input[type="text"],
                .modal-form textarea {
                    width: 100%;
                    border: 1.5px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 0.6rem 0.9rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                    resize: none;
                }
                .modal-form input[type="text"]:focus,
                .modal-form textarea:focus {
                    border-color: #6366f1;
                }

                /* ── Image upload ── */
                .image-upload-area {
                    margin-top: 0.5rem;
                    border: 2px dashed #e0e0e0;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fafafa;
                }
                .image-upload-area:hover {
                    border-color: #6366f1;
                    background: #f5f5ff;
                }
                .image-upload-area.has-image {
                    padding: 0.5rem;
                }
                .image-upload-area input[type="file"] {
                    display: none;
                }
                .image-upload-area .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: #888;
                }
                .image-upload-area .upload-content span {
                    font-size: 0.85rem;
                }
                .image-upload-area .upload-hint {
                    font-size: 0.75rem;
                    color: #aaa;
                }

                .image-preview {
                    position: relative;
                    width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    max-height: 200px;
                }
                .image-preview .change-image-btn {
                    position: absolute;
                    bottom: 0.5rem;
                    right: 0.5rem;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 0.35rem 0.7rem;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .image-preview .change-image-btn:hover {
                    background: rgba(0,0,0,0.8);
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 1.75rem;
                }

                .btn-cancel {
                    background: transparent;
                    border: 1.5px solid #ccc;
                    border-radius: 8px;
                    padding: 0.55rem 1.3rem;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.88rem;
                    color: #555;
                    transition: all 0.2s;
                }
                .btn-cancel:hover {
                    border-color: #999;
                    color: #333;
                }

                .btn-confirm {
                    border: none;
                    border-radius: 8px;
                    padding: 0.55rem 1.3rem;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.88rem;
                    font-weight: 500;
                    color: white;
                    transition: opacity 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .btn-confirm.danger {
                    background: #ef4444;
                }
                .btn-confirm.primary {
                    background: #6366f1;
                }
                .btn-confirm:hover {
                    opacity: 0.85;
                }
                .btn-confirm:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .delete-warning {
                    color: #555;
                    font-size: 0.9rem;
                    margin: 0.5rem 0 0;
                    line-height: 1.6;
                }

                .status-msg {
                    text-align: center;
                    padding: 4rem;
                    font-size: 1rem;
                }
                .status-msg.error {
                    color: #ef4444;
                }
            `}</style>

            <div className="modele-page">
                {/* ── Header ── */}
                <div className="modele-header">
                    <div>
                        <h1 className="modele-title">
                            Modèles de Salle
                            <span className="modele-subtitle">
                                {modeles.length} modèle{modeles.length !== 1 ? 's' : ''} disponible{modeles.length !== 1 ? 's' : ''}
                            </span>
                        </h1>
                    </div>

                    <div className="header-actions">
                        <button className="btn-add-modele" onClick={openAddModal}>
                            <PlusIcon />
                            Ajouter un Modèle
                        </button>
                    </div>
                </div>

                {/* ── States ── */}
                {loading && <div className="status-msg">Chargement des modèles...</div>}
                {error && <div className="status-msg error">⚠️ {error}</div>}

                {/* ── Content ── */}
                {!loading && !error && (
                    modeles.length === 0 ? (
                        <div className="empty-state">
                            <CubeIcon size={64} />
                            <p>Aucun modèle de salle disponible.</p>
                            <button className="btn-add-modele" onClick={openAddModal}>
                                <PlusIcon />
                                Créer votre premier modèle
                            </button>
                        </div>
                    ) : (
                        <Carousel
                            items={modeles}
                            current={currentIndex}
                            setCurrent={setCurrentIndex}
                            renderCard={renderModeleCard}
                        />
                    )
                )}
            </div>

            {/* ── Modal Modifier / Supprimer ── */}
            {showModal && selectedModele && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        {modalType === 'modifier' ? (
                            <>
                                <h2 className="modal-title">Modifier le modèle</h2>
                                <div className="modal-form">
                                    <label>Nom du modèle</label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    />

                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />

                                    <label>Image</label>
                                    <div
                                        className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
                                        onClick={() => document.getElementById('edit-image-input').click()}
                                    >
                                        <input
                                            id="edit-image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview ? (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" />
                                                <button className="change-image-btn" type="button">
                                                    Changer
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-content">
                                                <UploadIcon />
                                                <span>Cliquez pour ajouter une image</span>
                                                <span className="upload-hint">PNG, JPG jusqu'à 5MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button
                                        className="btn-confirm primary"
                                        onClick={handleUpdate}
                                        disabled={formLoading}
                                    >
                                        <PencilIcon />
                                        {formLoading ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="modal-title">Supprimer le modèle</h2>
                                <p className="delete-warning">
                                    Êtes-vous sûr de vouloir supprimer <strong>"{selectedModele.nom}"</strong> ?
                                    <br />
                                    Cette action est irréversible.
                                </p>
                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button
                                        className="btn-confirm danger"
                                        onClick={handleDelete}
                                        disabled={formLoading}
                                    >
                                        <TrashIcon />
                                        {formLoading ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal Ajouter ── */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Ajouter un modèle</h2>
                        <div className="modal-form">
                            <label>Nom du modèle</label>
                            <input
                                type="text"
                                placeholder="Ex: Galerie Moderne"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            />

                            <label>Description</label>
                            <textarea
                                rows={3}
                                placeholder="Décrivez ce modèle de salle..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <label>Image</label>
                            <div
                                className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
                                onClick={() => document.getElementById('add-image-input').click()}
                            >
                                <input
                                    id="add-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button className="change-image-btn" type="button">
                                            Changer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-content">
                                        <UploadIcon />
                                        <span>Cliquez pour ajouter une image</span>
                                        <span className="upload-hint">PNG, JPG jusqu'à 5MB</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                Annuler
                            </button>
                            <button
                                className="btn-confirm primary"
                                onClick={handleAdd}
                                disabled={formLoading}
                            >
                                {formLoading ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}