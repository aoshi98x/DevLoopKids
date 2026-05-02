// src/pages/Home.jsx
import React from 'react';
import Hero from '../components/landing/Hero';
import CourseGrid from '../components/landing/CourseGrid';
import Pricing from '../components/landing/Pricing';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <CourseGrid />
        <Pricing />
      </main>
    </div>
  );
};

export default Home;