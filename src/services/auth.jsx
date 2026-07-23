import axios from "axios";
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;
export const handleLogout = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}${usersEndpoint}/auth/logout/`, 
      {}, // Le corps de la requête (vide pour un POST de déconnexion)
      { 
        withCredentials: true // OBLIGATOIRE : permet d'envoyer et recevoir les cookies HttpOnly
      }
    );

    console.log(response.data.message); // "Déconnexion réussie."
    
    // 1. Nettoyez l'état de votre application (ex: vider le contexte utilisateur)
    // 2. Redirigez l'utilisateur (ex: useNavigate() de react-router vers '/login')

  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error.response?.data || error.message);
  }
};