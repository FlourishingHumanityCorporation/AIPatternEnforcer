// Test file for AI context annotations

// @ai-context: payment-processing
// This module handles all payment processing logic

const stripe = require("stripe");

// @ai-previous: docs/decisions/payment-provider.md
// We chose Stripe based on the analysis in the decision document

// @ai-pattern: repository-pattern
class PaymentRepository {
  constructor(db) {
    this.db = db;
  }

  // @ai-important
  // This method must validate the payment method before processing
  async processPayment(paymentData) {
    // Validate first
    if (!this.validatePaymentMethod(paymentData)) {
      throw new Error("Invalid payment method");
    }

    // Process payment
    return await stripe.charges.create(paymentData);
  }

  // @ai-ignore
  // Legacy method - do not modify
  oldPaymentHandler(data) {
    // Old implementation
    console.log("Processing payment the old way");
  }
  // @ai-ignore-end

  validatePaymentMethod(data) {
    // @ai-pattern: validation-pattern
    return data.amount > 0 && data.currency && data.method;
  }
}

// @ai-context: order-processing
// Order processing that uses the payment system

class OrderService {
  constructor(paymentRepo) {
    // @ai-previous: architecture-decisions/service-pattern.md
    this.paymentRepo = paymentRepo;
  }

  async createOrder(orderData) {
    // @ai-important
    // Orders must be saved before payment processing
    const order = await this.saveOrder(orderData);

    try {
      const payment = await this.paymentRepo.processPayment(orderData.payment);
      order.paymentId = payment.id;
      await this.updateOrder(order);
    } catch (error) {
      // @ai-pattern: error-handling
      await this.markOrderFailed(order, error);
      throw error;
    }

    return order;
  }
}

module.exports = { PaymentRepository, OrderService };
