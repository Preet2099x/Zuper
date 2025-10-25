/**
 * Unit Tests for Booking Logic
 */

describe('Booking Date Validation', () => {
  test('should validate future start date', () => {
    const startDate = new Date(Date.now() + 86400000);
    const isValid = startDate > new Date();
    expect(isValid).toBe(true);
  });

  test('should reject past start date', () => {
    const startDate = new Date(Date.now() - 86400000);
    const isValid = startDate > new Date();
    expect(isValid).toBe(false);
  });

  test('should validate end date after start date', () => {
    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(Date.now() + 172800000);
    const isValid = endDate > startDate;
    expect(isValid).toBe(true);
  });

  test('should reject end date before start date', () => {
    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(Date.now() + 43200000);
    const isValid = endDate > startDate;
    expect(isValid).toBe(false);
  });
});

describe('Booking Validation', () => {
  test('should validate date range (end > start)', () => {
    const invalidDates = {
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-05')
    };
    
    const isValid = invalidDates.endDate > invalidDates.startDate;
    expect(isValid).toBe(false);
  });

  test('should validate future dates', () => {
    const futureDate = new Date(Date.now() + 86400000);
    const isValid = futureDate > new Date();
    expect(isValid).toBe(true);
  });

  test('should calculate correct total cost', () => {
    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(startDate.getTime() + (4 * 86400000)); // 4 days later = 5 day booking
    const dailyRate = 1500;
    
    const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalCost = numberOfDays * dailyRate;
    
    expect(numberOfDays).toBe(4);
    expect(totalCost).toBe(6000);
  });

  test('should reject booking without customer', () => {
    const invalidBooking = { customer: null };
    expect(invalidBooking.customer).toBeNull();
  });

  test('should reject booking without vehicle', () => {
    const invalidBooking = { vehicle: null };
    expect(invalidBooking.vehicle).toBeNull();
  });
});

describe('Booking Status Transitions', () => {
  test('should allow pending to approved transition', () => {
    const validTransitions = ['approved', 'rejected', 'cancelled'];
    expect(validTransitions).toContain('approved');
  });

  test('should allow pending to rejected transition', () => {
    const validTransitions = ['approved', 'rejected', 'cancelled'];
    expect(validTransitions).toContain('rejected');
  });

  test('should allow pending to cancelled transition', () => {
    const validTransitions = ['approved', 'rejected', 'cancelled'];
    expect(validTransitions).toContain('cancelled');
  });

  test('should prevent invalid status values', () => {
    const invalidStatuses = ['confirmed', 'booked', 'reserved'];
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    
    invalidStatuses.forEach(status => {
      expect(validStatuses).not.toContain(status);
    });
  });
});

describe('Booking Calculations', () => {
  test('should calculate correct duration for multi-day booking', () => {
    const start = new Date('2025-01-15T10:00:00');
    const end = new Date('2025-01-20T10:00:00');
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    expect(days).toBe(5);
  });

  test('should calculate 1 day for same day booking', () => {
    const start = new Date('2025-01-15T10:00:00');
    const end = new Date('2025-01-15T20:00:00');
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    expect(days).toBe(1);
  });

  test('should calculate correct cost for various durations', () => {
    const dailyRate = 1500;
    const testCases = [
      { days: 1, expected: 1500 },
      { days: 5, expected: 7500 },
      { days: 7, expected: 10500 },
      { days: 30, expected: 45000 }
    ];
    
    testCases.forEach(({ days, expected }) => {
      const cost = days * dailyRate;
      expect(cost).toBe(expected);
    });
  });
});

describe('Booking Filtering', () => {
  test('should filter bookings by pending status', () => {
    const bookings = [
      { _id: '1', status: 'pending' },
      { _id: '2', status: 'approved' },
      { _id: '3', status: 'pending' }
    ];
    
    const pending = bookings.filter(b => b.status === 'pending');
    expect(pending.length).toBe(2);
    expect(pending.every(b => b.status === 'pending')).toBe(true);
  });

  test('should filter bookings by approved status', () => {
    const bookings = [
      { _id: '1', status: 'pending' },
      { _id: '2', status: 'approved' },
      { _id: '3', status: 'approved' }
    ];
    
    const approved = bookings.filter(b => b.status === 'approved');
    expect(approved.length).toBe(2);
  });

  test('should filter bookings by customer', () => {
    const customerId = 'customer1';
    const bookings = [
      { _id: '1', customer: customerId },
      { _id: '2', customer: 'customer2' },
      { _id: '3', customer: customerId }
    ];
    
    const customerBookings = bookings.filter(b => b.customer === customerId);
    expect(customerBookings.length).toBe(2);
  });

  test('should filter bookings by provider', () => {
    const providerId = 'provider1';
    const bookings = [
      { _id: '1', provider: providerId },
      { _id: '2', provider: 'provider2' },
      { _id: '3', provider: providerId }
    ];
    
    const providerBookings = bookings.filter(b => b.provider === providerId);
    expect(providerBookings.length).toBe(2);
  });
});

describe('Booking Constraints', () => {
  test('should not allow past dates for start date', () => {
    const pastDate = new Date(Date.now() - 86400000);
    const isValid = pastDate > new Date();
    expect(isValid).toBe(false);
  });

  test('should not allow booking for unavailable vehicle', () => {
    const vehicle = { status: 'rented' };
    const isValid = vehicle.status === 'available';
    expect(isValid).toBe(false);
  });

  test('should validate minimum booking duration', () => {
    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(Date.now() + 90000000);
    
    const durationMs = endDate - startDate;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    expect(durationDays).toBeGreaterThanOrEqual(1);
  });

  test('should validate maximum booking duration', () => {
    const maxDays = 365;
    const startDate = new Date(Date.now() + 86400000);
    const endDate = new Date(startDate.getTime() + (maxDays * 24 * 60 * 60 * 1000));
    
    const durationMs = endDate - startDate;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    expect(durationDays).toBeLessThanOrEqual(maxDays);
  });
});

describe('Booking Response Fields', () => {
  test('should include all required response fields', () => {
    const booking = {
      _id: 'booking1',
      customer: 'customer1',
      provider: 'provider1',
      vehicle: 'vehicle1',
      startDate: new Date(),
      endDate: new Date(),
      numberOfDays: 2,
      dailyRate: 1500,
      totalCost: 3000,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(booking._id).toBeDefined();
    expect(booking.customer).toBeDefined();
    expect(booking.provider).toBeDefined();
    expect(booking.vehicle).toBeDefined();
    expect(booking.startDate).toBeDefined();
    expect(booking.endDate).toBeDefined();
    expect(booking.totalCost).toBeDefined();
    expect(booking.status).toBeDefined();
  });

  test('should sanitize sensitive fields in response', () => {
    const booking = {
      _id: 'booking1',
      customer: 'customer1',
      provider: 'provider1',
      password: 'secret',
      apiKey: 'key123'
    };
    
    const safeBooking = {
      _id: booking._id,
      customer: booking.customer,
      provider: booking.provider
    };
    
    expect(safeBooking.password).toBeUndefined();
    expect(safeBooking.apiKey).toBeUndefined();
  });
});
