// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabaseClient';
import ReactMarkdown from 'react-markdown';

// Función para limpiar el título y convertirlo en un formato seguro para archivos (slug)
const createFileName = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-') 
    .replace(/[^a-z0-9-]/g, '') 
    + '.md'; 
};

const CourseDetail = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚦 EL SEMÁFORO: Si la autenticación sigue pensando, detenemos la carga del curso.
    // Esto garantiza que jamás se renderice un botón incorrecto por falta de datos del perfil.
    if (authLoading) return;

    const fetchCourseDetails = async () => {
      try {
        // 1. Buscamos los datos básicos del curso en la BD
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // 2. Generamos el nombre del archivo exacto (ej: 'mi-primer-curso.md')
        const targetFileName = createFileName(courseData.title);

        // 3. Obtenemos la URL del archivo específico
        const { data: specificFileData } = supabase
          .storage
          .from('course_content')
          .getPublicUrl(targetFileName);

        const specificResponse = await fetch(specificFileData.publicUrl);

        // 4. Lógica de renderizado con Fallback
        if (specificResponse.ok) {
          const text = await specificResponse.text();
          setMarkdownContent(text);
        } else {
          const { data: defaultFileData } = supabase
            .storage
            .from('course_content')
            .getPublicUrl('default.md');

          const defaultResponse = await fetch(defaultFileData.publicUrl);

          if (defaultResponse.ok) {
            const defaultText = await defaultResponse.text();
            setMarkdownContent(defaultText);
          } else {
            setMarkdownContent('## 🚀 Misión en Construcción\n\nEstamos diseñando una nueva aventura para ti. ¡Vuelve pronto!');
          }
        }

      } catch (error) {
        console.error('Error al cargar el curso:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, authLoading]); // <-- Añadimos authLoading a las dependencias para que React sepa cuándo reanudar

  // 🛡️ Ahora este spinner cubrirá la pantalla completa hasta que TANTO el Auth como el Curso estén listos
  if (loading || authLoading) {
    return (
      <div className="min-h-[90vh] flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[90vh] flex flex-col justify-center items-center bg-gray-50 px-6">
        <h2 className="text-3xl font-black text-gray-800 mb-4">¡Ruta no encontrada! 🗺️</h2>
        <p className="text-gray-600 mb-8">El curso que buscas no existe o ha sido movido.</p>
        <Link to="/">
          <button className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-indigo-600 transition-all">
            Volver a la Academia
          </button>
        </Link>
      </div>
    );
  }

  const courseImage = course.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="min-h-[90vh] py-12 px-6 bg-gray-50 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl border-4 border-brand-primary overflow-hidden flex flex-col md:flex-row h-[80vh]">
        
        {/* Imagen del Curso */}
        <div className="md:w-5/12 h-64 md:h-full bg-gray-200 relative overflow-hidden shrink-0">
          <img 
            src={courseImage} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
          {course.emoji && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl text-4xl shadow-lg border-2 border-gray-100">
              {course.emoji}
            </div>
          )}
        </div>

        {/* Detalles y Markdown */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col overflow-hidden">
          
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-6 tracking-tight shrink-0 border-b-2 border-gray-100 pb-4">
            {course.title}
          </h1>
          
          <div className="overflow-y-auto pr-4 mb-6 flex-grow custom-scrollbar text-gray-600">
            <div className="prose prose-brand max-w-none text-base font-medium leading-relaxed
                prose-headings:font-black prose-headings:text-gray-800 prose-headings:mb-3 prose-headings:mt-6
                prose-p:mb-4
                prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4 prose-li:mb-1
                prose-strong:text-brand-primary prose-strong:font-black">
              
              <ReactMarkdown>
                {markdownContent}
              </ReactMarkdown>

            </div>
          </div>

          <div className="shrink-0 pt-4 border-t-2 border-gray-100">
            {!user ? (
              <Link to="/login">
                <button className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#4338ca] hover:shadow-[0_4px_0_0_#4338ca] transition-all transform active:translate-y-1 active:shadow-none">
                  Inicia Sesión para Empezar
                </button>
              </Link>
            ) : !profile ? (
              <div className="w-full bg-gray-300 text-gray-300 font-black py-4 rounded-2xl cursor-wait">
                Cargando perfil...
              </div>
            ) : profile?.is_active ? (
              <Link to={`/salon/${id}`}> {/* 🛡️ CORRECCIÓN: Usamos la variable 'id' 100% segura */}
                <button className="w-full bg-green-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#16a34a] hover:shadow-[0_4px_0_0_#16a34a] transition-all transform active:translate-y-1 active:shadow-none">
                  🚀 Ir al Salón de Clases
                </button>
              </Link>
            ) : (
              <Link to="/#pricing">
                <button className="w-full bg-brand-secondary text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] transition-all transform active:translate-y-1 active:shadow-none">
                  ⭐ ¡Inscribirse Ahora!
                </button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetail;