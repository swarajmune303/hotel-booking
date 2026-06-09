fetch('http://localhost:3000/api/public/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelId: 8,
    roomTypeId: 1,
    checkIn: '2026-06-15',
    checkOut: '2026-06-20',
    guestName: 'Test User',
    guestEmail: 'test@example.com',
    guestPhone: '2343212312',
    totalAmount: 15000,
    adults: 2,
    children: 0,
    status: 'confirmed'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
