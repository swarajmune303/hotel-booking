const API_BASE = import.meta.env?.PROD ? 'https://channel.vertosync.com/api' : '/api';

export const fetchRoomAvailability = async (checkIn, checkOut) => {
  // Validate input
  if (!checkIn || !checkOut) {
    throw new Error("Check-in and Check-out dates are required.");
  }

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

export const fetchRoomFacilities = async () => {

  try {
    const roomTypes = await fetchRoomTypes();
    if (Array.isArray(roomTypes) && roomTypes.length > 0) {
      const map = {};
      roomTypes.forEach(rt => {
        let parsed = [];
        if (rt.amenities) {
          try {
            parsed = JSON.parse(rt.amenities);
            if (!Array.isArray(parsed)) {
              parsed = [String(rt.amenities)];
            }
          } catch (e) {
            parsed = rt.amenities.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
        map[rt.name] = parsed;
      });
      return map;
    }
  } catch (err) {
    console.warn("Failed to fetch dynamic facilities, falling back to default.", err);
  }

  const defaultData = {
    'Deluxe Room': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioning', 'TV', 'Balcony'],
    'Superior Room': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Breakfast Included'],
    'Junior Suite': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Spa and Wellness Center', 'Fitness Center', 'Restaurant & Bar', 'Room Service (24/7)', 'Airport Shuttle', 'Valet Parking', 'Daily Housekeeping', 'Concierge Services'],
    'Presidential Suite': ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Spa and Wellness Center', 'Fitness Center', 'Restaurant & Bar', 'Room Service (24/7)', 'Airport Shuttle', 'Valet Parking', 'Daily Housekeeping', 'Concierge Services', 'Private Dining', 'VIP Service']
  };
  return defaultData;
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

export const fetchBookingStatus = async (bookingId, phone) => {
  try {
    const res = await fetch(`${API_BASE}/public/bookings/status?id=${bookingId}&phone=${encodeURIComponent(phone)}`);
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
  try {
    const res = await fetch(`${API_BASE}/public/promotions?t=${Date.now()}`, { cache: 'no-store' });
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

// --- SITE MANAGER API ---

export const fetchSiteContent = async (section) => {
  try {
    const res = await fetch(`${API_BASE}/public/site-manager/content/${section}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch content for ${section}`);
    return await res.json();
  } catch (err) {
    console.error(`Fetch content error for ${section}:`, err);
    return null;
  }
};

export const fetchSiteGallery = async (sliderOnly = false) => {
  try {
    const url = sliderOnly ? `${API_BASE}/public/site/gallery?slider=1&t=${Date.now()}` : `${API_BASE}/public/site/gallery?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return await res.json();
  } catch (err) {
    console.error("Fetch gallery error:", err);
    return [];
  }
};

export const fetchRoomTypes = async () => {
  try {
    const res = await fetch(`${API_BASE}/public/room-types?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch room types');
    return await res.json();
  } catch (err) {
    console.error("Fetch room types error:", err);
    return [];
  }
};

export const sendOtp = async (phone) => {
  try {
    const res = await fetch(`${API_BASE}/public/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send OTP.');
    }
    return await res.json();
  } catch (error) {
    console.error("sendOtp error:", error);
    throw error;
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const res = await fetch(`${API_BASE}/public/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid OTP.');
    }
    return await res.json();
  } catch (error) {
    console.error("verifyOtp error:", error);
    throw error;
  }
};
