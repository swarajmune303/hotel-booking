import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { fetchBookingStatus } from '../services/api';
import './ReservationModal.css';

const MyBookingsModal = ({ isOpen, onClose }) => {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bookingId || !email) {
      setErrorMsg("Please enter both Booking ID and Email Address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setBookingDetails(null);

    try {
      const idStr = bookingId.toUpperCase().replace('BK', '');
      const numericId = parseInt(idStr, 10);
      
      if (isNaN(numericId)) {
        throw new Error("Invalid Booking ID format. Please use the number from your confirmation.");
      }

      const data = await fetchBookingStatus(numericId, email);
      setBookingDetails(data);
    } catch (err) {
      setErrorMsg(err.message || "Could not find a booking matching those details.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return 'N/A';
    return `₹${amount}`;
  };

  const handleClose = () => {
    setBookingId('');
    setEmail('');
    setBookingDetails(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="res-modal-overlay" onClick={handleClose}>
      <div className="res-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="res-modal-header">
          <h2>My Bookings</h2>
          <button className="res-close-btn" onClick={handleClose}>
            <X size={18} /> Close
          </button>
        </div>

        <div className="res-modal-body" style={{ display: 'block', padding: '2rem' }}>
          {!bookingDetails ? (
            <div className="res-form-section" style={{ width: '100%' }}>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Enter your Booking ID and Email Address to view your reservation details.
              </p>
              <form className="res-guest-form" onSubmit={handleSearch}>
                <div className="form-group">
                  <label>Booking ID</label>
                  <input 
                    type="text" 
                    value={bookingId} 
                    onChange={e => setBookingId(e.target.value)} 
                    placeholder="e.g. BK099 or 99" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
                {errorMsg && (
                  <div className="res-error-msg" style={{color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px'}}>
                    {errorMsg}
                  </div>
                )}
                <button type="submit" className="btn-primary btn-full-width" disabled={isLoading}>
                  {isLoading ? <><Loader2 size={18} className="spin-anim" style={{display: 'inline', marginRight: '8px'}}/> Searching...</> : <><Search size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} /> Find My Booking</>}
                </button>
              </form>
            </div>
          ) : (
            <div className="booking-details-view" style={{ width: '100%' }}>
              <button onClick={() => setBookingDetails(null)} style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', marginBottom: '1rem', textDecoration: 'underline' }}>
                &larr; Search another booking
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#2c3e50' }}>Booking #BK{String(bookingDetails.id).padStart(3, '0')}</h3>
                <span style={{ 
                  backgroundColor: getStatusColor(bookingDetails.status), 
                  color: bookingDetails.status === 'pending' ? '#333' : 'white', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {bookingDetails.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Guest Name</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{bookingDetails.guestName || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Email Address</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{bookingDetails.guestEmail || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Mobile Number</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{bookingDetails.guestPhone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Room Type</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{bookingDetails.roomTypeName || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Check-in Date</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(bookingDetails.checkIn)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Check-out Date</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(bookingDetails.checkOut)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Number of Guests</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>
                    {bookingDetails.adults || 0} Adults
                    {bookingDetails.children > 0 ? `, ${bookingDetails.children} Children` : ''}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>Booking Date</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(bookingDetails.createdAt)}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#555' }}>Booking Amount</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(bookingDetails.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#555' }}>Payment Status</span>
                  <span style={{ fontWeight: '500', color: bookingDetails.advancePaid > 0 ? '#28a745' : '#ffc107' }}>
                    {bookingDetails.advancePaid > 0 ? 'Paid' : 'Pending at Property'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsModal;
