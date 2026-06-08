import React, { useState, useEffect } from 'react';
import { Users, Info, Loader2 } from 'lucide-react';
import ReservationModal from './ReservationModal';
import { fetchRoomFacilities } from '../services/api';
import './Accommodations.css';

import deluxeRoom from '../assets/deluxe_room.png';
import superiorRoom from '../assets/superior_room.png';

const Accommodations = ({ availabilityData, bookingDates, appliedPromo }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [facilitiesMap, setFacilitiesMap] = useState({});
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    const loadFacilities = async () => {
      try {
        const data = await fetchRoomFacilities();
        if (mounted) {
          setFacilitiesMap(data);
          setLoadingFacilities(false);
        }
      } catch (err) {
        console.error("Failed to fetch facilities", err);
        if (mounted) setLoadingFacilities(false);
      }
    };
    loadFacilities();
    return () => { mounted = false; };
  }, []);

  const rooms = [
    {
      id: 1,
      title: 'Deluxe Room',
      description: 'A spacious, sun-drenched room featuring a private balcony overlooking the azure waters.',
      guests: 'Up to 2 guests',
      price: '4500',
      image: deluxeRoom
    },
    {
      id: 2,
      title: 'Superior Room',
      description: 'Our signature room with a separate living area, panoramic coastal views, and a luxury soaking tub.',
      guests: 'Up to 3 guests',
      price: '6500',
      image: superiorRoom
    },
    {
      id: 3,
      title: 'Junior Suite',
      description: 'The ultimate coastal retreat. Features a private rooftop terrace, infinity plunge pool, and butler service.',
      guests: 'Up to 4 guests',
      price: '9500',
      image: deluxeRoom // using deluxe room as placeholder
    },
    {
      id: 4,
      title: 'Presidential Suite',
      description: 'Experience absolute luxury in our largest suite, complete with private dining, wrap-around balcony, and VIP service.',
      guests: 'Up to 4 guests',
      price: '18000',
      image: superiorRoom // using superior room as placeholder
    }
  ];

  return (
    <section className="section accommodations-section">
      <div className="container">
        <h2 className="section-title">Accommodations</h2>
        <div className="rooms-list">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-image" style={{ backgroundImage: `url(${room.image})` }}></div>
              <div className="room-details">
                <h3 className="room-title">{room.title}</h3>
                <p className="room-desc">{room.description}</p>
                <div className="room-guests">
                  <Users size={18} className="icon" />
                  <span>{room.guests}</span>
                </div>
                
                <div className="room-amenities">
                  {loadingFacilities ? (
                    <span className="amenity-pill"><Loader2 size={14} className="spin-anim" /> Loading facilities...</span>
                  ) : (
                    (facilitiesMap[room.title] || []).map((amenity, idx) => (
                      <span key={idx} className="amenity-pill">{amenity}</span>
                    ))
                  )}
                </div>

                {availabilityData && (() => {
                  const roomAvail = availabilityData.find(r => r.name === room.title);
                  if (roomAvail) {
                    return (
                      <div className="availability-info-box">
                        <div className="availability-warning">
                          <Info size={18} className="warning-icon" />
                          <span>Only {roomAvail.availableRooms} rooms left for these dates!</span>
                        </div>
                        <div className="availability-breakdown">
                          <div className="avail-stat">
                            <span className="avail-label">Total room:</span>
                            <span className="avail-val">{roomAvail.totalRooms}</span>
                          </div>
                          <div className="avail-stat">
                            <span className="avail-label">Booked room:</span>
                            <span className="avail-val">{roomAvail.bookedRooms}</span>
                          </div>
                          <div className="avail-stat">
                            <span className="avail-label">Available room:</span>
                            <span className="avail-val text-primary">{roomAvail.availableRooms}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="room-footer">
                  <div className="room-price-wrap">
                    <span className="price-label">PER NIGHT</span>
                    <span className="price-value">₹{room.price}</span>
                  </div>
                  {(() => {
                    let btnText = "Check Availability First";
                    let btnDisabled = true;

                    if (availabilityData) {
                      const roomAvail = availabilityData.find(r => r.name === room.title);
                      if (roomAvail && roomAvail.availableRooms > 0) {
                        btnText = "Reserve";
                        btnDisabled = false;
                      } else {
                        btnText = "Sold Out";
                        btnDisabled = true;
                      }
                    }

                    return (
                      <button 
                        className={`btn-primary ${btnDisabled ? 'btn-disabled' : ''}`} 
                        onClick={() => !btnDisabled && setSelectedRoom(room)}
                        disabled={btnDisabled}
                        style={btnDisabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                      >
                        {btnText}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <ReservationModal 
        isOpen={!!selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
        room={selectedRoom} 
        bookingDates={bookingDates}
        facilities={selectedRoom ? facilitiesMap[selectedRoom.title] : []}
        appliedPromo={appliedPromo}
      />
    </section>
  );
};

export default Accommodations;
