// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FloatingButton from './components/FloatingButton';
import Home from './pages/Home';
import Teachers from './pages/Teachers'; // La crearemos ahora
import Login from './pages/Login';
import SessionDetail from './pages/SessionDetail';
import CourseDetail from './pages/CourseDetail';
import Classroom from './pages/Classroom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative font-sans">
          <Navbar />
          <FloatingButton />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profesores" element={<Teachers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/curso/:id" element={<CourseDetail />} />
            <Route path="/salon/:cursoId" element={<Classroom />} />
            <Route path="/salon/:cursoId/sesion/:sesionId" element={<SessionDetail />} />
            {/* RUTA PROTEGIDA*/}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;