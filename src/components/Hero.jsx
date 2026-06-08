import React from 'react';
import './Hero.css';
import heroImage from '../assets/hero_coastal.png';

const Hero = () => {
  return (
    <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="hero-overlay"></div>
    </section>
  );
};

export default Hero;
