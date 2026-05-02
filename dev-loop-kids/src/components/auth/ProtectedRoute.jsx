// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-bounce text-4xl">🚀</div>
      </div>
    );
  }

  if (!user) {
    // Si no hay usuario, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;