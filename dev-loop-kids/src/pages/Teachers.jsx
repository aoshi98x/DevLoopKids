// src/pages/Teachers.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*');
        if (error) throw error;
        setTeachers(data);
      } catch (err) {
        console.error("Error cargando profes:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-black text-gray-800 mb-4">Nuestros Guías 🚀</h1>
        <p className="text-xl text-gray-600 mb-16">Expertos apasionados por enseñar tecnología a los más pequeños.</p>

        {loading ? (
          <div className="animate-pulse text-2xl font-bold text-brand-primary">Buscando a los mejores profes...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border-2 border-transparent hover:border-brand-primary transition-all group">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-indigo-50 border-4 border-white shadow-inner overflow-hidden group-hover:rotate-6 transition-transform">
                  <img src={teacher.avatar_url} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{teacher.name}</h3>
                <span className="inline-block px-4 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold mb-4">
                  {teacher.specialty}
                </span>
                <p className="text-gray-600 leading-relaxed">{teacher.bio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;