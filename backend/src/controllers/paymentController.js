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
    const { emiMonths } = req.body;

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
    const totalAmount = booking.totalCost;
    const requiresEmi = totalAmount > 100000;
    const parsedEmiMonths = emiMonths !== undefined && emiMonths !== null && emiMonths !== "" ? Number(emiMonths) : null;

    if (requiresEmi && !parsedEmiMonths) {
      return res.status(400).json({ message: "Amount above ₹1,00,000 must be paid via EMI" });
    }

    if (parsedEmiMonths && (!Number.isInteger(parsedEmiMonths) || parsedEmiMonths < 2)) {
      return res.status(400).json({ message: "EMI duration must be an integer of at least 2 months" });
    }

    let paymentPlan = parsedEmiMonths ? "emi" : "full";
    if (requiresEmi) paymentPlan = "emi";
    if (existingPayment?.paymentPlan === "emi") paymentPlan = "emi";

    let totalInstallments = parsedEmiMonths;
    let installmentAmount = totalAmount;
    let remainingAmount = totalAmount;
    let orderAmountRupees = totalAmount;

    if (paymentPlan === "emi") {
      totalInstallments = totalInstallments || existingPayment?.emi?.totalInstallments;
      if (!totalInstallments) {
        return res.status(400).json({ message: "EMI duration is required" });
      }

      installmentAmount = existingPayment?.emi?.installmentAmount
        || Number((totalAmount / totalInstallments).toFixed(2));

      if (installmentAmount > 100000) {
        return res.status(400).json({ message: "Each EMI must not exceed ₹1,00,000. Increase EMI duration." });
      }

      remainingAmount = existingPayment?.emi?.remainingAmount ?? totalAmount;
      if (remainingAmount <= 0) {
        return res.status(400).json({ message: "All EMI installments are already paid" });
      }

      const hasPendingInstallment = existingPayment?.emi?.installments?.some(i => i.status === "pending");
      if (hasPendingInstallment) {
        return res.status(400).json({ message: "Previous EMI installment is still pending" });
      }

      orderAmountRupees = Math.min(installmentAmount, remainingAmount);
    }

    const amount = Math.round(orderAmountRupees * 100); // Convert to paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `contract_${contractId}`,
      notes: {
        contractId: contractId,
        bookingId: booking._id.toString(),
        customerId: req.user.id,
        paymentPlan: paymentPlan,
        totalInstallments: paymentPlan === "emi" ? String(totalInstallments) : "1"
      }
    });

    // Create or update payment record
    let payment;
    if (existingPayment) {
      if (existingPayment.status === "paid") {
        return res.status(400).json({ message: "Payment already completed for this contract" });
      }
      existingPayment.razorpayOrderId = razorpayOrder.id;
      existingPayment.amount = totalAmount;
      existingPayment.status = "pending";
      existingPayment.paymentPlan = paymentPlan;

      if (paymentPlan === "emi") {
        const installments = existingPayment.emi?.installments || [];
        installments.push({
          orderId: razorpayOrder.id,
          amount: orderAmountRupees,
          status: "pending"
        });

        existingPayment.emi = {
          totalInstallments,
          installmentAmount,
          installmentsPaid: existingPayment.emi?.installmentsPaid || 0,
          remainingAmount,
          installments
        };
      } else {
        existingPayment.emi = undefined;
      }

      payment = await existingPayment.save();
    } else {
      payment = await Payment.create({
        contract: contractId,
        booking: booking._id,
        customer: req.user.id,
        amount: totalAmount,
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
        paymentPlan: paymentPlan,
        emi: paymentPlan === "emi" ? {
          totalInstallments,
          installmentAmount,
          installmentsPaid: 0,
          remainingAmount,
          installments: [{
            orderId: razorpayOrder.id,
            amount: orderAmountRupees,
            status: "pending"
          }]
        } : undefined
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
    const payment = await Payment.findOne({
      $or: [
        { razorpayOrderId },
        { "emi.installments.orderId": razorpayOrderId }
      ]
    }).populate([
      { path: "contract" },
      { path: "booking" }
    ]);

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.paymentPlan === "emi") {
      const installment = payment.emi?.installments?.find(i => i.orderId === razorpayOrderId);
      if (installment?.status === "paid") {
        return res.json({ message: "Installment already processed", payment });
      }

      if (installment) {
        installment.paymentId = razorpayPaymentId;
        installment.signature = razorpaySignature;
        installment.status = "paid";
        installment.paidAt = new Date();
      } else {
        payment.emi.installments.push({
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
          amount: payment.emi?.installmentAmount || 0,
          status: "paid",
          paidAt: new Date()
        });
      }

      const paidAmount = installment?.amount || payment.emi?.installmentAmount || 0;
      payment.emi.installmentsPaid = (payment.emi.installmentsPaid || 0) + 1;
      payment.emi.remainingAmount = Math.max(0, (payment.emi.remainingAmount ?? payment.amount) - paidAmount);

      if (payment.emi.remainingAmount === 0) {
        payment.status = "paid";
      } else {
        payment.status = "pending";
      }

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();
    } else {
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
    }

    // Update booking status to CONFIRMED
    const booking = await BookingRequest.findById(payment.booking._id);
    const shouldConfirm = payment.paymentPlan === "emi"
      ? (payment.emi?.installmentsPaid || 0) >= 1
      : payment.status === "paid";

    if (shouldConfirm && booking.status !== "CONFIRMED") {
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
      message: payment.paymentPlan === "emi" && payment.status !== "paid"
        ? "EMI installment paid successfully"
        : "Payment verified and booking confirmed successfully",
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
        $or: [
          { razorpayPaymentId: paymentEntity.id },
          { razorpayOrderId: paymentEntity.order_id },
          { "emi.installments.orderId": paymentEntity.order_id }
        ]
      });

      if (payment) {
        if (payment.paymentPlan === "emi") {
          const installment = payment.emi?.installments?.find(i => i.orderId === paymentEntity.order_id);
          if (installment && installment.status !== "paid") {
            installment.paymentId = paymentEntity.id;
            installment.status = "paid";
            installment.paidAt = new Date();
            payment.emi.installmentsPaid = (payment.emi.installmentsPaid || 0) + 1;
            const paidAmount = installment.amount || payment.emi.installmentAmount || 0;
            payment.emi.remainingAmount = Math.max(0, (payment.emi.remainingAmount ?? payment.amount) - paidAmount);
          }

          if (payment.emi?.remainingAmount === 0) {
            payment.status = "paid";
          } else {
            payment.status = "pending";
          }
        } else if (payment.status !== "paid") {
          payment.status = "paid";
        }

        await payment.save();

        const booking = await BookingRequest.findById(payment.booking);
        const shouldConfirm = payment.paymentPlan === "emi"
          ? (payment.emi?.installmentsPaid || 0) >= 1
          : payment.status === "paid";

        if (shouldConfirm && booking.status !== "CONFIRMED") {
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
        $or: [
          { razorpayOrderId: paymentEntity.order_id },
          { "emi.installments.orderId": paymentEntity.order_id }
        ]
      });

      if (payment) {
        if (payment.paymentPlan === "emi") {
          const installment = payment.emi?.installments?.find(i => i.orderId === paymentEntity.order_id);
          if (installment) {
            installment.status = "failed";
          }
          payment.status = "pending";
        } else {
          payment.status = "failed";
        }
        await payment.save();
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
