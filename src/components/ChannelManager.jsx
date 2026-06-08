import React, { useState, useEffect } from 'react';
import { fetchBookings, updateBookingStatus } from '../services/api';
import { CheckCircle, XCircle, Clock, Search, Loader2 } from 'lucide-react';
import './ChannelManager.css';

const ChannelManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings();
      // Sort newest first based on bookingDate
      data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      // Update local state to reflect change instantly
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating status");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="cm-badge success"><CheckCircle size={14}/> Approved</span>;
      case 'Rejected': return <span className="cm-badge error"><XCircle size={14}/> Rejected</span>;
      default: return <span className="cm-badge pending"><Clock size={14}/> Pending</span>;
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cm-dashboard">
      <header className="cm-header">
        <div className="cm-header-content">
          <h1>Channel Manager</h1>
          <p>Guest Details & Booking Management</p>
        </div>
        <div className="cm-actions">
          <button className="btn-outline" onClick={() => window.location.hash = ''}>
            View Website
          </button>
        </div>
      </header>

      <div className="cm-main">
        <div className="cm-toolbar">
          <div className="cm-search-box">
            <Search size={18} className="cm-search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, email, or booking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="cm-refresh-btn" onClick={loadBookings}>
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="cm-loading">
            <Loader2 size={32} className="spin-anim" />
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="cm-empty">
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="cm-table-container">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Booking ID / Date</th>
                  <th>Guest Details</th>
                  <th>Stay Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.id}</strong>
                      <br/>
                      <span className="cm-date">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <strong>{booking.guestName}</strong>
                      <br/>
                      <span className="cm-text-sm">{booking.email}</span>
                      <br/>
                      <span className="cm-text-sm">{booking.mobile}</span>
                    </td>
                    <td>
                      <strong>{booking.roomType}</strong>
                      <br/>
                      <span className="cm-text-sm">{booking.checkIn} to {booking.checkOut}</span>
                      <br/>
                      <span className="cm-text-sm">{booking.guests} Guests</span>
                      {booking.requests && (
                        <div className="cm-requests">
                          <em>Note: {booking.requests}</em>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>₹{booking.amount}</strong>
                      <br/>
                      <span className="cm-badge secondary">{booking.paymentStatus}</span>
                    </td>
                    <td>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td>
                      {booking.status === 'Pending' ? (
                        <div className="cm-action-btns">
                          <button className="cm-btn cm-btn-approve" onClick={() => handleStatusUpdate(booking.id, 'Approved')}>Approve</button>
                          <button className="cm-btn cm-btn-reject" onClick={() => handleStatusUpdate(booking.id, 'Rejected')}>Reject</button>
                        </div>
                      ) : (
                        <span className="cm-text-muted">Action taken</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelManager;
