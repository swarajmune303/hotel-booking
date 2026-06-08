import React, { useState, useEffect } from 'react';
import { fetchAllPromotions } from '../services/api';
import './ExclusiveOffers.css';

const ExclusiveOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllPromotions();
        // Filter for active promotions that have a promo code
        const activePromotions = data.filter(promo => {
          if (promo.status !== 'active') return false;
          if (!promo.promoCode) return false;
          
          // Check date validity
          const today = new Date().toISOString().slice(0, 10);
          if (today < promo.bookingStartDate || today > promo.bookingEndDate) return false;
          
          return true;
        });
        setOffers(activePromotions);
      } catch (err) {
        console.error("Error loading promotions:", err);
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPromotions();
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
        ) : offers.length > 0 ? (
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
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '1.2rem', color: '#555', margin: 0 }}>No active promotions found at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExclusiveOffers;
