// src/App.jsx
import React from 'react';
import Hero from './components/landing/Hero';
import CourseGrid from './components/landing/CourseGrid';
import Pricing from './components/landing/Pricing';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Home />
      </main>
    </div>
  );
}

export default App;