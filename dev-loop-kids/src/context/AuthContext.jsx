// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Función maestra para cargar usuario y perfil sin bloqueos
    const loadUserAndProfile = async (sessionUser) => {
      if (!sessionUser) {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setUser(sessionUser);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) throw error;
        if (isMounted) setProfile(data);
      } catch (error) {
        console.error('Error al cargar perfil:', error.message);
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 1. Ejecución inmediata al dar F5
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error validando la sesión en F5:", error.message);
        if (isMounted) setLoading(false);
        return;
      }
      loadUserAndProfile(session?.user);
    });

    // 2. Escuchador en tiempo real para Logins y Logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignoramos el INITIAL_SESSION porque ya lo manejamos con getSession arriba
      if (event === 'INITIAL_SESSION') return;
      
      loadUserAndProfile(session?.user);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);