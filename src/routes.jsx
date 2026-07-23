import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";

import SalleEditPage from "./pages/SalleEditPage";
import ListeExpositions from "./pages/ListeExpositions";
import LoginPage from "./pages/auth/Loginpage";
import RegisterPage from "./pages/auth/Registerpage";
import VerifyEmail from "./pages/auth/VerifyEmail";
import HomeUser from "./pages/HomeUser";

import { SalleProvider } from "./component/context/SalleContext";
import { AuthProvider, AuthContext } from "./component/context/AuthContext";
import Expositions from "./component/layout/Expositions";
import BiensCulturels from "./component/layout/BiensCulturels";
import ModeleSalle from "./component/layout/ModeleSalle";
import Institutions from "./component/layout/Institutions";
import SalleVisitorPage from "./pages/SalleVisitorPage";
import Artistes from "./component/layout/Artistes";
import Users from "./component/layout/Users";
import Categories from "./component/layout/Categories";
import Layout from "./component/layout/Layout";
import Themes from "./component/layout/Themes";
import Dashboard from "./component/layout/Dashboard";
import Accueil from "./pages/Accueil";
import PageVisitesInstitutions from "./pages/PageVisitesInstitutions";
import HeroCarousel from "./pages/HeroCarousel";



// 🔐 Composant pour protéger les routes
function PrivateRoute() {
  const { user, loadingUser } = useContext(AuthContext);

  if (loadingUser) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;

  return <Outlet />; // rend les sous-routes
}

export default function AppRoutes() {
  return (
    <SalleProvider>
      <BrowserRouter>
        <Routes>

          {/* 🌍 Route publique */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* 🔒 Routes protégées */}
          <Route
            element={
              <AuthProvider>
                <PrivateRoute />
              </AuthProvider>
            }
          >
            <Route path="/admin" element={<HomeUser />}>
            <Route path="dashboard" element={<Dashboard />} />
              <Route path="biens-culturels" element={<BiensCulturels />} />
              <Route path="expositions" element={<Expositions />} />
              <Route path="artistes" element={<Artistes />} />
              <Route path="modele_salle" element={<ModeleSalle />} />
              <Route path="institutions" element={<Institutions />} />
              <Route path="utilisateurs" element={<Users/>} />
              <Route path="categories" element={<Categories/>} />
               <Route path="themes" element={<Themes/>} />
            </Route>
           

            <Route path="/edit_salle_expo" element={<SalleEditPage />} />
            

            <Route path="/mes_expositions" element={<ListeExpositions />} />
          </Route>
           <Route path="/" element={<Layout/>}>


    <Route index element={<Accueil/>}/>


    <Route 
    path="visites/institutions"
    element={<PageVisitesInstitutions/>}
    />

</Route>
         
          <Route path="/visites/institutions/:id" element={<Institutions />} ></Route>
          <Route path="/visites/expositions" element={<Expositions />} ></Route>
          <Route path="home" element={<Accueil/>} />
          <Route path="hero" element={<HeroCarousel/>} />
        <Route path="/visiter_salle" element={<SalleVisitorPage />} />
        </Routes>
      </BrowserRouter>
    </SalleProvider>
  );
}