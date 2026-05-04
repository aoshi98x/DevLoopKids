// src/components/landing/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Añadimos 'loading' para evitar parpadeos visuales durante la hidratación de sesión
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const BASE_URL = "/";

  const navLinks = [
    { name: 'Inicio', path: `${BASE_URL}` },
    { name: 'Precios', path: `${BASE_URL}#pricing` },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error en Supabase al cerrar sesión:', error.message);
    } finally {
      for (let key in localStorage) {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
      
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      window.location.reload(); 
    }
  };

  const handleNavClick = (path) => {
    setIsOpen(false);
    if (path === BASE_URL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path.includes('#')) {
      const targetId = path.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const yOffset = -80; 
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link 
          to={BASE_URL} 
          onClick={() => handleNavClick(BASE_URL)} 
          className="text-2xl font-black text-brand-primary flex items-center gap-2"
        >
          <img src="/logo.png" alt="DevLoop Kids Logo" className="w-10 h-10"/> 
          DevLoop<span className="text-brand-secondary text-lg">Kids</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks
            .filter((link) => !(link.name === 'Profesores' && profile?.role === 'teacher'))
            .map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => handleNavClick(link.path)} 
              className="font-bold text-gray-600 hover:text-brand-primary"
            >
              {link.name}
            </Link>
          ))}

          {/* Lógica de Usuario en Escritorio con Soporte de Carga */}
          {loading ? (
            <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'profesor' ? (
                <Link to={`${BASE_URL}panel-profe`} className="font-bold text-brand-secondary hover:text-orange-500 transition-colors">
                  Panel de Profe
                </Link>
              ) : (
                <Link 
                  to={`${BASE_URL}dashboard`} 
                  className="flex items-center gap-2 p-1 pr-4 bg-gray-50 hover:bg-brand-primary/10 rounded-full border-2 border-transparent hover:border-brand-primary transition-all"
                >
                  <img 
                    src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix'} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border-2 border-brand-primary"
                  />
                  <span className="font-bold text-gray-700 text-sm">Mi Panel</span>
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className="bg-gray-100 text-gray-400 px-5 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm text-sm"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link to={`${BASE_URL}login`}>
              <button className="bg-brand-primary text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-600 transition-all shadow-md">
                Ingresar
              </button>
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-brand-primary p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/> : <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2.5" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-4">
          {navLinks
            .filter((link) => !(link.name === 'Profesores' && profile?.role === 'teacher'))
            .map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => handleNavClick(link.path)} 
              className="text-lg font-bold text-gray-700"
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="py-4 border-t border-gray-50 flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix'} 
                  className="w-12 h-12 rounded-full border-2 border-brand-primary"
                  alt="Perfil"
                />
                <span className="font-bold text-brand-primary text-lg">¡Hola, {profile?.full_name?.split(' ')[0] || 'Explorador'}!</span>
              </div>
              
              {profile?.role === 'profesor' ? (
                <Link to={`${BASE_URL}panel-profe`} onClick={() => setIsOpen(false)} className="text-lg font-bold text-brand-secondary">
                  Panel de Profe
                </Link>
              ) : (
                <Link to={`${BASE_URL}dashboard`} onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-700 bg-gray-50 p-4 rounded-xl">
                  🚀 Ir a mi Panel de Control
                </Link>
              )}

              <button 
                onClick={() => { handleLogout(); setIsOpen(false); }} 
                className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold mt-2"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to={`${BASE_URL}login`} onClick={() => setIsOpen(false)}>
              <button className="w-full bg-brand-secondary text-white py-3 rounded-xl font-bold mt-2">
                Iniciar Sesión
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;