import { createContext, useContext, useState, useEffect } from "react";

const SalleEditorContext = createContext();
import api from "../../services/api";
import { handleLogout } from "../../services/auth";
import axios from "axios";

export const SalleProvider = ({ children }) => {

  const [salleId, setSalleId] = useState(null);
  const [expositionId, setExpositionId] = useState(null);
  const [loading, setLoading] = useState(true);
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const userEndpoint = import.meta.env.VITE_USER_ENDPOINT;
  // 🔥 charger depuis backend via JWT cookie
 useEffect(() => {
  axios.get(`${apiUrl}${userEndpoint}/current-context/`)
    .then((response) => {
      const data = response.data;

      setSalleId(data.salleId);
      setExpositionId(data.expositionId);
    })
    .catch((error) => {
      if (error.response?.status === 401) {
        console.log("Utilisateur non authentifié");
        handleLogout()
      } else {
        console.error(error);
      }
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

  // 🔥 sauvegarder automatiquement au backend
  const updateContext = async (newSalleId, newExpoId) => {
    // Mise à jour optimiste de l'état local pour garder une UI réactive
    setSalleId(newSalleId);
    setExpositionId(newExpoId);

    try {
      // Axios s'occupe de faire le JSON.stringify() et d'ajouter le Content-Type automatiquement
      await axios.post(`${apiUrl}${userEndpoint}/set-context/`, {
        salleId: newSalleId,
        expositionId: newExpoId
      });
    } catch (error) {
      console.error("Impossible de sauvegarder le contexte sur le serveur", error);
      // Optionnel : annuler la mise à jour locale en cas d'échec critique
    }};

  if (loading) return null; // évite bug refresh

  return (
    <SalleEditorContext.Provider value={{
      salleId,
      expositionId,
      updateContext,
      setSalleId: (id) => updateContext(id, expositionId),
      setExpositionId: (id) => updateContext(salleId, id)
    }}>
      {children}
    </SalleEditorContext.Provider>
  );
};

export const useSalle = () => {
  const context = useContext(SalleEditorContext);
  if (!context) {
    throw new Error("useSalle doit être utilisé dans SalleProvider");
  }
  return context;
};
