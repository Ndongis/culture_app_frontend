import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

export default function VerifyEmail() {
  const [searchParams]          = useSearchParams();
  const [status, setStatus]     = useState("loading");
  const [message, setMessage]   = useState("");
  const [email, setEmail]       = useState("");
  const [resendSent, setResendSent]       = useState(false);
  const [resendError, setResendError]     = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl       = import.meta.env.VITE_GATEWAY_URL;
  const userEndpoint = import.meta.env.VITE_USER_ENDPOINT;

  useEffect(() => {
    const uid   = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uid || !token) {
      setStatus("error");
      setMessage("Lien invalide ou manquant.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `${apiUrl}${userEndpoint}/auth/verify-email/?uid=${uid}&token=${token}`
        );
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        switch (data.error) {
          case "ALREADY_VERIFIED":
            setStatus("already_verified");
            break;
          case "EXPIRED_OR_INVALID":
            setStatus("expired");
            break;
          case "USER_NOT_FOUND":
          case "INVALID_LINK":
          default:
            setStatus("error");
            break;
        }
        setMessage(data.message);

      } catch {
        setStatus("error");
        setMessage("Impossible de contacter le serveur.");
      }
    };

    verify();
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendError(null);

    try {
      const response = await fetch(
        `${apiUrl}${userEndpoint}/auth/resend-verification/`, // ← corrigé
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setResendSent(true);
      } else {
        setResendError(data.error || "Une erreur est survenue.");
      }
    } catch {
      setResendError("Impossible de contacter le serveur.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="form-panel" style={{ width: "100%" }}>
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="form-inner">
          <div className="form-header">
            <div className="gallery-badge">
              <span className="badge-line" />
              Vérification
              <span className="badge-line" />
            </div>

            <div className="avatar-ring" style={{ marginBottom: 24 }}>
              {status === "loading" && (
                <svg className="avatar-svg" style={{ animation: "spin 1.2s linear infinite" }} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              )}
              {(status === "success" || status === "already_verified") && (
                <svg className="avatar-svg" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {(status === "error" || status === "expired") && (
                <svg className="avatar-svg" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            {status === "loading" && (
              <>
                <h1 className="form-title">Vérification<br /><em>en cours…</em></h1>
                <p className="form-subtitle">Validation de votre lien d'activation</p>
              </>
            )}
            {status === "success" && (
              <>
                <h1 className="form-title">Compte<br /><em>vérifié</em></h1>
                <p className="form-subtitle">Redirection vers la connexion dans 3 secondes</p>
              </>
            )}
            {status === "already_verified" && (
              <>
                <h1 className="form-title">Déjà<br /><em>vérifié</em></h1>
                <p className="form-subtitle">{message}</p>
              </>
            )}
            {status === "error" && (
              <>
                <h1 className="form-title">Lien<br /><em>invalide</em></h1>
                <p className="form-subtitle">{message}</p>
              </>
            )}
            {status === "expired" && (
              <>
                <h1 className="form-title">Lien<br /><em>expiré</em></h1>
                <p className="form-subtitle">{message}</p>
              </>
            )}
          </div>

          {status === "loading" && (
            <div style={{
              width: "100%", height: 2,
              background: "rgba(201,169,110,0.15)",
              borderRadius: 2, overflow: "hidden", marginBottom: 32,
            }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--gold-dim), var(--gold-light), var(--gold-dim))",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                borderRadius: 2, width: "60%",
              }} />
            </div>
          )}

          {(status === "success" || status === "already_verified") && (
            <button className="submit-btn" onClick={() => navigate("/login")} style={{ marginTop: 8 }}>
              <span>Se connecter maintenant</span>
            </button>
          )}

          {status === "error" && (
            <button className="submit-btn" onClick={() => navigate("/login")} style={{ marginTop: 8 }}>
              <span>Retour à la connexion</span>
            </button>
          )}

          {status === "expired" && (
            <div>
              {resendSent ? (
                <div className="error-msg" style={{
                  background: "rgba(100,200,150,0.10)",
                  borderColor: "rgba(100,200,150,0.30)",
                  color: "#a0d4b4",
                }}>
                  Email renvoyé — vérifiez votre boîte mail.
                </div>
              ) : (
                <>
                  {resendError && <div className="error-msg">{resendError}</div>}
                  <div className="field-group">
                    <label className="field-label">Votre adresse email</label>
                    <div className="field-wrap">
                      <input
                        className="field-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setResendError(null); }}
                      />
                      <span className="field-underline" />
                    </div>
                  </div>
                  <button
                    className="submit-btn"
                    onClick={handleResend}
                    style={{
                      marginTop: 0,
                      opacity: (!email || resendLoading) ? 0.5 : 1,
                      pointerEvents: (!email || resendLoading) ? "none" : "auto",
                    }}
                  >
                    <span>{resendLoading ? "Envoi en cours…" : "Renvoyer le lien"}</span>
                  </button>
                </>
              )}
            </div>
          )}

          <div className="form-divider" style={{ marginTop: 32 }}>
            <span className="divider-line" />
            <span className="divider-text">
              {status === "success" || status === "already_verified" ? "Compte activé" : "Besoin d'aide ?"}
            </span>
            <span className="divider-line" />
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0%   { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
        `}</style>
      </div>
    </div>
  );
}