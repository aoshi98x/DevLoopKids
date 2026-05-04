// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AVATARES_PREDEFINIDOS = [
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kane&backgroundType=gradientLinear,solid',   // Niño
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lilly&backgroundType=gradientLinear,solid',  // Niña
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=JD&mouthProbability=100&mouth=smileLol&backgroundType=gradientLinear,solid', // Niño
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Ariel&backgroundType=gradientLinear,solid',  // Niña
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Caleb&backgroundType=gradientLinear,solid',  // Niño
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Willow&backgroundType=gradientLinear,solid' // Niña
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Estados de Interfaz
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  // Estados de Edición de Perfil
  const [newName, setNewName] = useState(profile?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Estados de Curso y Progreso
  const [courseInfo, setCourseInfo] = useState(null);
  const [progressStats, setProgressStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('student_progress')
          .select('course_id, completed_sessions')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError) throw progressError;
        if (!progressData) {
          setLoading(false);
          return;
        }

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`
            id, title, emoji, 
            modules ( sessions ( id ) )
          `)
          .eq('id', progressData.course_id)
          .maybeSingle();

        if (courseError) throw courseError;

        if (courseData) {
          setCourseInfo(courseData);
          const totalSessions = courseData.modules?.reduce((acc, mod) => acc + (mod.sessions?.length || 0), 0) || 0;
          const completedSessionsCount = progressData.completed_sessions?.length || 0;
          setProgressStats({ completed: completedSessionsCount, total: totalSessions });
        }
      } catch (e) {
        console.error("Error cargando dashboard:", e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Manejador de actualización de Avatar
  const handleUpdateAvatar = async (url) => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      if (error) throw error;
      setEditingAvatar(false);
      window.location.reload(); 
    } catch (e) {
      alert("Error al actualizar avatar");
    }
  };

  // Manejador de actualización de Perfil Completo
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Actualizar Nombre en la tabla Profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 2. Actualizar Contraseña si se escribió algo
      if (newPassword.length > 0) {
        if (newPassword.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) throw authError;
      }

      alert("¡Perfil actualizado con éxito! ✨");
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
    </div>
  );

  const progressPercentage = Math.round((progressStats.completed / progressStats.total) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PERFIL */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100 text-center relative overflow-hidden">
            <div className="relative inline-block mb-4">
              <img 
                src={profile?.avatar_url || AVATARES_PREDEFINIDOS[0]} 
                className="w-32 h-32 rounded-full border-4 border-brand-primary bg-gray-50 object-cover mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                alt="Avatar"
                onClick={() => setEditingAvatar(!editingAvatar)}
              />
              <div className="absolute bottom-0 right-0 bg-brand-primary text-white p-2 rounded-full shadow-lg pointer-events-none">
                ✨
              </div>
            </div>

            {editingAvatar ? (
              <div className="grid grid-cols-3 gap-2 mt-4 p-4 bg-gray-50 rounded-2xl animate-in fade-in zoom-in duration-300">
                {AVATARES_PREDEFINIDOS.map((url, i) => (
                  <img 
                    key={i} src={url} 
                    onClick={() => handleUpdateAvatar(url)}
                    className="w-full aspect-square rounded-xl cursor-pointer hover:scale-110 hover:border-2 border-brand-primary transition-all bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-800">{profile?.full_name || 'Explorador'}</h2>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{user?.email}</p>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 w-full py-4 bg-gray-800 text-white font-black rounded-2xl hover:bg-black transition-all flex justify-center items-center gap-2"
                >
                  ⚙️ Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PROGRESO */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-gray-100 h-full">
            <h3 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
              🚀 Mi Aventura Actual
            </h3>

            {courseInfo ? (
              <div className="space-y-10">
                <div className="bg-brand-primary/5 border-2 border-brand-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl animate-bounce-slow">{courseInfo.emoji}</div>
                  <div className="flex-grow text-center md:text-left">
                    <h4 className="text-3xl font-black text-gray-800 mb-2">{courseInfo.title}</h4>
                    <button 
                      onClick={() => navigate(`/salon/${courseInfo.id}`)}
                      className="mt-4 bg-brand-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-95"
                    >
                      CONTINUAR MISIÓN
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-gray-400 font-black text-sm uppercase tracking-tighter">Progreso Total</p>
                      <p className="text-5xl font-black text-brand-primary">{progressPercentage}%</p>
                    </div>
                    <div className="text-right text-gray-400 font-bold">
                      <p className="text-gray-800 font-black text-xl">{progressStats.completed} / {progressStats.total}</p>
                      <p className="text-sm">Misiones cumplidas</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden p-1 border-2 border-gray-50">
                    <div 
                      className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-xl">Aún no tienes misiones asignadas.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-brand-primary font-black hover:underline">
                  Ver catálogo de cursos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FLOTANTE DE EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center px-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !updating && setIsModalOpen(false)}></div>
          
          {/* Contenido del Modal */}
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-in zoom-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-800">Editar Perfil ⚙️</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Tu nombre en la academia"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Déjalo en blanco para no cambiarla"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-brand-primary font-bold text-gray-700"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#4338ca] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  {updating ? 'Guardando Cambios...' : 'Guardar Cambios 💾'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full text-gray-400 font-bold py-2 hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;