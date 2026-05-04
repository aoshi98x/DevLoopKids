// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        // REGISTRO
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName } // Enviamos el nombre al trigger
          }
        });

        if (error) throw error;
        
        // Con el Trigger SQL, la fila en 'profiles' se crea sola.
        alert('¡Cuenta creada! Revisa tu correo para activar tu perfil de explorador.');
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); 
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-4 border-brand-primary overflow-hidden">
        
        {/* TABS DE NAVEGACIÓN INTERNA */}
        <div className="flex border-b-4 border-gray-100">
          <button 
            onClick={() => { setIsRegister(false); setErrorMsg(null); }}
            className={`flex-1 py-4 font-black transition-all ${!isRegister ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}
          >
            ENTRAR
          </button>
          <button 
            onClick={() => { setIsRegister(true); setErrorMsg(null); }}
            className={`flex-1 py-4 font-black transition-all ${isRegister ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}
          >
            UNIRSE
          </button>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">
            {isRegister ? '¡Crea tu avatar de programador!' : '¡Bienvenido de nuevo, explorador!'}
          </h2>
          <p className="text-gray-500 text-center mb-8 font-medium">
            {isRegister ? 'Comienza tu viaje en el diseño y la tecnología.' : 'Tus cursos y profes te están esperando.'}
          </p>

          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl mb-6 font-bold text-sm">
              🚀 {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-2">Nombre de Aventurero</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. Lucas Pro"
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-primary outline-none transition-all font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-2">Correo Electrónico</label>
              <input 
                type="email" 
                required 
                placeholder="tu@correo.com"
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-primary outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-2">Contraseña Secreta</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-brand-primary outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-secondary text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] transition-all transform active:translate-y-1 active:shadow-none disabled:opacity-50 mt-4"
            >
              {loading ? 'CARGANDO MUNDO...' : isRegister ? '¡REGISTRARME AHORA!' : '¡VAMOS A CLASE!'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;