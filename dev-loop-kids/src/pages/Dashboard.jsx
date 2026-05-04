// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AVATARES_PREDEFINIDOS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Midnight',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zelda'
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Estados de Perfil
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [nombre, setNombre] = useState(profile?.full_name || '');
  
  // Estados de Seguridad
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Estados de Curso y Progreso
  const [courseInfo, setCourseInfo] = useState(null);
  const [progressStats, setProgressStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            // 1. Buscamos el progreso del estudiante
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

            // 2. NUEVA CONSULTA: Entramos a módulos para llegar a las sesiones
            const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select(`
                id, 
                title, 
                emoji, 
                modules (
                sessions ( id )
                )
            `)
            .eq('id', progressData.course_id)
            .maybeSingle();

            if (courseError) throw courseError;

            if (courseData) {
            setCourseInfo(courseData);
            
            // 3. CÁLCULO DEL TOTAL: Aplanamos los arrays anidados
            // Sumamos la cantidad de sesiones de cada módulo
            const totalSessions = courseData.modules?.reduce((acc, mod) => {
                return acc + (mod.sessions?.length || 0);
            }, 0) || 0;

            const completedSessionsCount = progressData.completed_sessions?.length || 0;

            setProgressStats({
                completed: completedSessionsCount,
                total: totalSessions
            });
            }

        } catch (e) {
            console.error("Error cargando dashboard:", e.message);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
  }, [user]); // Quitamos cursoId de las dependencias ya que lo obtenemos de la consulta

  const handleUpdateAvatar = async (url) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
      
      if (error) throw error;
      setEditingAvatar(false);
      window.location.reload(); 
    } catch (e) {
      alert("Error al actualizar avatar");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Error: " + error.message);
    else alert("¡Contraseña actualizada con éxito! 🔐");
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary"></div></div>;

  const progressPercentage = Math.round((progressStats.completed / progressStats.total) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PERFIL Y SEGURIDAD */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={profile?.avatar_url || AVATARES_PREDEFINIDOS[0]} 
                className="w-32 h-32 rounded-full border-4 border-brand-primary object-cover mx-auto"
                alt="Avatar"
              />
              <button 
                onClick={() => setEditingAvatar(!editingAvatar)}
                className="absolute bottom-0 right-0 bg-brand-secondary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                ✏️
              </button>
            </div>

            {editingAvatar ? (
              <div className="grid grid-cols-3 gap-2 mt-4 p-4 bg-gray-50 rounded-2xl">
                {AVATARES_PREDEFINIDOS.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    onClick={() => handleUpdateAvatar(url)}
                    className="w-full aspect-square rounded-xl cursor-pointer hover:border-2 border-brand-primary transition-all"
                  />
                ))}
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-800">{profile?.full_name || 'Explorador'}</h2>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{user?.email}</p>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span>🔐</span> Seguridad
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1 uppercase">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-brand-primary transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <button className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-black transition-all">
                Actualizar Llave 🔑
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: CURSOS Y PROGRESO */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-gray-100 h-full">
            <h3 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span>🚀</span> Mi Aventura Actual
            </h3>

            {courseInfo ? (
              <div className="space-y-10">
                <div className="bg-brand-primary/5 border-2 border-brand-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">{courseInfo.emoji}</div>
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
                    <div className="text-right">
                      <p className="text-gray-800 font-black text-xl">{progressStats.completed} / {progressStats.total}</p>
                      <p className="text-gray-400 font-bold text-sm">Misiones cumplidas</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden p-1 border-2 border-gray-50">
                    <div 
                      className="h-full bg-brand-primary rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-100 p-6 rounded-2xl flex items-center gap-4">
                  <span className="text-3xl">🏆</span>
                  <p className="text-yellow-700 font-bold">
                    {progressPercentage === 100 
                      ? "¡Increíble! Has completado todas las misiones. ¡Eres un maestro!" 
                      : "¡Vas muy bien! Cada misión te acerca más a ser un experto."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold text-xl">Aún no tienes misiones asignadas.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-6 text-brand-primary font-black underline underline-offset-4"
                >
                  Explorar catálogo de cursos
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;