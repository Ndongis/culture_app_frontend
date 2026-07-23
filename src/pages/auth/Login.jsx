import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SliderPanel from "../../component/layout/SliderPanel";
import "../../styles/auth.css";

// Importation des images
import img1 from "../../assets/slider_images_login/image1.jpg";
import img2 from "../../assets/slider_images_login/image2.jpg";
import img3 from "../../assets/slider_images_login/image3.jpg";
import img4 from "../../assets/slider_images_login/image4.jpg";

// Définition des données à passer en arguments
const loginImages = [img1, img2, img3, img4];

const loginCaptions = [
  { title: "Découvrir la culture", artist: "", year: "2023" },
  { title: "Embarquer vers le passé", artist: "", year: "2022" },
  { title: "Immersivité totale", artist: "Naviguer dans des salles virtuelles", year: "2024" },
  { title: "La création des sénégalais", artist: "à portée de main", year: "2021" },
];

export default function LoginPage() {
  // ---- LOGIQUE DU LOGIN (États) ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const userEndpoint = import.meta.env.VITE_USER_ENDPOINT;
  const navigate = useNavigate();

  // ---- LOGIQUE DU LOGIN (Soumission) ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${apiUrl}${userEndpoint}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        await response.json();
        navigate("/admin/dashboard");
      } else {
        const err = await response.json();
        setError(err.detail || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <div className="login-root">
      
      {/* Appel du Slider avec les deux arguments demandés */}
      <SliderPanel images={loginImages} captions={loginCaptions} />

      {/* ---- PANNEAU FORMULAIRE ---- */}
      <div className="form-panel">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="form-inner">
          {/* Header */}
          <div className="form-header">
            <div className="gallery-badge">
              <span className="badge-line" />
              Musée numérique
              <span className="badge-line" />
            </div>
            <div className="avatar-ring">
              <svg className="avatar-svg" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="form-title">Bon<em>jour</em></h1>
            <p className="form-subtitle">Connectez-vous à votre espace</p>
          </div>

          {/* Messages d'erreur */}
          {error && <div className="error-msg">{error}</div>}

          {/* Formulaire de connexion */}
          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Adresse email</label>
              <div className="field-wrap">
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <div className="field-underline" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Mot de passe</label>
              <div className="field-wrap">
                <input
                  id="password"
                  type="password"
                  className="field-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <div className="field-underline" />
              </div>
            </div>

            <a href="#" className="forgot-link">Mot de passe oublié ?</a>

            <button type="submit" className="submit-btn">
              <span>Se connecter</span>
            </button>
          </form>

          <div className="form-divider">
            <div className="divider-line" />
            <span className="divider-text">Accès réservé</span>
            <div className="divider-line" />
          </div>
        </div>
      </div>
    </div>
  );
}