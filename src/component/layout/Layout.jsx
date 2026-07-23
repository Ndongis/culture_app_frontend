import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="home-container">
      <Navbar />

      <Outlet />

      <footer className="footer">
        <div className="footer-logo">Galerie Virtuelle</div>

        <p className="footer-text">
          Une immersion totale au cœur de la création et de la culture.
          <br />
          Explorez des salles virtuelles uniques et découvrez des chefs-d'œuvre mondiaux.
        </p>

        <div className="footer-copyright">
          © {new Date().getFullYear()} Galerie Virtuelle.
        </div>
      </footer>
    </div>
  );
}