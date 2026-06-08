import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './GetInTouch.css';

const GetInTouch = () => {


  return (
    <section className="section contact-section">
      <div className="container">
        <h2 className="section-title locate-title">Locate Us</h2>
        <div className="contact-content">
          <div className="contact-details">
            <h3 className="get-in-touch-title">Get In Touch</h3>
            <p className="contact-intro">
              We are located just 45 minutes from the international airport. Transportation can be arranged via our concierge.
            </p>
            
            <div className="contact-methods">
              <div className="contact-method-row">
                <MapPin size={22} className="method-icon-simple" />
                <span>42 Coastal Highway, Azure Bay</span>
              </div>
              
              <div className="contact-method-row">
                <Phone size={22} className="method-icon-simple" />
                <span>+1 (800) 555-0199</span>
              </div>
              
              <div className="contact-method-row">
                <Mail size={22} className="method-icon-simple" />
                <span>reservations@azurehotel.com</span>
              </div>
            </div>
          </div>
          
          <div className="map-container">
            <div className="map-placeholder">
              <MapPin size={48} className="map-icon" />
              <h4>Interactive Map View</h4>
              <p>(Map Integration Here)</p>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <a href="#admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
            Channel Manager Login (Admin)
          </a>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
