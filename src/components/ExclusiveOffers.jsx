import React, { useState, useEffect } from 'react';
import { fetchAllPromotions, fetchSiteGallery } from '../services/api';
import './ExclusiveOffers.css';

const ExclusiveOffers = () => {
  const [offers, setOffers] = useState([]);
  const [offerImages, setOfferImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, gallery] = await Promise.all([
          fetchAllPromotions(),
          fetchSiteGallery()
        ]);
        
        // Filter for active promotions that have a promo code
        const activePromotions = data.filter(promo => {
          if (promo.status !== 'active') return false;
          if (!promo.promoCode) return false;
          if (promo.visibility === 'private') return false;
          
          // Check date validity
          const today = new Date().toISOString().slice(0, 10);
          if (today < promo.bookingStartDate || today > promo.bookingEndDate) return false;
          
          return true;
        });
        
        if (mounted) {
          setOffers(activePromotions);
          setOfferImages(gallery.filter(img => img.category === 'offer'));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const formatDiscount = (offer) => {
    if (offer.discountType === 'percent') {
      return `${offer.discountValue}% Off`;
    }
    return `₹${offer.discountValue} Off`;
  };

  return (
    <section id="offers" className="section offers-section">
      <div className="container">
        <h2 className="section-title">Available Promotions</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Discover our latest offers and apply them to your stay.
        </p>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading promotions...</div>
        ) : (
          <>
            {offerImages.length > 0 && (
              <div className="offers-gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                {offerImages.map(img => (
                  <div key={img.id} className="offer-image-card" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <img 
                      src={img.imageUrl} 
                      alt={img.caption || "Special Offer"} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {img.caption && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px' }}>
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {offers.length > 0 ? (
              <div className="offers-grid">
                {offers.map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-code-badge">
                  Code: {offer.promoCode}
                </div>
                <h3 className="offer-title">{offer.name}</h3>
                <p className="offer-desc" style={{ marginBottom: '10px' }}>{offer.description || 'Exclusive offer for our valuable guests.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  <span style={{ fontWeight: 'bold', color: '#0056b3' }}>{formatDiscount(offer)}</span>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>
                    Valid till: {new Date(offer.bookingEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
                ))}
              </div>
            ) : offerImages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '1.2rem', color: '#555', margin: 0 }}>No active promotions found at this time.</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};

export default ExclusiveOffers;
