import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';

// Crée le root React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Affiche le composant Hello
root.render(

    <AppRoutes />
  
);