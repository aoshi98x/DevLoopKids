// src/components/landing/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-brand-primary to-purple-600 py-24 px-6 text-center text-white overflow-hidden">
      {/* Fondo geométrico opcional para dar textura */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          ¡Crea, Juega y <span className="text-brand-secondary">Aprende!</span> 🚀
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-white/90">
          El portal donde descubres los secretos de la programación y el diseño mientras te diviertes.
        </p>
        <button className="bg-brand-secondary hover:bg-orange-500 text-white font-bold py-4 px-12 rounded-full transition-transform transform hover:scale-105 shadow-xl text-lg">
          ¡Comenzar mi Aventura!
        </button>
      </div>
    </section>
  );
};

export default Hero;