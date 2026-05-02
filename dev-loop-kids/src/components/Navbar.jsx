// src/components/landing/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Definimos la base de la ruta según tu requerimiento
  const BASE_URL = "/";

  const navLinks = [
    { name: 'Inicio', path: `${BASE_URL}` },
    { name: 'Precios', path: `${BASE_URL}pricing` },// Ajustado a la estructura de hash
  ];
const { user, profile } = useAuth();
    
        
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO */}
        <Link 
          to={`${BASE_URL}#`} 
          className="text-2xl font-black text-brand-primary tracking-tighter flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-brand-primary rounded-lg rotate-3 flex items-center justify-center text-white text-sm">
            DL
          </div>
          DevLoop<span className="text-brand-secondary text-lg">Kids</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="font-bold text-gray-600 hover:text-brand-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link to={`${BASE_URL}login`}>
            <button className="bg-brand-primary text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-600 transition-all shadow-md">
              Ingresar
            </button>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-brand-primary p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-gray-700"
            >
              {link.name}
            </Link>
          ))}
            {user ? (
                <span className="font-bold text-brand-primary">¡Hola, {profile?.full_name || 'Explorador'}!</span>
                ) : (
                <Link to={`${BASE_URL}/login`}>
                    <button>Ingresar</button>
                </Link>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;