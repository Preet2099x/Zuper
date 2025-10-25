import BookingRequest from "../models/BookingRequest.js";
import Contract from "../models/Contract.js";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";

// Customer requests a vehicle booking
export const createBookingRequest = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, customerNote } = req.body;

    // Validate required fields
    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // Check if dates are in the future
    if (start < new Date()) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    // Get vehicle details
    const vehicle = await Vehicle.findById(vehicleId).populate("provider");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if vehicle is available
    if (vehicle.status !== "available") {
      return res.status(400).json({ message: "Vehicle is not available" });
    }

    // Calculate cost
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = numberOfDays * vehicle.dailyRate;

    // Create booking request
    const bookingRequest = await BookingRequest.create({
      customer: req.user.id,
      provider: vehicle.provider._id,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      numberOfDays,
      dailyRate: vehicle.dailyRate,
      totalCost,
      customerNote: customerNote || "",
      status: "pending"
    });

    // Populate all references
    const populatedBooking = await bookingRequest.populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName" },
      { path: "vehicle", select: "company model year licensePlate" }
    ]);

    res.status(201).json({
      message: "Booking request created successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Create booking request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Customer gets their booking requests
export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ customer: req.user.id })
      .populate([
        { path: "customer", select: "name email phone" },
        { path: "provider", select: "name email businessName" },
        { path: "vehicle", select: "company model year licensePlate images" }
      ])
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get customer bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Provider gets booking requests for their vehicles (inbox)
export const getProviderBookingRequests = async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ provider: req.user.id })
      .populate([
        { path: "customer", select: "name email phone" },
        { path: "provider", select: "name email businessName" },
        { path: "vehicle", select: "company model year licensePlate images" }
      ])
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get provider booking requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Provider approves booking request
export const approveBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { providerNote } = req.body;

    const bookingRequest = await BookingRequest.findById(bookingId).populate("vehicle provider customer");

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    // Verify provider owns this booking
    if (bookingRequest.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to approve this booking" });
    }

    // Check if already processed
    if (bookingRequest.status !== "pending") {
      return res.status(400).json({ message: `Booking request is already ${bookingRequest.status}` });
    }

    // Create contract
    const contract = await Contract.create({
      customer: bookingRequest.customer._id,
      provider: bookingRequest.provider._id,
      vehicle: bookingRequest.vehicle._id,
      startDate: bookingRequest.startDate,
      endDate: bookingRequest.endDate,
      status: "active"
    });

    // Update booking request status
    bookingRequest.status = "approved";
    bookingRequest.providerNote = providerNote || "";
    bookingRequest.contract = contract._id;
    await bookingRequest.save();

    // Update vehicle status to rented
    await Vehicle.findByIdAndUpdate(bookingRequest.vehicle._id, {
      status: "rented"
    });

    // Add contract to customer
    await Customer.findByIdAndUpdate(bookingRequest.customer._id, {
      $push: { contracts: contract._id }
    });

    const populatedBooking = await bookingRequest.populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName" },
      { path: "vehicle", select: "company model year licensePlate" }
    ]);

    res.json({
      message: "Booking request approved successfully",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Approve booking request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Provider rejects booking request
export const rejectBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { providerNote } = req.body;

    const bookingRequest = await BookingRequest.findById(bookingId).populate("provider");

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    // Verify provider owns this booking
    if (bookingRequest.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to reject this booking" });
    }

    // Check if already processed
    if (bookingRequest.status !== "pending") {
      return res.status(400).json({ message: `Booking request is already ${bookingRequest.status}` });
    }

    // Update booking request status
    bookingRequest.status = "rejected";
    bookingRequest.providerNote = providerNote || "";
    await bookingRequest.save();

    const populatedBooking = await bookingRequest.populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName" },
      { path: "vehicle", select: "company model year licensePlate" }
    ]);

    res.json({
      message: "Booking request rejected",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Reject booking request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single booking request
export const getBookingRequestById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const bookingRequest = await BookingRequest.findById(bookingId).populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName" },
      { path: "vehicle" }
    ]);

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    res.json(bookingRequest);
  } catch (error) {
    console.error("Get booking request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Customer cancels booking request
export const cancelBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const bookingRequest = await BookingRequest.findById(bookingId);

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    // Verify customer owns this booking
    if (bookingRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Can only cancel if pending or not yet started
    if (bookingRequest.status === "approved" && bookingRequest.startDate < new Date()) {
      return res.status(400).json({ message: "Cannot cancel booking that has already started" });
    }

    bookingRequest.status = "cancelled";
    await bookingRequest.save();

    const populatedBooking = await bookingRequest.populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName" },
      { path: "vehicle", select: "company model year licensePlate" }
    ]);

    res.json({
      message: "Booking request cancelled",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Cancel booking request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
