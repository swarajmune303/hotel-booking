import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import './LocateUs.css';

const LocateUs = () => {
  return (
    <section className="section locate-section">
      <div className="container">
        <h2 className="section-title">Locate Us</h2>
        <div className="locate-content">
          <div className="locate-info">
            <div className="info-block">
              <MapPin className="icon" size={24} />
              <div>
                <h3>Address</h3>
                <p>123 Sapphire Coast Road<br />Oceanview, CA 90210</p>
              </div>
            </div>
            
            <div className="info-block">
              <Navigation className="icon" size={24} />
              <div>
                <h3>Getting Here</h3>
                <p>Located just 30 minutes from the International Airport. Shuttle services are available upon request.</p>
              </div>
            </div>

            <div className="info-block">
              <Clock className="icon" size={24} />
              <div>
                <h3>Check In & Check Out</h3>
                <p>Check-in: 3:00 PM<br />Check-out: 11:00 AM</p>
              </div>
            </div>
          </div>
          
          <div className="map-container">
            {/* Using a placeholder div to represent a map for this UI */}
            <div className="map-placeholder">
              <span>Interactive Map View</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocateUs;
