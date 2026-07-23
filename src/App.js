// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { SalleProvider } from './component/context/SalleContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function App() {
  return (
    
     
      <AppRoutes />
   
  
  );
}