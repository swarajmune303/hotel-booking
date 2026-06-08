import React from 'react';
import { Waves, Wifi, Coffee, Utensils, Dumbbell, Sun } from 'lucide-react';
import './TheSanctuary.css';

const TheSanctuary = () => {
  const amenities = [
    { icon: <Waves size={24} />, name: 'Private Beach' },
    { icon: <Wifi size={24} />, name: 'High-Speed WiFi' },
    { icon: <Coffee size={24} />, name: 'Artisan Cafe' },
    { icon: <Utensils size={24} />, name: 'Fine Dining' },
    { icon: <Dumbbell size={24} />, name: 'Fitness Center' },
    { icon: <Sun size={24} />, name: 'Outdoor Pool' },
  ];

  return (
    <section className="section sanctuary-section">
      <div className="container">
        <h2 className="section-title">The Sanctuary</h2>
        <p className="sanctuary-description">
          Situated on the edge of the sapphire coast, The Azure Hotel offers an unparalleled
          blend of modern luxury and serene natural beauty. Wake up to the sound of crashing waves,
          indulge in world-class dining, and let our dedicated team curate your perfect escape.
        </p>

        <div className="amenities-grid">
          {amenities.map((amenity, index) => (
            <div key={index} className="amenity-card">
              <div className="amenity-icon">{amenity.icon}</div>
              <span className="amenity-name">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheSanctuary;
