import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";

export default function RegisterPage() {
  // ---- LOGIQUE DU REGISTER (États) ----
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("visiteur"); // rôle par défaut, non modifiable
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_GATEWAY_URL;
  const userEndpoint = import.meta.env.VITE_USER_ENDPOINT;
  const navigate = useNavigate();

  // ---- LOGIQUE DU REGISTER (Soumission) ----
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${apiUrl}${userEndpoint}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom, prenom, email, password, role }),
      });
      if (response.ok) {
        await response.json();
        navigate("/login");
      } else {
        const err = await response.json();
        setError(err.detail || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <AuthLayout
      title="Bienvenue"
      subtitle="Créez votre espace personnel"
      error={error}
      footer={
        <p className="switch-auth">
          Déjà un compte ?{" "}
          <Link to="/login" className="switch-auth-link">
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={handleRegister}>
        {/* Champ caché : rôle par défaut attribué à tout nouvel inscrit */}
        <input type="hidden" name="role" value={role} />

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="nom">Nom</label>
            <div className="field-wrap">
              <input
                id="nom"
                type="text"
                className="field-input"
                placeholder="Votre nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                autoComplete="family-name"
              />
              <div className="field-underline" />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="prenom">Prénom</label>
            <div className="field-wrap">
              <input
                id="prenom"
                type="text"
                className="field-input"
                placeholder="Votre prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                autoComplete="given-name"
              />
              <div className="field-underline" />
            </div>
          </div>
        </div>

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
              autoComplete="new-password"
            />
            <div className="field-underline" />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          <span>S'inscrire</span>
        </button>
      </form>
    </AuthLayout>
  );
}