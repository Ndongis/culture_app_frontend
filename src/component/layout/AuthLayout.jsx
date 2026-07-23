import React from "react";
import SliderPanel from "./SliderPanel";
import "../../styles/auth.css";

// Importation des images
import img1 from "../../assets/slider_images_login/image1.jpg";
import img2 from "../../assets/slider_images_login/image2.jpg";
import img3 from "../../assets/slider_images_login/image3.jpg";
import img4 from "../../assets/slider_images_login/image4.jpg";

const loginImages = [img1, img2, img3, img4];

const loginCaptions = [
  { title: "Découvrir la culture", artist: "", year: "2023" },
  { title: "Embarquer vers le passé", artist: "", year: "2022" },
  { title: "Immersivité totale", artist: "Naviguer dans des salles virtuelles", year: "2024" },
  { title: "La création des sénégalais", artist: "à portée de main", year: "2021" },
];

/**
 * Partie principale commune : slider + carte du formulaire.
 *
 * Props :
 * - title       : titre affiché (ex: "Bon<em>jour</em>")
 * - subtitle    : sous-titre affiché sous le titre
 * - error       : message d'erreur éventuel
 * - children    : le formulaire (champs + bouton submit) propre à Login ou Register
 * - footer      : contenu affiché en bas (ex: lien "S'inscrire" / "Se connecter")
 */
export default function AuthLayout({ title, subtitle, error, children, footer }) {
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
            <h1 className="form-title" dangerouslySetInnerHTML={{ __html: title }} />
            <p className="form-subtitle">{subtitle}</p>
          </div>

          {/* Messages d'erreur */}
          {error && <div className="error-msg">{error}</div>}

          {/* Formulaire (Login ou Register) */}
          {children}


          {/* Pied de page (bouton de bascule Login <-> Register) */}
          {footer}
        </div>
      </div>
    </div>
  );
}