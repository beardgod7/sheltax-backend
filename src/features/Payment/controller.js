const paymentRepository = require("./repository");
const { getPagination, paginatedData } = require("../../utils/pagination");

function userIdFrom(req) {
  return req.user?.sub || req.user?.id || req.user?.userId;
}

function normaliseStatus(status) {
  if (!status) return undefined;
  const value = String(status).toUpperCase();
  return value === "ALL" ? "ALL" : value;
}

function errorResponse(res, error, fallback) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallback,
    ...(error.code ? { code: error.code } : {}),
  });
}

class PaymentController {
  async initiateCheckout(req, res) {
    try {
      const buyerId = userIdFrom(req);
      const { listingId } = req.body;

      if (!listingId) {
        return res.status(400).json({ success: false, message: "listingId is required." });
      }

      const payment = await paymentRepository.initiateCheckout(buyerId, listingId);

      return res.status(201).json({
        success: true,
        message: "Checkout opened.",
        data: payment,
      });
    } catch (error) {
      console.error("Initiate Checkout Error:", error);
      return errorResponse(res, error, "Failed to open checkout.");
    }
  }

  /**
   * Mock provider settlement. This is the seam a real Paystack webhook would
   * replace, so it is deliberately the only place a payment becomes terminal.
   */
  async settleCheckout(req, res) {
    try {
      const buyerId = userIdFrom(req);
      const { reference } = req.params;
      const { outcome, reason } = req.body;

      if (!outcome) {
        return res.status(400).json({
          success: false,
          message: "Outcome is required (SUCCESS or FAILURE).",
        });
      }

      const payment = await paymentRepository.settleCheckout(
        reference,
        buyerId,
        String(outcome).toUpperCase(),
        reason
      );

      return res.status(200).json({
        success: true,
        message:
          payment.status === "SUCCESSFUL"
            ? "Payment successful. The property is now marked as taken."
            : "Payment failed. The property is still available.",
        data: payment,
      });
    } catch (error) {
      console.error("Settle Checkout Error:", error);
      return errorResponse(res, error, "Failed to settle checkout.");
    }
  }

  /** The seeker's own purchases. */
  async getMyPayments(req, res) {
    try {
      const buyerId = userIdFrom(req);
      const pagination = getPagination(req.query);
      const status = normaliseStatus(req.query.status);

      const [{ count, rows }, summary] = await Promise.all([
        paymentRepository.getBuyerPayments(buyerId, pagination, status),
        paymentRepository.getSalesSummary({ buyerId }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: { ...paginatedData("payments", rows, count, pagination), summary },
      });
    } catch (error) {
      console.error("Get My Payments Error:", error);
      return errorResponse(res, error, "Failed to fetch payments.");
    }
  }

  /** The owner's or broker's own sales. */
  async getMySales(req, res) {
    try {
      const sellerId = userIdFrom(req);
      const pagination = getPagination(req.query);
      const status = normaliseStatus(req.query.status) || "SUCCESSFUL";

      const [{ count, rows }, summary] = await Promise.all([
        paymentRepository.getSellerSales(sellerId, pagination, status),
        paymentRepository.getSalesSummary({ sellerId }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Sales retrieved successfully",
        data: { ...paginatedData("sales", rows, count, pagination), summary },
      });
    } catch (error) {
      console.error("Get My Sales Error:", error);
      return errorResponse(res, error, "Failed to fetch sales.");
    }
  }

  async getPurchaseState(req, res) {
    try {
      const state = await paymentRepository.getListingPurchaseState(
        req.params.listingId,
        userIdFrom(req)
      );
      return res.status(200).json({ success: true, data: state });
    } catch (error) {
      console.error("Get Purchase State Error:", error);
      return errorResponse(res, error, "Failed to resolve purchase state.");
    }
  }
}

module.exports = new PaymentController();
