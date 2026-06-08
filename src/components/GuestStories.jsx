import React from 'react';
import { Star } from 'lucide-react';
import './GuestStories.css';
import guestImage from '../assets/guest_testimonial.png';

const GuestStories = () => {
  const stories = [
    {
      id: 1,
      name: "Eleanor & Mark",
      location: "New York, USA",
      rating: 5,
      text: "Our stay at The Azure Hotel was nothing short of magical. The Presidential Suite exceeded all our expectations, and waking up to that ocean view was a dream. The staff went above and beyond to make our anniversary unforgettable."
    },
    {
      id: 2,
      name: "James T.",
      location: "London, UK",
      rating: 5,
      text: "From the artisan coffee in the morning to the fine dining at night, every detail is perfected. The private beach is pristine and serene. Highly recommend for anyone looking to truly disconnect and relax."
    }
  ];

  return (
    <section className="section stories-section">
      <div className="container">
        <h2 className="section-title">Guest Stories</h2>
        
        <div className="stories-content">
          <div className="stories-image" style={{ backgroundImage: `url(${guestImage})` }}>
          </div>
          <div className="stories-list">
            {stories.map(story => (
              <div key={story.id} className="story-card">
                <div className="story-stars">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" color="var(--primary)" />
                  ))}
                </div>
                <p className="story-text">"{story.text}"</p>
                <div className="story-author">
                  <strong>{story.name}</strong>
                  <span>{story.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuestStories;
