import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import TheSanctuary from './components/TheSanctuary';
import Accommodations from './components/Accommodations';
import ExclusiveOffers from './components/ExclusiveOffers';
import GuestStories from './components/GuestStories';
import GetInTouch from './components/GetInTouch';
import ChannelManager from './components/ChannelManager';
import './index.css';

function App() {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [bookingDates, setBookingDates] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentRoute === '#admin') {
    return <ChannelManager />;
  }

  return (
    <div className="app-layout" id="app-top">
      <div className="sidebar-container">
        <Sidebar setAvailabilityData={setAvailabilityData} setBookingDates={setBookingDates} appliedPromo={appliedPromo} setAppliedPromo={setAppliedPromo} />
      </div>
      <main className="main-content">
        <Hero />
        <TheSanctuary />
        <div id="accommodations-section">
          <Accommodations availabilityData={availabilityData} bookingDates={bookingDates} appliedPromo={appliedPromo} />
        </div>
        <ExclusiveOffers />
        <GuestStories />
        <GetInTouch />
      </main>
    </div>
  );
}

export default App;
