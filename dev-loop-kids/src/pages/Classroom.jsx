// src/pages/Classroom.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';

const Classroom = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]); // Nuevo: Array de IDs completados
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!user) return;
      try {
        // 1. Info básica del curso
        const { data: courseData } = await supabase
          .from('courses')
          .select('title, emoji')
          .eq('id', cursoId)
          .single();
        setCourse(courseData);

        // 2. Módulos y sesiones
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select(`
            id, title, order_num,
            sessions ( id, title, order_num )
          `)
          .eq('course_id', cursoId)
          .order('order_num', { ascending: true });

        if (modulesError) throw modulesError;

        const sortedModules = modulesData?.map(mod => ({
          ...mod,
          sessions: mod.sessions.sort((a, b) => a.order_num - b.order_num)
        })) || [];
        setModules(sortedModules);

        // 3. NUEVA LÓGICA: Traer el array de sesiones completadas
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('completed_sessions')
          .eq('user_id', user.id)
          .eq('course_id', cursoId)
          .single();

        setCompletedSessions(progressData?.completed_sessions || []);

      } catch (error) {
        console.error('Error cargando el salón de clases:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchClassroomData();
  }, [cursoId, user, authLoading]);

  if (!authLoading && !profile?.is_active) {
    return <Navigate to={`/curso/${cursoId}`} replace />;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  // --- ALGORITMO DE RENDERIZADO INTELIGENTE ---
  // Una sesión está desbloqueada si:
  // 1. Es la primera sesión del curso.
  // 2. O si la sesión anterior fue completada.
  
  let lastWasCompleted = true; // La primera sesión siempre se asume "desbloqueada"

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-brand-primary mb-4 tracking-tight">
            {course?.emoji} Salón de Clases
          </h1>
          <h2 className="text-2xl font-bold text-gray-700">{course?.title}</h2>
          <p className="text-gray-500 font-medium mt-2">Tu progreso actual en esta aventura.</p>
        </header>

        <div className="space-y-8">
          {modules.map((mod, modIndex) => (
            <div key={mod.id} className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
              
              <div className="bg-gray-50 px-8 py-6 border-b-2 border-gray-100 flex items-center gap-4">
                <div className="bg-brand-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl">
                  {modIndex + 1}
                </div>
                <h2 className="text-2xl font-black text-gray-800">{mod.title}</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {mod.sessions.map((session, sessionIndex) => {
                  
                  // Lógica de estados basada en el Array
                  const isCompleted = completedSessions.includes(session.id);
                  const isLocked = !lastWasCompleted && !isCompleted;
                  const isCurrent = lastWasCompleted && !isCompleted;

                  // Actualizamos el estado para la siguiente sesión en el bucle
                  lastWasCompleted = isCompleted;

                  return (
                    <div 
                      key={session.id}
                      onClick={() => !isLocked && navigate(`/salon/${cursoId}/sesion/${session.id}`)}
                      className={`flex items-center p-5 rounded-2xl border-2 transition-all ${
                        isLocked 
                          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed grayscale' 
                          : isCurrent
                            ? 'border-brand-primary bg-brand-primary/10 cursor-pointer shadow-md transform hover:-translate-y-1'
                            : 'border-green-200 bg-green-50 cursor-pointer hover:shadow-md transform hover:-translate-y-1'
                      }`}
                    >
                      {/* Ícono dinámico */}
                      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl mr-6 shrink-0 transition-colors ${
                        isLocked ? 'bg-gray-200 text-gray-400' 
                        : isCurrent ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                        : 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      }`}>
                        {isLocked ? '🔒' : isCompleted ? '✅' : '▶️'}
                      </div>

                      <div className="flex-grow">
                        <h3 className={`text-xl font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                          Sesión {sessionIndex + 1}: {session.title}
                        </h3>
                        <p className={`text-sm font-bold mt-1 ${
                          isLocked ? 'text-gray-400' 
                          : isCurrent ? 'text-brand-primary' 
                          : 'text-green-600'
                        }`}>
                          {isLocked 
                            ? 'Misión bloqueada' 
                            : isCompleted 
                              ? '¡Misión cumplida! Toca para repasar.' 
                              : '¡Tu misión actual! Toca para empezar.'}
                        </p>
                      </div>

                      {!isLocked && (
                        <div className="text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Classroom;