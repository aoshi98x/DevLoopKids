// src/pages/SessionDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import ReactMarkdown from 'react-markdown';

const SessionDetail = () => {
  const { user } = useAuth();
  const { cursoId, sesionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [completingSession, setCompletingSession] = useState(false);
  const [currentProgressArray, setCurrentProgressArray] = useState([]);
  const [userReservation, setUserReservation] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const availableDates = ['2026-05-10', '2026-05-11', '2026-05-12'];
  const availableTimes = ['16:00', '17:30', '19:00'];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: sData } = await supabase
          .from('sessions')
          .select('title, id, type, video_drive_id, order_num')
          .eq('id', sesionId)
          .single();
        setSessionData(sData);

        const { data: fileData } = supabase.storage.from('session_content').getPublicUrl(`${sesionId}.md`);
        const mdRes = await fetch(fileData.publicUrl);
        setMarkdownContent(mdRes.ok ? await mdRes.text() : '## 🛠️ Misión en preparación');

        if (user) {
          const { data: prog } = await supabase
            .from('student_progress')
            .select('completed_sessions')
            .eq('user_id', user.id)
            .eq('course_id', cursoId)
            .single();
          
          const completed = prog?.completed_sessions || [];
          setCurrentProgressArray(completed);
          setIsCompleted(completed.includes(Number(sesionId)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [sesionId, user, cursoId]);

  const markSessionComplete = async () => {
    if (!user || completingSession) return;
    setCompletingSession(true);

    try {
      // 1. Preparamos el nuevo array asegurando que el ID sea un número y no se duplique
      const newCompleted = Array.from(new Set([...currentProgressArray, Number(sesionId)]));

      // 2. Usamos .upsert para manejar tanto la creación como la actualización del progreso
      // Nota: Para que upsert funcione, 'user_id' y 'course_id' deben ser una clave única compuesta en Supabase
      const { error } = await supabase
        .from('student_progress')
        .upsert({ 
          user_id: user.id, 
          course_id: Number(cursoId), 
          completed_sessions: newCompleted,
          last_accessed: new Date().toISOString() // Opcional: para saber cuándo entró por última vez
        }, { 
          onConflict: 'user_id, course_id' 
        });

      if (error) throw error;

      // 3. Actualizamos los estados locales para que el botón cambie a verde de inmediato
      setIsCompleted(true);
      setCurrentProgressArray(newCompleted);
      
      console.log('✅ Progreso guardado con éxito en la nube');
      
    } catch (e) {
      console.error("Error al guardar progreso:", e.message);
      alert("No pudimos guardar tu progreso. Revisa tu conexión a internet.");
    } finally {
      setCompletingSession(false);
    }
  };

  const handleReservation = () => {
    if (!selectedDate || !selectedTime) return alert('Elige día y hora');
    const scheduledISO = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    setUserReservation({ scheduled_at: scheduledISO });
  };

  const renderActionButton = () => {
    if (isCompleted) {
      return (
        <div className="bg-green-50 border-2 border-green-500 p-6 rounded-3xl text-center text-green-700 font-black text-xl shadow-inner">
          ✅ ¡Misión Cumplida!
        </div>
      );
    }

    if (sessionData?.type === 'synchronous') {
      if (!userReservation) {
        return (
          <div className="bg-gray-100 p-6 rounded-3xl text-center border-4 border-dashed border-gray-200">
            <p className="text-gray-500 font-bold text-lg">🔒 Reserva tu clase para habilitar esta misión.</p>
          </div>
        );
      }

      const canComplete = new Date() >= new Date(userReservation.scheduled_at);
      if (!canComplete) {
        return (
          <div className="bg-orange-50 p-6 rounded-3xl text-center border-2 border-orange-200 shadow-sm">
            <p className="text-orange-600 font-bold">⏳ Podrás marcarla como completada al finalizar tu clase en vivo.</p>
          </div>
        );
      }
    }

    return (
      <button
        onClick={markSessionComplete}
        disabled={completingSession}
        className="w-full py-5 bg-brand-primary text-white font-black text-xl rounded-3xl shadow-[0_8px_0_0_#4338ca] hover:shadow-[0_4px_0_0_#4338ca] active:translate-y-1 transition-all"
      >
        {completingSession ? '🚀 GUARDANDO...' : '✔️ ¡TERMINÉ MI MISIÓN!'}
      </button>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
    </div>
  );

  // Variable para determinar si el contenido debe ocupar todo el ancho
  const isFullWidth = sessionData?.type === 'asynchronous';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className={`${isFullWidth ? 'max-w-5xl' : 'max-w-7xl'} mx-auto transition-all duration-500`}>
        
        {/* Header Superior */}
        <div className="mb-8 flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border-2 border-gray-100">
          <button onClick={() => navigate(`/salon/${cursoId}`)} className="flex items-center text-gray-500 font-black hover:text-brand-primary transition-colors text-lg">
            ⬅️ <span className="ml-2 hidden md:inline">VOLVER AL SALÓN</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="bg-brand-primary text-white px-5 py-2 rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/20">
              MISIÓN #{sessionData?.order_num}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* COLUMNA PRINCIPAL */}
          <div className={`${isFullWidth ? 'w-full' : 'lg:w-2/3'} flex flex-col gap-8`}>
            
            <div className="bg-white p-8 md:p-14 rounded-[3rem] shadow-xl border-2 border-gray-100">
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-8 leading-tight tracking-tight">
                {sessionData?.title}
              </h1>

              {/* Contenedor de Video Protegido */}
                {sessionData?.video_drive_id && (
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span className="bg-brand-primary/10 p-2 rounded-lg">📹</span> 
                    Video de la Sesión
                    </h2>
                    
                    {/* 🛡️ CAPA DE PROTECCIÓN: Evita el clic derecho y oculta controles nativos */}
                    <div 
                    className="relative w-full bg-black rounded-[1.5rem] overflow-hidden shadow-2xl border-8 border-black aspect-video group"
                    onContextMenu={(e) => e.preventDefault()} // Bloquea clic derecho
                    >
                    {/* 
                        Ocultamos los bordes superiores donde Google Drive suele mostrar 
                        el botón de "Abrir en nueva pestaña" y el título.
                    */}
                    <div className="absolute inset-0 z-0">
                       <iframe 
                        src={`https://drive.google.com/file/d/${sessionData.video_drive_id}/preview`} 
                        className="w-full h-[105%] -mt-[2%]" 
                        allow="autoplay; fullscreen"
                        // 🔒 sandbox permite que el video cargue y se ejecute pero bloquea ventanas emergentes 
                        // y envíos de formularios hacia Google
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        title="Misión Video"
                        />
                    </div>

                    {/* 
                        CAPA INVISIBLE SUPERIOR:
                        Colocamos un div transparente sobre el área de los controles de Google
                        para que el usuario no pueda hacer clic en el logo de Drive o en compartir.
                    */}
                    <div className="absolute top-0 right-0 w-24 h-16 z-10 bg-transparent" />
                    <div className="absolute top-0 left-0 w-full h-12 z-10 bg-transparent" />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 text-gray-400 bg-gray-100/50 w-fit px-4 py-2 rounded-xl">
                    <span className="text-lg">🔒</span>
                    <p className="text-xs font-bold uppercase tracking-widest">
                        Contenido Protegido - Academia DevLoop
                    </p>
                    </div>
                </div>
                )}

              {/* Botón de Acción destacado */}
              <div className="mb-12">
                {renderActionButton()}
              </div>

              {/* Renderizado de Markdown mejorado */}
              <div className="prose prose-lg prose-brand max-w-none 
                text-gray-600 font-medium leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-black prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-gray-50 prose-h2:pb-2
                prose-p:mb-6 prose-p:text-lg
                prose-li:text-lg prose-li:mb-2
                prose-strong:text-brand-primary prose-strong:font-black
                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-10
                prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded-lg prose-code:text-brand-primary
                prose-blockquote:border-l-8 prose-blockquote:border-brand-primary prose-blockquote:bg-gray-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl">
                <ReactMarkdown>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* COLUMNA LATERAL (Solo Sincrónicas) */}
          {!isFullWidth && (
            <div className="lg:w-1/3">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-brand-primary sticky top-10 transform hover:rotate-1 transition-transform">
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4 animate-bounce-slow">🗓️</div>
                  <h3 className="text-3xl font-black text-gray-800">Tu Cita en Vivo</h3>
                  <p className="text-gray-500 font-bold mt-2">Prepárate para la aventura.</p>
                </div>
                
                {userReservation ? (
                  <div className="bg-indigo-50 border-4 border-indigo-100 p-8 rounded-[2rem] text-center">
                    <p className="text-indigo-800 font-black text-lg mb-4 underline decoration-brand-primary underline-offset-4">RESERVA ACTIVA</p>
                    <div className="text-5xl font-black text-brand-primary mb-2">
                      {new Date(userReservation.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-indigo-600 font-black text-xl">
                      {new Date(userReservation.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 ml-2 uppercase tracking-widest">Elige el día</label>
                      <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-5 rounded-2xl border-4 border-gray-50 bg-gray-50 font-black text-gray-700 focus:border-brand-primary outline-none transition-all cursor-pointer">
                        <option value="">¿Cuándo?</option>
                        {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-400 mb-2 ml-2 uppercase tracking-widest">Elige la hora</label>
                      <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-5 rounded-2xl border-4 border-gray-50 bg-gray-50 font-black text-gray-700 focus:border-brand-primary outline-none transition-all cursor-pointer">
                        <option value="">¿A qué hora?</option>
                        {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button onClick={handleReservation} className="w-full bg-brand-secondary text-white font-black py-5 rounded-[2rem] shadow-[0_8px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] active:translate-y-1 transition-all text-xl mt-4">
                      ¡Reservar Lugar! 🚀
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SessionDetail;