// src/components/landing/Pricing.jsx
import React from 'react';

const Pricing = () => {
  return (
    <section className="py-24 bg-gray-50 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Planes de Aprendizaje 💎</h2>
        
        <div className="flex flex-col md:flex-row justify-center items-top gap-8">
          
          {/* Plan Básico módulo */}
          <div className="bg-white p-10 rounded-[2rem] border-2 border-gray-200 w-full md:w-1/2 max-w-sm text-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-semibold mb-2 text-gray-700">Explorador</h3>
            <div className="text-5xl font-extrabold mb-6 text-gray-900">
              $45<span className="text-lg text-gray-500 font-normal">/hora</span>
            </div>
            <div className="text-3xl font-extrabold mb-6 text-gray-900">
               $540 <span className="text-lg text-gray-500 font-normal">/mes</span>
            </div>
            <p className="text-gray-600 mb-8">Perfecto para dar los primeros pasos en la tecnología.</p>
            
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> 1 hora por sesión</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Acceso a curso base</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Proyectos de prueba</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Soporte asistido</li>
            </ul>
            
            <button className="w-full py-3 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Empezar Ahora
            </button>
          </div>
          {/* Plan Full módulo */}
          <div className="bg-white p-10 rounded-[2rem] border-4 border-brand-secondary w-full md:w-1/2 max-w-sm text-center shadow-xl relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-secondary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              MEJOR OPORTUNIDAD
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-700">Aventurero</h3>
            <div className="text-5xl font-extrabold mb-6 text-gray-900">
              $35<span className="text-lg text-gray-500 font-normal">/hora</span>
            </div>
            <div className="text-3xl font-extrabold mb-6 text-gray-900">
               $840 <span className="text-lg text-gray-500 font-normal">/mes</span>
            </div>
            <p className="text-gray-600 mb-8">Ideal para futuros innovadores.</p>
            
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> 2 horas por sesión</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Acceso a curso full</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Proyectos de prueba</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Soporte en tiempo real</li>
            </ul>
            
            <button className="w-full py-3 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Empezar Ahora
            </button>
          </div>

          {/* Plan Pro (Destacado) */}
          <div className="bg-white p-10 rounded-[2rem] border-4 border-brand-primary w-full md:w-1/2 max-w-sm text-center shadow-xl relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              MÁS POPULAR
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-brand-primary">Creador Pro</h3>
            <div className="text-5xl font-extrabold mb-6 text-gray-900">
              $30<span className="text-lg text-gray-500 font-normal">/hora</span>
            </div>
            <div className="text-3xl font-extrabold mb-6 text-gray-900">
              $700<span className="text-lg text-gray-500 font-normal">/mes</span>
            </div>
            <div className="text-2xl font-extrabold mb-6 text-gray-900">
              $8400<span className="text-lg text-gray-500 font-normal">/año</span>
            </div>
            <p className="text-gray-600 mb-8">Acceso total durante un año al curso seleccionado para los futuros genios del desarrollo.</p>
            
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Paga de contado o a cuotas flexibles</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Certificados digitales</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Todos los módulos incluidos</li>
              <li className="flex items-center text-gray-600"><span className="text-brand-accent mr-2 font-bold">✓</span> Mentoría paso a paso</li>
            </ul>
            
            <button className="w-full py-3 px-6 rounded-full bg-brand-primary text-white font-semibold hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg">
              Ser Pro
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;