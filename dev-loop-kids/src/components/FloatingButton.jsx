// src/components/ui/FloatingButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FloatingButton = () => {
  return (
    <Link 
      to="/profesores"
      className="fixed left-6 bottom-10 z-50 group flex items-center gap-3 bg-brand-secondary text-white p-4 rounded-full shadow-2xl hover:bg-orange-500 transition-all transform hover:scale-110 active:scale-95"
    >
      {/* SVG del Joystick Clásico Atari 2600 */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
      >
        {/* Base del Joystick (Cuerpo oscuro) */}
        <rect 
          x="20" 
          y="55" 
          width="60" 
          height="35" 
          rx="6" 
          fill="#333333" 
          stroke="black" 
          strokeWidth="6" 
        />
        
        {/* Detalles de textura en la base (Líneas horizontales) */}
        <line x1="28" y1="65" x2="72" y2="65" stroke="black" strokeWidth="2" strokeOpacity="0.3" />
        <line x1="28" y1="75" x2="72" y2="75" stroke="black" strokeWidth="2" strokeOpacity="0.3" />

        {/* La Palanca (Stick) */}
        <rect 
          x="44" 
          y="15" 
          width="12" 
          height="45" 
          rx="6" 
          fill="#9e9e9e" 
          stroke="black" 
          strokeWidth="6" 
        />
        
        {/* El Botón Rojo Icónico */}
        <circle 
          cx="38" 
          cy="72" 
          r="9" 
          fill="#FF1744" 
          stroke="black" 
          strokeWidth="5" 
        />

        {/* Reflejo en el botón para darle volumen */}
        <circle cx="35" cy="69" r="2" fill="white" fillOpacity="0.4" />
      </svg>

      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold">
        Conoce a tus Profes
      </span>
    </Link>
  );
};

export default FloatingButton;