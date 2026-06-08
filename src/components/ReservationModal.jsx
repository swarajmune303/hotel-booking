import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, Tag, XCircle } from 'lucide-react';
import { createBooking, validatePromoCode } from '../services/api';
import './ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, room, bookingDates, facilities = [], appliedPromo }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrorMsg('');
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const { checkIn, checkOut } = bookingDates || {};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    if (!checkIn || !checkOut) {
      setErrorMsg("Please select your check-in and check-out dates on the left sidebar before reserving.");
      setIsSubmitting(false);
      return;
    }

    let nights = 1;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }

    let originalAmount = Number(room.price) * nights;
    let discountAmount = 0;

    if (appliedPromo) {
      if (appliedPromo.discountType === 'percent') {
        discountAmount = originalAmount * (appliedPromo.discountValue / 100);
      } else {
        discountAmount = appliedPromo.discountValue;
      }
    }
    
    discountAmount = Math.min(originalAmount, discountAmount);
    let finalAmount = originalAmount - discountAmount;

    const bookingData = {
      guestName: formData.name,
      email: formData.email,
      mobile: formData.phone,
      roomType: room.title,
      checkIn: checkIn,
      checkOut: checkOut,
      amount: finalAmount,
    };
    
    try {
      await createBooking(bookingData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while creating the booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="res-modal-overlay" onClick={onClose}>
      <div className="res-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="res-modal-header">
          <h2>Complete Your Reservation</h2>
          <button className="res-close-btn" onClick={onClose}>
            <X size={18} /> Cancel
          </button>
        </div>

        <div className="res-modal-body">
          {success ? (
            <div className="res-success-view">
              <CheckCircle size={64} className="success-icon" />
              <h2>Booking Confirmed!</h2>
              <p>Your reservation for the {room.title} has been successfully submitted and is awaiting approval.</p>
            </div>
          ) : (
            <>
              <div className="res-form-section">
                <h3>Guest Details</h3>
                <form className="res-guest-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" required />
                  </div>
                  {errorMsg && <div className="res-error-msg" style={{color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px'}}>{errorMsg}</div>}
                  <button type="submit" className="btn-primary btn-full-width" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 size={18} className="spin-anim" style={{display: 'inline', marginRight: '8px'}}/> Processing...</> : 'Confirm Booking'}
                  </button>
                </form>
              </div>

              <div className="res-summary-section">
            <div className="res-summary-card">
              <h3>Stay Summary</h3>
              <div className="res-room-img" style={{ backgroundImage: `url(${room.image})` }}></div>
              
              <h4 className="res-room-title">{room.title}</h4>
              <p className="res-dates">
                {checkIn ? checkIn : 'Select Check In'} to {checkOut ? checkOut : 'Select Check Out'}
              </p>
              
              <div className="res-amenities">
                {facilities.map((amenity, idx) => (
                  <span key={idx} className="amenity-pill">{amenity}</span>
                ))}
              </div>

              <div className="res-price-row">
                <span className="res-price-label">
                  Original Amount ({(() => {
                    let nights = 1;
                    if (checkIn && checkOut) {
                      const start = new Date(checkIn);
                      const end = new Date(checkOut);
                      nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                    }
                    return `${nights} Night${nights > 1 ? 's' : ''}`;
                  })()})
                </span>
                <span className="res-price-val">
                  ₹{(() => {
                    let nights = 1;
                    if (checkIn && checkOut) {
                      const start = new Date(checkIn);
                      const end = new Date(checkOut);
                      nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                    }
                    return Number(room.price) * nights;
                  })()}
                </span>
              </div>
              
              {appliedPromo && (
                <div className="res-price-row" style={{ color: '#28a745', borderTop: '1px dashed #ccc', paddingTop: '8px', marginTop: '8px' }}>
                  <span className="res-price-label">Discount Amount ({appliedPromo.name})</span>
                  <span className="res-price-val">
                    -₹{(() => {
                      let nights = 1;
                      if (checkIn && checkOut) {
                        const start = new Date(checkIn);
                        const end = new Date(checkOut);
                        nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                      }
                      let originalAmount = Number(room.price) * nights;
                      let discountAmount = appliedPromo.discountType === 'percent' 
                        ? originalAmount * (appliedPromo.discountValue / 100) 
                        : appliedPromo.discountValue;
                      return Math.min(originalAmount, discountAmount);
                    })()}
                  </span>
                </div>
              )}


              
              <div className="res-total-row">
                <span className="res-total-label">Final Payable Amount</span>
                <span className="res-total-val">
                  ₹{(() => {
                    let nights = 1;
                    if (checkIn && checkOut) {
                      const start = new Date(checkIn);
                      const end = new Date(checkOut);
                      nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                    }
                    let originalAmount = Number(room.price) * nights;
                    let discountAmount = 0;
                    if (appliedPromo) {
                      discountAmount = appliedPromo.discountType === 'percent' 
                        ? originalAmount * (appliedPromo.discountValue / 100) 
                        : appliedPromo.discountValue;
                    }
                    discountAmount = Math.min(originalAmount, discountAmount);
                    return originalAmount - discountAmount;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
      </div>
    </div>
  );
};

export default ReservationModal;
