import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { fetchRoomAvailability, validatePromoCode } from '../services/api';
import MyBookingsModal from './MyBookingsModal';
import './Sidebar.css';

const Sidebar = ({ setAvailabilityData, setBookingDates, appliedPromo, setAppliedPromo }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  
  const [promoInput, setPromoInput] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [promoPopup, setPromoPopup] = useState(null);

  useEffect(() => {
    if (appliedPromo && (checkIn || checkOut)) {
      setAppliedPromo(null);
      setPromoPopup(null);
    }
  }, [checkIn, checkOut]);

  const today = new Date().toISOString().split('T')[0];
  
  const getMinCheckOut = (ciDate) => {
    if (!ciDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const ci = new Date(ciDate);
    ci.setDate(ci.getDate() + 1);
    return ci.toISOString().split('T')[0];
  };

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    if (checkOut && newCheckIn >= checkOut) {
      setCheckOut('');
    }
  };

  const handleApplyPromo = async () => {
    if (!checkIn || !checkOut) {
      setPromoPopup({ type: 'error', text: 'Please select Check In and Check Out dates first.' });
      return;
    }
    if (!promoInput.trim()) {
      setPromoPopup({ type: 'error', text: 'Please enter a promotion code.' });
      return;
    }
    setIsPromoLoading(true);
    setPromoPopup(null);
    try {
      const data = await validatePromoCode(promoInput, checkIn, checkOut);
      if (data.valid) {
        setAppliedPromo(data);
        const discountText = data.discountType === 'percent' ? `${data.discountValue}%` : `₹${data.discountValue}`;
        setPromoPopup({ 
            type: 'success', 
            text: `✅ Promotion code applied successfully!\n\n- Discount Applied: ${discountText}\n(Discount will be deducted from your room total during checkout)` 
        });
      }
    } catch (err) {
      setPromoPopup({ type: 'error', text: `❌ Invalid or expired promotion code. Please try another code.` });
      setAppliedPromo(null);
    } finally {
      setIsPromoLoading(false);
    }
  };

  const closePromoPopup = () => setPromoPopup(null);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert("Please select both Check-In and Check-Out dates.");
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      const data = await fetchRoomAvailability(checkIn, checkOut);
      setAvailabilityData(data);
      setBookingDates({ checkIn, checkOut });
      // Scroll to accommodations section
      const accSection = document.getElementById('accommodations-section');
      if (accSection) {
        accSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setApiError(err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="hotel-title">The Azure Hotel</h1>
        <p className="hotel-subtitle">YOUR COASTAL SANCTUARY</p>
      </div>

      <div className="sidebar-booking-section">
        <div className="booking-header">
          <h2>Reserve Your Stay</h2>
          <button className="btn-outline btn-sm" onClick={() => setIsMyBookingsOpen(true)}>My Bookings</button>
        </div>

        <form className="booking-form" onSubmit={handleCheckAvailability}>
          <div className="form-group">
            <label>Check In</label>
            <div className="input-with-icon">
              <Calendar className="icon" size={18} />
              <input type="date" value={checkIn} min={today} onChange={handleCheckInChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Check Out</label>
            <div className="input-with-icon">
              <Calendar className="icon" size={18} />
              <input type="date" value={checkOut} min={getMinCheckOut(checkIn)} onChange={(e) => setCheckOut(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rooms</label>
              <input type="number" placeholder="e.g. 1" min="1" />
            </div>
            <div className="form-group">
              <label>Guests</label>
              <input type="number" placeholder="e.g. 2" min="1" />
            </div>
          </div>

          <div className="form-group promo-group">
            <div className="promo-header">
              <label>Promotion Code</label>
              <a href="#offers" className="view-offers-link">View Offers</a>
            </div>
            <div className="promo-input-row" style={{ display: 'flex', gap: '8px' }}>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <Tag className="icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                className="btn-primary btn-apply" 
                onClick={handleApplyPromo}
                disabled={isPromoLoading}
              >
                {isPromoLoading ? <Loader2 size={16} className="spin-anim" /> : 'Apply'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full-width btn-check-avail" disabled={isLoading}>
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} className="spin-anim" /> Checking...
              </span>
            ) : (
              'Check Availability'
            )}
          </button>
        </form>
      </div>

    </aside>
      <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
      
      {promoPopup && (
        <div className="promo-popup-overlay" onClick={closePromoPopup}>
          <div className="promo-popup-content" onClick={(e) => e.stopPropagation()}>
             {promoPopup.type === 'error' && <XCircle size={40} style={{ color: '#dc3545', margin: '0 auto 15px' }} />}
             {promoPopup.type === 'success' && <CheckCircle size={40} style={{ color: '#28a745', margin: '0 auto 15px' }} />}
             {promoPopup.text.split('\n').map((line, i) => (
               <p key={i} style={{ margin: '8px 0', fontSize: '0.95rem', color: line.startsWith('-') || line.startsWith('(') ? '#555' : '#333', fontWeight: line.startsWith('✅') || line.startsWith('❌') ? 'bold' : 'normal' }}>
                 {line}
               </p>
             ))}
             <button onClick={closePromoPopup} className="btn-primary btn-sm" style={{ marginTop: '20px', padding: '8px 24px' }}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
