import React, { useState, useEffect } from 'react';
import { Waves, Wifi, Coffee, Utensils, Dumbbell, Sun } from 'lucide-react';
import './TheSanctuary.css';
import { fetchSiteContent, fetchSiteGallery } from '../services/api';

const TheSanctuary = () => {
  const defaultAmenities = [
    { icon: <Waves size={24} />, name: 'Private Beach' },
    { icon: <Wifi size={24} />, name: 'High-Speed WiFi' },
    { icon: <Coffee size={24} />, name: 'Artisan Cafe' },
    { icon: <Utensils size={24} />, name: 'Fine Dining' },
    { icon: <Dumbbell size={24} />, name: 'Fitness Center' },
    { icon: <Sun size={24} />, name: 'Outdoor Pool' },
  ];

  const [aboutText, setAboutText] = useState("Situated on the edge of the sapphire coast, The Azure Hotel offers an unparalleled blend of modern luxury and serene natural beauty. Wake up to the sound of crashing waves, indulge in world-class dining, and let our dedicated team curate your perfect escape.");
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadData = () => {
      fetchSiteContent('about').then(data => {
        if (mounted && data && data.text) {
          setAboutText(data.text);
        }
      });
      fetchSiteGallery().then(data => {
        if (mounted && data) {
          const allowed = ['general', 'exterior', 'interior', 'view'];
          setGallery(data.filter(img => allowed.includes(img.category)));
        }
      });
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <section className="section sanctuary-section">
      <div className="container">
        <h2 className="section-title">The Sanctuary</h2>
        <p className="sanctuary-description">
          {aboutText}
        </p>

        <div className="amenities-grid">
          {defaultAmenities.map((amenity, index) => (
            <div key={index} className="amenity-card">
              <div className="amenity-icon">{amenity.icon}</div>
              <span className="amenity-name">{amenity.name}</span>
            </div>
          ))}
        </div>

        {gallery.length > 0 && (
          <div className="hotel-gallery-section" style={{ marginTop: '4rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Hotel Gallery</h3>
            <div className="hotel-gallery-grid">
              {gallery.map(img => (
                <div key={img.id} className="gallery-item">
                  <img 
                    src={img.imageUrl} 
                    alt={img.caption || "Hotel gallery"} 
                    loading="lazy" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {img.caption && <div className="gallery-caption">{img.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TheSanctuary;
