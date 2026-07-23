import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";

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
        setError(err.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  };

  return (
    <AuthLayout
      title="Bon<em>jour</em>"
      subtitle="Connectez-vous à votre espace"
      error={error}
      footer={
        <p className="switch-auth">
                  Pas encore de compte ?{" "}
                  <Link to="/register" className="switch-auth-link">
                    S'inscrire
                  </Link>
                </p>
      }
    >
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
    </AuthLayout>
  );
}