import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Contract from "../models/Contract.js";
import BookingRequest from "../models/BookingRequest.js";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order after contract is signed
export const createPaymentOrder = async (req, res) => {
  try {
    const { contractId } = req.params;

    // Get contract details
    const contract = await Contract.findById(contractId).populate("booking");
    
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Verify customer owns this contract
    if (contract.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if contract is signed
    if (contract.status !== "SIGNED") {
      return res.status(400).json({ message: "Contract must be signed before payment" });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ contract: contractId });
    if (existingPayment && existingPayment.status === "paid") {
      return res.status(400).json({ message: "Payment already completed for this contract" });
    }

    // Get booking details for amount
    const booking = contract.booking;
    const amount = booking.totalCost * 100; // Convert to paise (Razorpay uses smallest currency unit)

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `contract_${contractId}`,
      notes: {
        contractId: contractId,
        bookingId: booking._id.toString(),
        customerId: req.user.id
      }
    });

    // Create or update payment record
    let payment;
    if (existingPayment) {
      existingPayment.razorpayOrderId = razorpayOrder.id;
      existingPayment.amount = booking.totalCost;
      existingPayment.status = "pending";
      payment = await existingPayment.save();
    } else {
      payment = await Payment.create({
        contract: contractId,
        booking: booking._id,
        customer: req.user.id,
        amount: booking.totalCost,
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        status: "pending"
      });

      // Link payment to contract
      contract.payment = payment._id;
      await contract.save();
    }

    res.json({
      message: "Payment order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      },
      payment: payment,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify and complete payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      // Mark payment as failed
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId }).populate([
      { path: "contract" },
      { path: "booking" }
    ]);

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Check if already paid
    if (payment.status === "paid") {
      return res.json({
        message: "Payment already processed",
        payment: payment
      });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "paid";
    await payment.save();

    // Update booking status to CONFIRMED (payment completed)
    const booking = await BookingRequest.findById(payment.booking._id);
    if (booking.status !== "CONFIRMED") {
      booking.status = "CONFIRMED";
      await booking.save();

      // Mark vehicle as rented
      await Vehicle.findByIdAndUpdate(booking.vehicle, {
        status: "rented"
      });

      // Add contract to customer's contracts list
      await Customer.findByIdAndUpdate(payment.customer, {
        $addToSet: { contracts: payment.contract._id }
      });
    }

    const populatedPayment = await Payment.findById(payment._id).populate([
      { path: "contract" },
      { path: "booking" },
      { path: "customer", select: "name email phone" }
    ]);

    res.json({
      message: "Payment verified and booking confirmed successfully",
      payment: populatedPayment,
      success: true
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get payment details by contract ID
export const getPaymentByContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const payment = await Payment.findOne({ contract: contractId }).populate([
      { path: "contract" },
      { path: "booking" },
      { path: "customer", select: "name email phone" }
    ]);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Verify user has access
    if (payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get customer's payment history
export const getCustomerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user.id })
      .populate([
        { path: "contract" },
        { path: "booking" },
        { path: "customer", select: "name email phone" }
      ])
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Get customer payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Webhook handler for Razorpay events (optional)
export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const body = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Handle payment success
    if (event === "payment.captured") {
      const payment = await Payment.findOne({ 
        razorpayPaymentId: paymentEntity.id 
      });

      if (payment && payment.status !== "paid") {
        payment.status = "paid";
        await payment.save();

        // Update booking and vehicle status
        const booking = await BookingRequest.findById(payment.booking);
        if (booking.status !== "CONFIRMED") {
          booking.status = "CONFIRMED";
          await booking.save();

          await Vehicle.findByIdAndUpdate(booking.vehicle, {
            status: "rented"
          });

          await Customer.findByIdAndUpdate(payment.customer, {
            $addToSet: { contracts: payment.contract }
          });
        }
      }
    }

    // Handle payment failure
    if (event === "payment.failed") {
      const payment = await Payment.findOne({ 
        razorpayOrderId: paymentEntity.order_id 
      });

      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
