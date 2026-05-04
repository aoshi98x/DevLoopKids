// src/components/landing/CourseGrid.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const colorVariants = {
  'bg-blue-100': 'bg-blue-100',
  'bg-purple-100': 'bg-purple-100',
  'bg-green-100': 'bg-green-100',
  'bg-yellow-100': 'bg-yellow-100',
  'bg-orange-100': 'bg-orange-100',
};

const CourseGrid = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth(); 

  useEffect(() => {
    // 🚦 El semáforo permanece: esperamos a que AuthContext termine su trabajo
    if (authLoading) return;

    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        if (data) setCourses(data);
      } catch (error) {
        console.error('Error al cargar cursos:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [authLoading]); 

  const handleCourseClick = (course) => {
    const safeId = course.id || course.ID || course.course_id;
    if (safeId) {
      navigate(`/curso/${safeId}`);
    }
  };

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Cursos Destacados ✨</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id || course.course_id || Math.random()} 
                onClick={() => handleCourseClick(course)}
                className={`${colorVariants[course.color] || 'bg-gray-100'} p-8 rounded-[2rem] border-b-[6px] border-black/10 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2 flex flex-col h-full`}
              >
                <div className="text-5xl mb-4">{course.emoji}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{course.title}</h3>
                <p className="text-gray-700 font-medium flex-grow">{course.description}</p>
                
                <button className="mt-6 w-full py-3 bg-white/60 hover:bg-white rounded-full font-bold text-gray-800 transition-colors shadow-sm pointer-events-none">
                  Explorar Curso
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseGrid;