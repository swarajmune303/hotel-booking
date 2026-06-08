import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import './AvailabilityModal.css';

const AvailabilityModal = ({ isOpen, onClose, data, error }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Real-Time Availability</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error ? (
            <div className="error-message">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="availability-list">
              <p className="success-text">
                <CheckCircle size={18} /> Synchronized with Channel Manager
              </p>
              
              <div className="table-header">
                <span className="col-room">Room Type</span>
                <span className="col-stat">Total</span>
                <span className="col-stat">Booked</span>
                <span className="col-stat highlight">Available</span>
              </div>

              {data && data.map(room => (
                <div key={room.id} className={`room-row ${room.availableRooms === 0 ? 'sold-out' : ''}`}>
                  <div className="col-room">
                    <strong>{room.name}</strong>
                    {room.availableRooms === 0 && <span className="badge-sold-out">Sold Out</span>}
                  </div>
                  <div className="col-stat">{room.totalRooms}</div>
                  <div className="col-stat booked-stat">{room.bookedRooms}</div>
                  <div className="col-stat available-stat">{room.availableRooms}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
