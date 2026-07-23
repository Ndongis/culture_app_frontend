import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo" onClick={closeMenu}>
        Culturel
      </NavLink>

      {/* Bouton hamburger, visible uniquement en dessous de 900px */}
      <button
        className={`nav-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le menu de navigation"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${isOpen ? "nav-links-open" : ""}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          Accueil
        </NavLink>

        <NavLink
          to="/visites/institutions"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          Institutions
        </NavLink>

        <NavLink
          to="/galerie"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          Artistes
        </NavLink>

        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          Connexion
        </NavLink>
      </div>

      {/* Overlay pour fermer le menu en cliquant en dehors */}
      {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </nav>
  );
}