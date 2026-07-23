// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // l'utilisateur global
  const [loadingUser, setLoadingUser] = useState(true); // chargement initial
const apiUrl = import.meta.env.VITE_GATEWAY_URL;
const usersEndpoint = import.meta.env.VITE_USER_ENDPOINT;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${apiUrl}${usersEndpoint}/auth/profile/`, {
          withCredentials: true, // 🔑 envoie cookie HttpOnly
        });
        setUser(res.data.user);
        console.log("Utilisateur connecté:", res.data.user);
      } catch (err) {
        setUser(null); // non connecté
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};