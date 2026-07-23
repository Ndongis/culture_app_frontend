// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { handleLogout } from './auth';


// 1. On crée l'instance configurée
const api = axios.create({ // Ton URL Django
  withCredentials: true,               // Obligatoire pour envoyer/recevoir les cookies JWT
});

// 2. On attache l'intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const { error: errorType, message } = error.response.data;
      console.warn(`[Erreur Auth - ${errorType}] : ${message}`);

      // Optionnel : rediriger vers le login si la session a expiré
      if (errorType === 'token_expired_or_invalid') {
        // window.location.href = '/login';
        
        handleLogout()

      }
      else
        if (errorType === 'missing_token'){
            
        }
    }
    return Promise.reject(error);
  }
);

// 3. On exporte notre instance personnalisée
export default api;