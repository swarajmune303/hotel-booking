export const fetchRoomAvailability = async (checkIn, checkOut) => {
  // Validate input
  if (!checkIn || !checkOut) {
    throw new Error("Check-in and Check-out dates are required.");
  }

  const API_BASE = '/api';
  try {
    const res = await fetch(`${API_BASE}/public/availability?checkIn=${checkIn}&checkOut=${checkOut}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch real-time availability from Channel Manager.');
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch availability error:", err);
    throw new Error("Channel Manager API is currently unavailable. Please try again.");
  }
};

let facilitiesCache = null;

export const fetchRoomFacilities = async () => {
  if (facilitiesCache) {
    return Promise.resolve(facilitiesCache);
  }

  const delay = Math.floor(Math.random() * 500) + 500; // Faster response
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        'Deluxe Room': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioning', 'TV', 'Balcony'],
        'Superior Room': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Breakfast Included'],
        'Junior Suite': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Spa and Wellness Center', 'Fitness Center', 'Restaurant & Bar', 'Room Service (24/7)', 'Airport Shuttle', 'Valet Parking', 'Daily Housekeeping', 'Concierge Services'],
        'Presidential Suite': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Spa and Wellness Center', 'Fitness Center', 'Restaurant & Bar', 'Room Service (24/7)', 'Airport Shuttle', 'Valet Parking', 'Daily Housekeeping', 'Concierge Services', 'Private Dining', 'VIP Service']
      };
      
      facilitiesCache = data;
      resolve(data);
    }, delay);
  });
};

// --- BOOKINGS API ---

const getStoredBookings = () => {
  const stored = localStorage.getItem('azure_bookings');
  return stored ? JSON.parse(stored) : [];
};

const saveBookings = (bookings) => {
  localStorage.setItem('azure_bookings', JSON.stringify(bookings));
};

export const createBooking = async (bookingData) => {
  const API_BASE = '/api';
  try {
    // 1. Fetch available room types and channels
    const [rtRes, chRes] = await Promise.all([
      fetch(`${API_BASE}/public/room-types`),
      fetch(`${API_BASE}/public/channels`)
    ]);
    
    if (!rtRes.ok) throw new Error('Failed to fetch room types from Channel Manager');
    if (!chRes.ok) throw new Error('Failed to fetch channels from Channel Manager');
    
    const roomTypes = await rtRes.json();
    const channels = await chRes.json();
    
    // Find the ID for the requested room type
    const rt = roomTypes.find(r => r.name.toLowerCase() === bookingData.roomType.toLowerCase());
    if (!rt) {
      throw new Error(`Room type "${bookingData.roomType}" is not configured in the Channel Manager.`);
    }

    // Find the direct channel ID
    const directChannel = channels.find(c => c.type === 'direct') || channels[0];
    if (!directChannel) {
      throw new Error(`No channels configured in the Channel Manager.`);
    }

    // 2. Build the payload for the live API
    const payload = {
      channelId: directChannel.id,
      roomTypeId: rt.id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guestName: bookingData.guestName || 'Guest',
      guestEmail: bookingData.email,
      guestPhone: bookingData.mobile || '',
      totalAmount: Number(bookingData.amount),
      adults: 2,
      children: 0,
      notes: '',
      status: 'pending'
    };

    // 3. Submit the booking
    const res = await fetch(`${API_BASE}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit booking to Channel Manager API.');
    }

    return await res.json();
  } catch (err) {
    console.error("Booking API error:", err);
    throw err;
  }
};

export const fetchBookings = async () => {
  const delay = Math.floor(Math.random() * 500) + 500;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredBookings());
    }, delay);
  });
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  const delay = Math.floor(Math.random() * 500) + 500;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookings = getStoredBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        bookings[index].status = newStatus;
        saveBookings(bookings);
        resolve(bookings[index]);
      } else {
        reject(new Error("Booking not found"));
      }
    }, delay);
  });
};

export const fetchBookingStatus = async (bookingId, email) => {
  const API_BASE = '/api';
  try {
    const res = await fetch(`${API_BASE}/public/bookings/status?id=${bookingId}&email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch booking details.');
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch booking status error:", err);
    throw err;
  }
};

export const fetchAllPromotions = async () => {
  const API_BASE = '/api';
  try {
    const res = await fetch(`${API_BASE}/public/promotions`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch promotions from the server.');
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch promotions error:", err);
    return [];
  }
};

export const validatePromoCode = async (code, checkIn, checkOut) => {
  const API_BASE = '/api';
  try {
    const res = await fetch(`${API_BASE}/public/promotions/validate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, checkIn, checkOut })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to validate promo code.');
    }
    return await res.json();
  } catch (err) {
    console.error("Validate promo code error:", err);
    throw err;
  }
};
