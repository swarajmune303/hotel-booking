import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, Tag, XCircle } from 'lucide-react';
  import { createBooking, validatePromoCode, sendOtp, verifyOtp } from '../services/api';
import './ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, room, bookingDates, facilities = [], appliedPromo }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', otp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpStep, setOtpStep] = useState(0); // 0: Enter Phone, 1: Verify OTP, 2: Final Form
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrorMsg('');
      setFormData({ name: '', email: '', phone: '', otp: '' });
      setOtpStep(0);
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen || !room) return null;

  const { checkIn, checkOut } = bookingDates || {};



  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 10) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await sendOtp(formData.phone);
      setOtpStep(1);
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setErrorMsg("Please enter the OTP.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await verifyOtp(formData.phone, formData.otp);
      setOtpStep(2);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      guestPhone: formData.phone,
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
                {otpStep === 0 && (
                  <form className="res-guest-form" onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label>Mobile Number for Verification</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 9876543210" required />
                      <small style={{color: '#666', marginTop: '4px', display: 'block'}}>We need to verify your number before proceeding.</small>
                    </div>
                    {errorMsg && <div className="res-error-msg" style={{color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px'}}>{errorMsg}</div>}
                    <button type="submit" className="btn-primary btn-full-width" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 size={18} className="spin-anim" style={{display: 'inline', marginRight: '8px'}}/> Sending OTP...</> : 'Send OTP'}
                    </button>
                  </form>
                )}

                {otpStep === 1 && (
                  <form className="res-guest-form" onSubmit={handleVerifyOtp}>
                    <div className="form-group">
                      <label>Enter OTP</label>
                      <input type="text" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} placeholder="4-digit OTP" required maxLength={6} />
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                        <small style={{color: '#666'}}>Sent to {formData.phone}</small>
                        <button type="button" onClick={handleSendOtp} disabled={cooldown > 0 || isSubmitting} style={{background: 'none', border: 'none', color: cooldown > 0 ? '#aaa' : '#0056b3', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', textDecoration: cooldown > 0 ? 'none' : 'underline'}}>
                          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                    {errorMsg && <div className="res-error-msg" style={{color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px'}}>{errorMsg}</div>}
                    <button type="submit" className="btn-primary btn-full-width" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 size={18} className="spin-anim" style={{display: 'inline', marginRight: '8px'}}/> Verifying...</> : 'Verify OTP'}
                    </button>
                    <button type="button" className="btn-secondary btn-full-width" onClick={() => setOtpStep(0)} style={{marginTop: '10px'}} disabled={isSubmitting}>
                      Change Mobile Number
                    </button>
                  </form>
                )}

                {otpStep === 2 && (
                  <form className="res-guest-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="tel" value={formData.phone} disabled style={{backgroundColor: '#f1f1f1', color: '#555'}} />
                      <span style={{color: '#28a745', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px'}}>
                        <CheckCircle size={14} /> Verified
                      </span>
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required />
                    </div>
                    {errorMsg && <div className="res-error-msg" style={{color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px'}}>{errorMsg}</div>}
                    <button type="submit" className="btn-primary btn-full-width" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 size={18} className="spin-anim" style={{display: 'inline', marginRight: '8px'}}/> Processing...</> : 'Confirm Booking'}
                    </button>
                  </form>
                )}
              </div>

              <div className="res-summary-section">
            <div className="res-summary-card">
              <h3>Stay Summary</h3>
              <div className="res-room-img" style={{ backgroundImage: `url(${room.image})` }}></div>
              
              <h4 className="res-room-title">{room.title}</h4>
              <p className="res-dates">
                {checkIn ? checkIn : 'Select Check In'} to {checkOut ? checkOut : 'Select Check Out'}
              </p>
              
              <div className="res-amenities" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {facilities.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓</span> {amenity}
                  </div>
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
