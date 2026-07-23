import React, { useRef } from 'react';
import OrnementBackground from './OrnementBackground';
import { useContext } from "react";
import { AuthContext } from './context/AuthContext';
// ── Icons partagés ────────────────────────────────────────────────────────────
export const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
export const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);
export const BoxIcon = ({ size = 14, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" width={size} height={size}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);
export const RoomIcon = ({ size = 12 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);
export const UploadIcon = ({ size = 16 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);
export const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
export const GridIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

/**
 * ExpoCarousel
 * ─────────────────────────────────────────────────────────────
 * @param {Array}    items        - liste des items à afficher
 * @param {number}   current      - index de la card active
 * @param {Function} setCurrent   - setter de l'index actif
 * @param {Function} renderCard   - (item, isActive) => JSX
 * @param {boolean}  is_ornement  - afficher le fond animé OrnementBackground
 */
export default function ExpoCarousel({ items, current, setCurrent, renderCard, is_ornement = false }) {
    const wrapperRef = useRef(null);
    const total = items.length;
    const authContext = useContext(AuthContext);
    const user = authContext?.user ?? null;

    // Refs toujours à jour pour éviter stale closure dans les handlers
    const totalRef = React.useRef(total);
    const setCurrentRef = React.useRef(setCurrent);
    React.useLayoutEffect(() => {
        totalRef.current = total;
        setCurrentRef.current = setCurrent;
    });

    // ── Roue à inertie ──────────────────────────────────────────────────────
    // posRef : position continue (peut être fractionnaire) de la "roue".
    // Quand on glisse, posRef avance en continu ; au relâché, si la vitesse est
    // grande, la roue continue de tourner puis ralentit (friction) avant de
    // s'aligner sur la carte la plus proche — comme une roue qu'on lance.
    const posRef = React.useRef(current);
    const draggingRef = React.useRef(false);
    const rafRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [, forceRender] = React.useReducer((n) => n + 1, 0);

    const dragRef = React.useRef({
        startX: 0, startY: 0, startPos: 0,
        lastX: 0, lastT: 0, vx: 0,
        sensitivity: 300, moved: false, locked: null,
    });

    // Resynchronise la position continue quand `current` change depuis
    // l'extérieur (clic sur un point, filtre réinitialisé, etc.)
    React.useEffect(() => {
        if (!draggingRef.current) {
            cancelMomentum();
            posRef.current = current;
            forceRender();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    React.useEffect(() => () => cancelMomentum(), []);

    function cancelMomentum() {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }

    // Anime en douceur posRef.current jusqu'à targetPos (float), puis fixe `current`
    const animateTo = (targetPos) => {
        cancelMomentum();
        const startPos = posRef.current;
        const delta = targetPos - startPos;
        const duration = 320;
        const startT = performance.now();

        const step = (now) => {
            const t = Math.min(1, (now - startT) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            posRef.current = startPos + delta * eased;
            forceRender();
            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                rafRef.current = null;
                const maxIdx = totalRef.current - 1;
                const finalIndex = Math.min(maxIdx, Math.max(0, Math.round(posRef.current)));
                posRef.current = finalIndex;
                forceRender();
                setCurrentRef.current(finalIndex);
            }
        };
        rafRef.current = requestAnimationFrame(step);
    };

    // Va vers l'index cible (borné, plus de bouclage début/fin)
    const goTo = (targetIndex) => {
        const maxIdx = totalRef.current - 1;
        const clamped = Math.min(maxIdx, Math.max(0, targetIndex));
        animateTo(clamped);
    };

    const snapToNearest = () => animateTo(Math.round(posRef.current));

    // Lance la roue avec une vitesse initiale (px/ms de déplacement de pointeur)
    // puis la fait ralentir par friction, comme une roue qu'on a fait tourner fort.
    const applyMomentum = (vxPxPerMs) => {
        cancelMomentum();
        let velIndexPerMs = -vxPxPerMs / dragRef.current.sensitivity;
        let lastT = performance.now();

        const step = (now) => {
            const dt = Math.min(48, now - lastT);
            lastT = now;

            const decay = Math.exp(-dt * 0.0055); // friction de la roue
            velIndexPerMs *= decay;
            posRef.current += velIndexPerMs * dt;

            const maxIdx = totalRef.current - 1;
            if (posRef.current <= 0 || posRef.current >= maxIdx) {
                posRef.current = Math.min(maxIdx, Math.max(0, posRef.current));
                velIndexPerMs = 0;
            }
            forceRender();

            if (Math.abs(velIndexPerMs) > 0.00006) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                rafRef.current = null;
                snapToNearest();
            }
        };
        rafRef.current = requestAnimationFrame(step);
    };

    const prev = () => goTo(Math.round(posRef.current) - 1);
    const next = () => goTo(Math.round(posRef.current) + 1);

    // ── Démarrage / suivi / fin du glissement (souris + tactile unifiés) ────
    const startDrag = (clientX, clientY) => {
        cancelMomentum();
        draggingRef.current = true;
        setIsDragging(true);
        const sensitivity = Math.max(160, (wrapperRef.current?.offsetWidth || 600) * 0.55);
        dragRef.current = {
            startX: clientX, startY: clientY, startPos: posRef.current,
            lastX: clientX, lastT: performance.now(), vx: 0,
            sensitivity, moved: false,
            locked: clientY == null ? 'h' : null,
        };
    };

    const moveDrag = (clientX, clientY) => {
        if (!draggingRef.current) return;
        const d = dragRef.current;

        if (d.locked === null) {
            const dx0 = clientX - d.startX;
            const dy0 = clientY - d.startY;
            if (Math.abs(dx0) < 4 && Math.abs(dy0) < 4) return;
            d.locked = Math.abs(dx0) > Math.abs(dy0) ? 'h' : 'v';
            if (d.locked === 'v') { draggingRef.current = false; setIsDragging(false); return; }
        }
        if (d.locked === 'v') return;

        const now = performance.now();
        const dx = clientX - d.startX;

        // La roue tourne proportionnellement au glissement (comportement "wheel")
        const raw = d.startPos - dx / d.sensitivity;
        const maxIdx = totalRef.current - 1;
        // Petite résistance élastique aux extrémités (plus de bouclage début/fin)
        posRef.current = raw < 0
            ? raw * 0.35
            : raw > maxIdx
                ? maxIdx + (raw - maxIdx) * 0.35
                : raw;

        const dt = now - d.lastT;
        if (dt > 0) d.vx = (clientX - d.lastX) / dt;
        d.lastX = clientX;
        d.lastT = now;
        if (Math.abs(dx) > 5) d.moved = true;

        forceRender();
    };

    const endDrag = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setIsDragging(false);
        const vx = dragRef.current.vx;
        // Glissement intense → la roue continue de rouler avec vitesse puis ralentit
        if (Math.abs(vx) > 0.28) applyMomentum(vx);
        else snapToNearest();
    };

    const onMouseDown = (e) => startDrag(e.clientX, null);
    const onMouseMove = (e) => moveDrag(e.clientX, null);
    const onMouseUp = () => endDrag();

    const onTouchStart = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => endDrag();

    // ── Scroll molette / pavé tactile ───────────────────────────────────────
    const lastWheel = React.useRef(0);
    const handleWheel = (e) => {
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);

        // Mouvement vertical dominant → on ignore, on laisse le scroll de page se faire normalement
        if (absY >= absX) return;

        // Mouvement horizontal dominant → on gère le carousel
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheel.current < 400) return;
        lastWheel.current = now;
        e.deltaX > 0 ? next() : prev();
    };

    // ── Position de chaque card ──────────────────────────────────────────────
    // Interpolation continue entre les mêmes paliers visuels qu'avant (0 / 58% / 93%),
    // ce qui donne l'effet de roue : les cartes glissent en continu au lieu de sauter.
    const STYLE_ANCHORS = [
        { d: 0, x: 0,   scale: 1,    opacity: 1 },
        { d: 1, x: 58,  scale: 0.82, opacity: 0.75 },
        { d: 2, x: 93,  scale: 0.67, opacity: 0.4 },
        { d: 3, x: 122, scale: 0.55, opacity: 0 },
    ];

    const getStyle = (index) => {
        const diff = index - posRef.current;

        const ad = Math.abs(diff);
        const sign = diff < 0 ? -1 : 1;
        const last = STYLE_ANCHORS[STYLE_ANCHORS.length - 1];

        if (ad >= last.d) return { display: 'none' };

        let i = 0;
        while (i < STYLE_ANCHORS.length - 1 && ad > STYLE_ANCHORS[i + 1].d) i++;
        const a0 = STYLE_ANCHORS[i];
        const a1 = STYLE_ANCHORS[i + 1];
        const t = (ad - a0.d) / (a1.d - a0.d);

        const x = sign * (a0.x + (a1.x - a0.x) * t);
        const scale = a0.scale + (a1.scale - a0.scale) * t;
        const opacity = a0.opacity + (a1.opacity - a0.opacity) * t;
        const zIndex = Math.max(1, Math.round(6 - ad * 2));
        const transition = (draggingRef.current || rafRef.current)
            ? 'none'
            : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        return { transform: `translateX(${x}%) scale(${scale})`, zIndex, opacity, transition };
    };

    return (
        <div
            ref={wrapperRef}
            className="carousel-wrapper"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={handleWheel}
            onDragStart={(e) => e.preventDefault()}
            style={{ touchAction: 'none', userSelect: 'none', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative' }}
        >
            {is_ornement && (
                <OrnementBackground containerRef={wrapperRef} opacity={0.2} duration={6} useAbsolute />
            )}
            <div className="carousel-track">
                {items.map((item, index) => {
                    const style = getStyle(index);
                    if (style.display === 'none') return <React.Fragment key={item.id ?? index} />;
                    return (
                        <div
                            key={item.id ?? index}
                            className="expo-card"
                            style={style}
                            draggable="false"
                            onClick={() => {
                                if (dragRef.current.moved) return;
                                if (index !== Math.round(posRef.current)) goTo(index);
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
                        <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => goTo(i)} />
                    ))}
                </div>
                <button className="nav-arrow" onClick={next}>&#8594;</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExpoCard
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Card d'une exposition dans le carousel.
 *
 * @param {object}   expo              - objet exposition complet
 * @param {boolean}  isActive          - true si cette card est au centre
 * @param {boolean}  canEdit           - afficher les boutons d'administration
 * @param {Function} onModifier        - (expo) => void
 * @param {Function} onSupprimer       - (expo) => void
 * @param {Function} onUpdateStatus    - (expo, newStatus) => void
 * @param {string|null} statusUpdating - statut cible en cours d'application ('publiee' | 'en_modification' | 'archivee' | null)
 * @param {Function} onVoirSalles      - (expo) => void
 * @param {Function} onAjouterSalle    - (expo) => void  (null = bouton masqué)
 */
export function ExpoCard({
    expo,
    isActive,
    canEdit = false,
    onModifier,
    onSupprimer,
    onUpdateStatus,
    statusUpdating = null,
    onVoirSalles,
    onAjouterSalle = null,
}) {
    return (
        <>
            <img src={expo._resolvedImage} alt={expo.nom} />
            <div className="expo-card-overlay" />

            {/* ── Boutons admin ── */}
            { isActive &&
    (
        user?.role === "administrateur" ||
        (
            ["admin_institution", "conservateur", "curateur"].includes(user?.role) &&
            user?.institution_id === expo?.institution_id
        )
    ) && (
                <div className="expo-card-top">
                    <style>{`
                        @keyframes expo-btn-spin { to { transform: rotate(360deg); } }
                        .btn-card-action .btn-spinner { animation: expo-btn-spin 0.7s linear infinite; transform-origin: center; }
                        .btn-card-action:disabled { opacity: 0.6; cursor: not-allowed; }
                    `}</style>
                    <button className="btn-card-action" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onModifier?.(expo); }}>
                        <PencilIcon /><span> Modifier</span>
                    </button>
                    <button className="btn-card-action delete" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onSupprimer?.(expo); }}>
                        <TrashIcon /><span> Supprimer</span>
                    </button>
                    {expo.status_exposition !== 'publiee' && (
                        <button className="btn-card-action publish" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(expo, 'publiee'); }}>
                            {statusUpdating === 'publiee' ? (
                                <>
                                    <svg className="btn-icon btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                                        <path d="M21 12a9 9 0 0 0-9-9" />
                                    </svg><span> Publication…</span>
                                </>
                            ) : (
                                <>
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                    </svg><span> Publier</span>
                                </>
                            )}
                        </button>
                    )}
                    {expo.status_exposition === 'publiee' && (
                        <button className="btn-card-action published" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(expo, 'en_modification'); }}>
                            {statusUpdating === 'en_modification' ? (
                                <>
                                    <svg className="btn-icon btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                                        <path d="M21 12a9 9 0 0 0-9-9" />
                                    </svg><span> Mise à jour…</span>
                                </>
                            ) : (
                                <>
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg><span> Publiée</span>
                                </>
                            )}
                        </button>
                    )}
                    {expo.status_exposition !== 'archivee' && (
                        <button className="btn-card-action archive" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(expo, 'archivee'); }}>
                            {statusUpdating === 'archivee' ? (
                                <>
                                    <svg className="btn-icon btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                                        <path d="M21 12a9 9 0 0 0-9-9" />
                                    </svg><span> Archivage…</span>
                                </>
                            ) : (
                                <>
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
                                        <line x1="10" y1="12" x2="14" y2="12"/>
                                    </svg><span> Archiver</span>
                                </>
                            )}
                        </button>
                    )}
                    {expo.status_exposition === 'archivee' && (
                        <button className="btn-card-action unarchive" disabled={!!statusUpdating} onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(expo, 'en_modification'); }}>
                            {statusUpdating === 'en_modification' ? (
                                <>
                                    <svg className="btn-icon btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                                        <path d="M21 12a9 9 0 0 0-9-9" />
                                    </svg><span> Restauration…</span>
                                </>
                            ) : (
                                <>
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
                                        <polyline points="10 12 12 10 14 12"/><line x1="12" y1="10" x2="12" y2="16"/>
                                    </svg><span> Archivée</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* ── Badge de statut ── */}
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
                        {expo.status_exposition === 'publiee'  ? 'Publiée'
                       : expo.status_exposition === 'archivee' ? 'Archivée'
                       :                                         'En modification'}
                    </span>
                </div>
            )}

            {/* ── Bas de card ── */}
            {isActive && (
                <div className="expo-card-bottom">
                    <div className="expo-card-info">
                        <p className="expo-card-name">{expo.nom}</p>
                        <p className="expo-card-desc">{expo.description}</p>
                        <div className="expo-card-meta">
                            <RoomIcon /> {expo._sallesLoaded
                                ? `${expo.salles?.length || 0} salle${expo.salles?.length !== 1 ? 's' : ''}`
                                : 'Voir les salles'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                        <button className="btn-voir-salles" style={{ marginLeft: 0 }}
                            onClick={(e) => { e.stopPropagation(); onVoirSalles?.(expo); }}>
                            Voir les salles
                        </button>
                        {canEdit && onAjouterSalle && (
                            <button className="btn-voir-salles" style={{ marginLeft: 0 }}
                                onClick={(e) => { e.stopPropagation(); onAjouterSalle?.(expo); }}>
                                + Salle
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SalleCard
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Card d'une salle dans le carousel.
 *
 * @param {object}   salle             - objet salle complet
 * @param {boolean}  isActive          - true si cette card est au centre
 * @param {boolean}  canEdit           - afficher les boutons d'administration
 * @param {object}   parentExpo        - exposition parente (pour l'image de fond)
 * @param {Function} onModifier        - (salle) => void
 * @param {Function} onSupprimer       - (salle) => void
 * @param {Function} onVisiter         - (salle, cardRect) => void
 */
export function SalleCard({
    salle,
    isActive,
    canEdit = false,
    parentExpo = null,
    onModifier,
    onSupprimer,
    onVisiter,
}) {
    const expoImg = parentExpo?._resolvedImage;

    return (
        <>
            {/* ── Image de fond (exposition parente) ── */}
            {expoImg ? (
                <>
                    <img src={expoImg} alt={parentExpo?.nom}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
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

            {/* ── Boutons admin ── */}
            { isActive &&
    (
        user?.role === "administrateur" ||
        (
            ["admin_institution", "conservateur", "curateur"].includes(user?.role) &&
            user?.institution_id === salle?.exposition.institution_id
        )
    ) && (
                <div className="expo-card-top">
                    <button className="btn-card-action" onClick={(e) => { e.stopPropagation(); onModifier?.(salle); }}>
                        <PencilIcon /><span> Modifier</span>
                    </button>
                    <button className="btn-card-action delete" onClick={(e) => { e.stopPropagation(); onSupprimer?.(salle); }}>
                        <TrashIcon /><span> Supprimer</span>
                    </button>
                </div>
            )}

            {/* ── Bas de card ── */}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            const card = e.currentTarget.closest('.expo-card');
                            const rect = card ? card.getBoundingClientRect() : null;
                            onVisiter?.(salle, rect);
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
}