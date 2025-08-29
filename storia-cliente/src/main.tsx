import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORTE AQUI

createRoot(document.getElementById('root')!).render(
  
    <AuthProvider> {/* <-- ABRAÇE O APP */}
      <App />
    </AuthProvider>
  
);