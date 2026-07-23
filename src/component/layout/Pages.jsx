// AdminLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

export default function Pages() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
    { name: 'Utilisateurs', icon: 'bi-people', route: '/utilisateurs' },
    { name: 'Œuvres', icon: 'bi-palette', route: '/oeuvres' },
    { name: 'Expositions', icon: 'bi-calendar-event', route: '/expositions' },
    { name: 'Salles', icon: 'bi-geo-alt', route: '/salles' },
    { name: 'Notifications', icon: 'bi-bell', route: '/notifications' },
    { name: 'Paramètres', icon: 'bi-gear', route: '/parametres' },
  ];

  const getCurrentPageName = () => {
    const currentItem = menuItems.find(item => item.route === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" 
        rel="stylesheet"
      />
      
      <style>{`
        body {
          overflow: hidden;
        }
        .sidebar {
          background-color: #ff6b35;
          color: white;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          transition: width 0.3s;
          overflow-y: auto;
          z-index: 1000;
        }
        .sidebar.collapsed {
          width: 80px;
        }
        .sidebar:not(.collapsed) {
          width: 260px;
        }
        .sidebar .nav-link {
          color: white;
          padding: 12px 20px;
          border-left: 4px solid transparent;
          transition: all 0.3s;
          text-decoration: none;
        }
        .sidebar .nav-link:hover {
          background-color: rgba(0,0,0,0.1);
        }
        .sidebar .nav-link.active {
          background-color: rgba(0,0,0,0.2);
          border-left-color: white;
        }
        .sidebar .nav-link i {
          font-size: 1.25rem;
          width: 24px;
        }
        .main-content {
          transition: margin-left 0.3s;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .main-content.collapsed {
          margin-left: 80px;
        }
        .main-content:not(.collapsed) {
          margin-left: 260px;
        }
        .topbar {
          background-color: white;
          border-bottom: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 999;
        }
        .user-profile {
          border-top: 1px solid rgba(255,255,255,0.2);
          padding: 1rem;
          margin-top: auto;
        }
        .logo-section {
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding: 1rem;
        }
        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: #ff6b35;
          border-radius: 50%;
        }
      `}</style>

      <div className="d-flex">
        {/* Sidebar */}
        <div className={`sidebar d-flex flex-column ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Logo */}
          <div className="logo-section d-flex align-items-center justify-content-between">
            {!sidebarCollapsed && (
              <div className="d-flex align-items-center">
                <i className="bi bi-palette fs-3 me-2"></i>
                <span className="fw-bold fs-5">ArtExpo</span>
              </div>
            )}
            <button 
              className="btn btn-link text-white p-2"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
          </div>

          {/* Menu */}
          <nav className="nav flex-column flex-grow-1 py-3">
            {menuItems.map((item) => (
              <Link
                key={item.route}
                to={item.route}
                className={`nav-link d-flex align-items-center ${location.pathname === item.route ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon} me-3`}></i>
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          {!sidebarCollapsed && (
            <div className="user-profile">
              <div className="d-flex align-items-center">
                <div className="bg-light bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width: '40px', height: '40px'}}>
                  <span className="fw-semibold">AD</span>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="small fw-semibold">Admin</div>
                  <div className="small opacity-75">admin@artexpo.com</div>
                </div>
                <i className="bi bi-chevron-down"></i>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`main-content flex-grow-1 ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Top Bar */}
          <div className="topbar d-flex align-items-center justify-content-between">
            <h2 className="mb-0 fw-bold">
              {getCurrentPageName()}
            </h2>
            
            <div className="d-flex align-items-center gap-3">
              <div className="input-group" style={{maxWidth: '300px'}}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Rechercher..."
                />
              </div>
              <button className="btn btn-light position-relative">
                <i className="bi bi-bell"></i>
                <span className="notification-badge"></span>
              </button>
            </div>
          </div>

          {/* Content - Outlet pour afficher les routes enfants */}
          <div className="p-4" style={{overflowY: 'auto', height: 'calc(100vh - 73px)'}}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}