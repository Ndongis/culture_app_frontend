// ExpositionsView.jsx
import React from 'react';
import OrnementBackground from '../OrnementBackground';
import ExpoCarousel, { 
    ExpoCard, 
    SalleCard, 
    PencilIcon, 
    TrashIcon, 
    RoomIcon, 
    UploadIcon, 
    ArrowLeftIcon, 
    GridIcon 
} from '../ExpoCarousel';
import "../../styles/expo.css";

// ── Composant d'animation de zoom ────────────────────────────────────────────
const ZoomAnimation = ({ zoomAnim }) => {
    if (!zoomAnim) return null;
    return (
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
    );
};

// ── Composant principal ──────────────────────────────────────────────────────
export default function ExpositionsView({
    // Données
    expositions = [],
    loading = false,
    error = null,
    
    // États du carousel
    expoIndex = 0,
    setExpoIndex = () => {},
    salleIndex = 0,
    setSalleIndex = () => {},
    
    // États de vue
    view = 'expositions',
    activeExpo = null,
    transitioning = false,
    zoomAnim = null,
    setZoomAnim = () => {},
    
    // États des modaux
    showModal = false,
    setShowModal = () => {},
    modalType = '',
    selectedExpo = null,
    showAddModal = false,
    setShowAddModal = () => {},
    formData = {},
    setFormData = () => {},
    typeDropdownOpen = false,
    setTypeDropdownOpen = () => {},
    uploadedImage = null,
    setUploadedImage = () => {},
    fileInputRef = null,
    pageRef = null,
    
    // Thèmes
    themes = [],
    themesLoading = false,
    themeDropdownOpen = false,
    setThemeDropdownOpen = () => {},
    selectedThemeImages = {},
    setSelectedThemeImages = () => {},
    imagePickerOpenFor = null,
    setImagePickerOpenFor = () => {},
    selectedLocalImage = null,
    setSelectedLocalImage = () => {},
    dragOver = false,
    setDragOver = () => {},
    
    // Salles
    showSalleModal = false,
    setShowSalleModal = () => {},
    salleModalType = '',
    selectedSalle = null,
    showAddSalleModal = false,
    setShowAddSalleModal = () => {},
    salleFormData = {},
    setSalleFormData = () => {},
    salleLoading = false,
    expoIdForNewSalle = null,
    setExpoIdForNewSalle = () => {},
    modelesSalle = [],
    modelesSalleLoading = false,
    selectedModeleSalle = null,
    setSelectedModeleSalle = () => {},
    
    // Erreurs
    expoErrors = {},
    salleErrors = {},
    expoLoading = false,
    sallesLoading = false,
    
    // Édition image
    editUploadedImage = null,
    setEditUploadedImage = () => {},
    editFileInputRef = null,
    editDragOver = false,
    setEditDragOver = () => {},
    editImagePickerOpen = false,
    setEditImagePickerOpen = () => {},
    confirmEditModal = {},
    setConfirmEditModal = () => {},
    previewImage = null,
    
    // Constantes
    allExpoImages = {},
    TYPE_EXPOSITION_CHOICES = [],
    
    // Config
    isVisitePage = false,
    institutionNom = '',
    institutionMode = false,
    canEdit = false,
    
    // Fonctions
    getLocalImageMeta = () => null,
    urlToFile = () => Promise.resolve(),
    fetchModelesSalle = () => {},
    handleVoirSalles = () => {},
    handleRetour = () => {},
    versSalle = () => {},
    handleAction = () => {},
    handleUpdate = () => {},
    handleDelete = () => {},
    handleUpdateStatus = () => {},
    handleAdd = () => {},
    handleSalleAction = () => {},
    handleSalleUpdate = () => {},
    handleSalleDelete = () => {},
    handleSalleAdd = () => {},
    handleConfirmEdit = () => {},
    getExpoImage = () => null,
    getModeleSalleImageUrl = () => null,
    onRetour = null,
    onNavigate = null,
}) {
    // ── Card renderers ────────────────────────────────────────────────────────
    const renderExpoCard = (expo, isActive) => (
        <ExpoCard
            expo={expo}
            isActive={isActive}
            canEdit={canEdit}
            onModifier={(e) => handleAction('modifier', e)}
            onSupprimer={(e) => handleAction('supprimer', e)}
            onUpdateStatus={handleUpdateStatus}
            onVoirSalles={handleVoirSalles}
            onAjouterSalle={canEdit ? (e) => {
                if (!e?.id) return;
                setSalleFormData({ nom: '', description: '', modele_salle: null });
                setSelectedModeleSalle(null);
                setExpoIdForNewSalle(e.id);
                setActiveExpo(e);
                fetchModelesSalle();
                setShowAddSalleModal(true);
            } : null}
        />
    );

    const renderSalleCard = (salle, isActive) => (
        <SalleCard
            salle={salle}
            isActive={isActive}
            canEdit={canEdit}
            parentExpo={activeExpo}
            onModifier={(s) => handleSalleAction('modifier', s)}
            onSupprimer={(s) => handleSalleAction('supprimer', s)}
            onVisiter={(s, rect) => {
                const src = activeExpo?._resolvedImage;
                if (rect && src) {
                    setZoomAnim({ src, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } });
                    setTimeout(() => { setZoomAnim(null); versSalle(s.id, activeExpo.id); }, 700);
                } else {
                    versSalle(s.id, activeExpo.id);
                }
            }}
        />
    );

    return (
        <>
            <ZoomAnimation zoomAnim={zoomAnim} />

            <div className={`expo-page${isVisitePage ? ' expo-page--visite' : ' expo-page--admin'}`} ref={pageRef}>

                {/* ═══ FOND ORNEMENTS ANIMÉ ═══ */}
                <OrnementBackground containerRef={pageRef} opacity={0.2} duration={6} useAbsolute />

                {/* ── Header ── */}
                <div className="expo-header">
                    <div>
                        {institutionMode && view === 'expositions' && (
                            <button className="btn-retour" style={{ marginBottom: '0.5rem' }} onClick={() => {
                                if (onRetour) { onRetour(); return; }
                                if (isVisitePage && onNavigate) { onNavigate('/visites/institutions'); return; }
                                if (onNavigate) { onNavigate('/institutions'); return; }
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
                        {view === 'salles' && canEdit && (
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
                        {view === 'expositions' && canEdit && (
                            <button className="btn-add-expo" onClick={() => {
                                setFormData({ nom: '', description: '', theme_ids: [], type_exposition: '', institution_id: null, artiste_id: null });
                                setExpoErrors({});
                                setTypeDropdownOpen(false);
                                setSelectedThemeImages({});
                                setImagePickerOpenFor(null);
                                setShowAddModal(true);
                            }}>
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
                        <span style={{ cursor: 'pointer' }} onClick={handleRetour}>
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
                            expositions.length === 0
                                ? <div className="status-msg empty">Aucune exposition disponible.</div>
                                : <ExpoCarousel
                                    items={expositions}
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
                                    <button
                                        type="button"
                                        className="btn-choose-image"
                                        onClick={() => setEditImagePickerOpen(true)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        Choisir une image
                                    </button>
                                </div>
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
                                        </div>
                                    </div>
                                </div>
                                </div>
                                </div>
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
                                        <TrashIcon /> {expoLoading ? 'Suppression...' : 'Supprimer'}
                                    </button>
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
                            <div className="gallery-fullview">
                                <div className="gallery-fullview-header">
                                    <h2 className="modal-title" style={{ margin: 0 }}>Choisir une image</h2>
                                    <button type="button" className="btn-cancel" onClick={() => setImagePickerOpenFor(null)}>✕ Annuler</button>
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
                        <>
                        <h2 className="modal-title">Ajouter une exposition</h2>
                        <div className="modal-salle-layout">
                            <div className="modal-expo-image-col">
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
                                <button
                                    type="button"
                                    className="btn-choose-image"
                                    onClick={() => setImagePickerOpenFor(p => p === 'main' ? null : 'main')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    Choisir une image
                                </button>
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
                                                    onClick={() => { setFormData(f => ({ ...f, type_exposition: '' })); setTypeDropdownOpen(false); }}>
                                                    — Aucun type
                                                </div>
                                                {TYPE_EXPOSITION_CHOICES.map(c => (
                                                    <div key={c.value} className={`theme-dropdown-item ${formData.type_exposition === c.value ? 'selected' : ''}`}
                                                        onClick={() => { setFormData(f => ({ ...f, type_exposition: c.value })); setTypeDropdownOpen(false); }}>
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
                                            {formData.theme_ids.length === 0 ? (
                                                <span className="theme-tags-empty">Aucun thème sélectionné</span>
                                            ) : (
                                                formData.theme_ids.map(tid => {
                                                    const t = themes.find(th => String(th.id) === String(tid));
                                                    return t ? (
                                                        <span key={tid} className="theme-tag">
                                                            {t.nom}
                                                            <button type="button" className="theme-tag-remove"
                                                                onClick={() => {
                                                                    setFormData(prev => ({ ...prev, theme_ids: prev.theme_ids.filter(id => id !== tid) }));
                                                                    setSelectedThemeImages(prev => { const n = {...prev}; delete n[tid]; return n; });
                                                                }}>×</button>
                                                        </span>
                                                    ) : null;
                                                })
                                            )}
                                        </div>
                                        {themesLoading ? (
                                            <div style={{ padding: '0.5rem', fontSize: '0.82rem', color: '#aaa' }}>Chargement...</div>
                                        ) : (
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
                                    <div className="modal-salle-left">
                                        <div className="modal-form">
                                            <label>Nom de la salle <span className="field-required">*</span></label>
                                            <input type="text" value={salleFormData.nom} className={salleErrors.nom ? 'input-error' : ''}
                                                onChange={(e) => { setSalleFormData({ ...salleFormData, nom: e.target.value }); setSalleErrors(p => ({ ...p, nom: '' })); }} />
                                            {salleErrors.nom && <span className="error-msg">{salleErrors.nom}</span>}
                                            <label>Description</label>
                                            <textarea rows={5} placeholder="Décrivez la salle..." value={salleFormData.description}
                                                onChange={(e) => setSalleFormData({ ...salleFormData, description: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="modal-salle-right">
                                        <span className="modal-salle-right-label">Choisir un modèle de salle</span>
                                        {modelesSalleLoading ? (
                                            <div className="modeles-loading">Chargement des modèles...</div>
                                        ) : modelesSalle.length === 0 ? (
                                            <div className="modeles-empty">Aucun modèle de salle disponible</div>
                                        ) : (
                                            <div className="modeles-grid">
                                                {modelesSalle.map((modele) => (
                                                    <div key={modele.id} className={`modele-item ${selectedModeleSalle === modele.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedModeleSalle(modele.id)}>
                                                        {modele.image ? (
                                                            <img src={getModeleSalleImageUrl(modele.image)} alt={modele.nom} className="modele-item-image" />
                                                        ) : (
                                                            <div className="modele-item-placeholder"><RoomIcon size={28} /></div>
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
                            <div className="modal-salle-left">
                                <div className="modal-form">
                                    <label>Nom de la salle</label>
                                    <input type="text" placeholder="Ex: Salle Peulh" value={salleFormData.nom}
                                        onChange={(e) => setSalleFormData({ ...salleFormData, nom: e.target.value })} />
                                    <label>Description</label>
                                    <textarea rows={5} placeholder="Décrivez la salle..." value={salleFormData.description}
                                        onChange={(e) => setSalleFormData({ ...salleFormData, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-salle-right">
                                <span className="modal-salle-right-label">Choisir un modèle de salle</span>
                                {modelesSalleLoading ? (
                                    <div className="modeles-loading">Chargement des modèles...</div>
                                ) : modelesSalle.length === 0 ? (
                                    <div className="modeles-empty">Aucun modèle de salle disponible</div>
                                ) : (
                                    <div className="modeles-grid">
                                        {modelesSalle.map((modele) => (
                                            <div key={modele.id} className={`modele-item ${selectedModeleSalle === modele.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedModeleSalle(modele.id)}>
                                                {modele.image ? (
                                                    <img src={getModeleSalleImageUrl(modele.image)} alt={modele.nom} className="modele-item-image" />
                                                ) : (
                                                    <div className="modele-item-placeholder"><RoomIcon size={28} /></div>
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
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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
                            <button className="btn-cancel" onClick={() => setConfirmEditModal({ open: false, salleId: null, expositionId: null })}>Annuler</button>
                            <button className="btn-confirm primary" onClick={handleConfirmEdit}><PencilIcon /> Continuer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}