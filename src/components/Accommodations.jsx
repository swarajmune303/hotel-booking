import React, { useState, useEffect } from 'react';
import { Users, Info, Loader2 } from 'lucide-react';
import ReservationModal from './ReservationModal';
import { fetchRoomFacilities, fetchSiteContent, fetchSiteGallery, fetchRoomTypes } from '../services/api';
import './Accommodations.css';

import deluxeRoom from '../assets/deluxe_room.png';
import superiorRoom from '../assets/superior_room.png';

const Accommodations = ({ availabilityData, bookingDates, appliedPromo }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [facilitiesMap, setFacilitiesMap] = useState({});
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  
  const [dynamicDesc, setDynamicDesc] = useState({});
  const [dynamicImages, setDynamicImages] = useState({});
  const [rooms, setRooms] = useState([
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
      image: deluxeRoom
    },
    {
      id: 4,
      title: 'Presidential Suite',
      description: 'Experience absolute luxury in our largest suite, complete with private dining, wrap-around balcony, and VIP service.',
      guests: 'Up to 4 guests',
      price: '18000',
      image: superiorRoom
    }
  ]);
  
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

    const loadData = () => {
      fetchSiteContent('accommodation').then(data => {
        if (data && typeof data === 'object' && mounted) {
          setDynamicDesc(data);
        }
      });

      Promise.all([fetchRoomTypes(), fetchSiteGallery(), fetchSiteContent('accommodation')]).then(([rTypes, gallery, accommData]) => {
        if (mounted) {
          const imgMap = {};
          
          const roomImages = gallery.filter(img => img.category && img.category.startsWith('room_type_'));
          roomImages.forEach(img => {
            const typeId = parseInt(img.category.replace('room_type_', ''));
            const rt = rTypes.find(r => r.id === typeId);
            if (rt && !imgMap[rt.name]) {
              imgMap[rt.name] = img.imageUrl;
            }
          });

          const legacyImages = gallery.filter(img => img.category === 'room_image');
          legacyImages.forEach(img => {
            if (img.caption && !imgMap[img.caption]) {
              imgMap[img.caption] = img.imageUrl;
            }
          });

          setDynamicImages(imgMap);
          
          if (rTypes && rTypes.length > 0) {
            const loadedRooms = rTypes.map(rt => {
              const fallbackDesc = accommData && accommData[rt.name] ? accommData[rt.name] : (rt.description || 'A beautiful room tailored for your comfort and relaxation.');
              return {
                id: rt.id,
                title: rt.name,
                description: fallbackDesc,
                guests: `Up to ${rt.maxOccupancy || 2} guests`,
                price: rt.basePrice || 0,
                image: imgMap[rt.name] || deluxeRoom
              };
            });
            setRooms(loadedRooms);
          }
        }
      });
    };

    loadFacilities();
    loadData();
    const interval = setInterval(() => { loadFacilities(); loadData(); }, 5000);

    return () => { mounted = false; clearInterval(interval); };
  }, []);


  return (
    <section className="section accommodations-section">
      <div className="container">
        <h2 className="section-title">Accommodations</h2>
        <div className="rooms-list">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <div className="room-image" style={{ position: 'relative' }}>
                <img 
                  src={room.image} 
                  alt={room.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  onError={(e) => {
                    if (e.target.src !== deluxeRoom) {
                      e.target.src = deluxeRoom;
                    }
                  }}
                />
              </div>
              <div className="room-details">
                <h3 className="room-title">{room.title}</h3>
                <p className="room-desc">{room.description}</p>
                <div className="room-guests">
                  <Users size={18} className="icon" />
                  <span>{room.guests}</span>
                </div>
                
                <div className="room-amenities" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {loadingFacilities ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Loader2 size={14} className="spin-anim" /> Loading facilities...
                    </div>
                  ) : (
                    (facilitiesMap[room.title] || []).map((amenity, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓</span> {amenity}
                      </div>
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
