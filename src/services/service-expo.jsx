// ─────────────────────────────────────────────────────────────────────────────
// services-expo.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche « backend » : centralise tous les appels réseau (fetch) utilisés par
// le composant Expositions. Aucune logique d'affichage ni d'état React ici,
// uniquement la communication avec l'API.
// ─────────────────────────────────────────────────────────────────────────────
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const expoEndpoint = import.meta.env.VITE_EXPO_ENDPOINT;
export const BASE_URL = `${apiUrl}${expoEndpoint}`;


export const EXPO_API = `${BASE_URL}/api/expositions`;
export const SALLE_API = `${BASE_URL}/api/salles`;
export const MODELE_SALLE_API = `${BASE_URL}/api/modeles_salle`;
export const THEMES_API = `${BASE_URL}/api/themes`;

// ── Helper générique ─────────────────────────────────────────────────────────
// Lève une erreur avec le message fourni si la réponse n'est pas OK.
async function assertOk(res, errorMessage) {
    if (!res.ok) throw new Error(errorMessage);
    return res;
}

// ── Expositions ───────────────────────────────────────────────────────────────

// GET liste des expositions (filtrée par institution si fourni)
export async function fetchExpositions(effectiveInstitutionId) {
    const url = effectiveInstitutionId
        ? `${EXPO_API}?institution_id=${effectiveInstitutionId}`
        : EXPO_API;
    const res = await fetch(url);
    await assertOk(res, 'Erreur de chargement');
    return res.json();
}

// POST nouvelle exposition (FormData : nom, description, type_exposition, themes, image...)
export async function createExposition(formData) {
    const res = await fetch(EXPO_API, { method: 'POST', body: formData });
    await assertOk(res, "Erreur lors de l'ajout");
    const json = await res.json();
    return json.data ?? json;
}

// PATCH exposition existante (FormData)
export async function updateExposition(id, formData) {
    const res = await fetch(`${EXPO_API}/${id}`, { method: 'PATCH', body: formData });
    await assertOk(res, 'Erreur lors de la modification');
    return res.json();
}

// DELETE exposition
export async function deleteExposition(id) {
    const res = await fetch(`${EXPO_API}/${id}`, { method: 'DELETE' });
    await assertOk(res, 'Erreur lors de la suppression');
    return true;
}

// PATCH statut d'une exposition (publiee / en_modification / archivee)
export async function updateExpositionStatus(id, newStatus) {
    const res = await fetch(`${EXPO_API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_exposition: newStatus }),
    });
    await assertOk(res, 'Erreur lors de la mise à jour du statut');
    return true;
}

// ── Salles ────────────────────────────────────────────────────────────────────

// GET salles d'une exposition donnée
export async function fetchSallesByExposition(expositionId) {
    const res = await fetch(`${SALLE_API}?exposition_id=${expositionId}`);
    await assertOk(res, 'Erreur de chargement des salles');
    return res.json();
}

// POST nouvelle salle
export async function createSalle({ nom, description, modele_salle_id, exposition_id }) {
    const res = await fetch(SALLE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, modele_salle_id, exposition_id }),
    });
    await assertOk(res, "Erreur lors de l'ajout");
    return res.json();
}

// PATCH salle existante
export async function updateSalle(id, { nom, description, modele_salle_id }) {
    const res = await fetch(`${SALLE_API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, description, modele_salle_id }),
    });
    await assertOk(res, 'Erreur lors de la modification');
    return res.json();
}

// DELETE salle
export async function deleteSalle(id) {
    const res = await fetch(`${SALLE_API}/${id}`, { method: 'DELETE' });
    await assertOk(res, 'Erreur lors de la suppression');
    return true;
}

// ── Modèles de salle ─────────────────────────────────────────────────────────

// GET liste des modèles de salle disponibles
export async function fetchModelesSalle() {
    const res = await fetch(MODELE_SALLE_API);
    await assertOk(res, 'Erreur de chargement des modèles');
    return res.json();
}

// Construit l'URL complète d'une image de modèle de salle
export function getModeleSalleImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
}

// ── Thèmes ────────────────────────────────────────────────────────────────────

// GET liste des thèmes
export async function fetchThemes() {
    const res = await fetch(THEMES_API);
    if (!res.ok) return [];
    return res.json();
}