import React, { useState, useEffect } from 'react';
import './Hero.css';
import heroImage from '../assets/hero_coastal.png';
import { fetchSiteGallery } from '../services/api';

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadData = () => {
      fetchSiteGallery().then(data => {
        if (!mounted) return;
        const bannerImages = data.filter(img => img.category === 'banner' || img.showOnSlider);
        if (bannerImages.length > 0) {
          setBanners(bannerImages);
        }
      });
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const currentBg = banners.length > 0 ? banners[currentIdx].imageUrl : heroImage;

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
      <img 
        src={currentBg} 
        alt="Hero Background" 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, transition: 'opacity 1s ease-in-out' }}
        onError={(e) => {
          if (e.target.src !== heroImage) {
            e.target.src = heroImage;
          }
        }}
      />
      <div className="hero-overlay" style={{ zIndex: 1, position: 'relative' }}></div>
      
      {banners.length > 1 && (
        <div className="hero-indicators" style={{ zIndex: 2, position: 'relative' }}>
          {banners.map((_, idx) => (
            <div 
              key={idx} 
              className={`hero-indicator ${idx === currentIdx ? 'active' : ''}`}
              onClick={() => setCurrentIdx(idx)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
