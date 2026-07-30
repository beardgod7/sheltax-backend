const { Op } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { Payment } = require("./model");
const { Listing, Notification } = require("../Listing/model");
const { User } = require("../Authentication/model");
const { Inspection } = require("../Inspection/model");
const {
  priceBreakdown,
  buildReference,
  assertCanCheckout,
  resolveSettlement,
} = require("./state");

const LISTING_SUMMARY = ["id", "title", "location", "city", "state", "images", "price", "currency", "intent"];
const PARTY_SUMMARY = ["id", "firstName", "surname", "email", "phoneNumber"];

class PaymentRepository {
  /**
   * Open a checkout. Reserves the listing inside the same transaction that
   * creates the payment, so a second buyer cannot slip in behind the check.
   */
  async initiateCheckout(buyerId, listingId) {
    return sequelize.transaction(async (transaction) => {
      const listing = await Listing.findByPk(listingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      // Resolved before the availability check on purpose: this buyer's own
      // open checkout is what put the listing in RESERVED, so reopening the
      // modal must return that checkout rather than be blocked by it.
      const existing = await Payment.findOne({
        where: { listingId, buyerId, status: "PENDING" },
        transaction,
      });
      if (existing) return existing;

      const inspection = await Inspection.findOne({
        where: { propertyId: listingId, seekerId: buyerId, status: "COMPLETED" },
        order: [["completedAt", "DESC"]],
        transaction,
      });

      assertCanCheckout({ listing, buyerId, inspection });

      const { amount, platformFee, totalAmount } = priceBreakdown(listing.price);

      const payment = await Payment.create(
        {
          listingId,
          buyerId,
          sellerId: listing.ownerId,
          inspectionId: inspection.id,
          amount,
          platformFee,
          totalAmount,
          currency: listing.currency || "NGN",
          provider: "MOCK",
          reference: buildReference(),
          status: "PENDING",
          metadata: { listingTitle: listing.title, intent: listing.intent },
        },
        { transaction }
      );

      await listing.update({ availabilityStatus: "RESERVED" }, { transaction });

      return payment;
    });
  }

  /**
   * Settle a pending checkout. In production this is the gateway webhook; the
   * mock provider drives it from the client instead.
   */
  async settleCheckout(reference, buyerId, outcome, reason) {
    return sequelize.transaction(async (transaction) => {
      const payment = await Payment.findOne({
        where: { reference },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!payment) {
        const error = new Error("Payment not found.");
        error.statusCode = 404;
        throw error;
      }

      if (payment.buyerId !== buyerId) {
        const error = new Error("This checkout belongs to another buyer.");
        error.statusCode = 403;
        throw error;
      }

      const { alreadySettled, changes, availabilityStatus } = resolveSettlement({
        payment,
        outcome,
        reason,
      });

      if (alreadySettled) return payment;

      await payment.update(changes, { transaction });

      const listing = await Listing.findByPk(payment.listingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (listing) {
        await listing.update({ availabilityStatus }, { transaction });
      }

      if (payment.status === "SUCCESSFUL") {
        await this.onSaleSettled({ payment, listing, transaction });
      }

      return payment;
    });
  }

  /**
   * A settled sale takes the property off the market, so every other seeker
   * still holding an unresolved inspection on it is told and released.
   */
  async onSaleSettled({ payment, listing, transaction }) {
    const title = listing?.title || "the property";

    await Notification.create(
      {
        userId: payment.sellerId,
        title: "Your property has been paid for",
        message: `A buyer completed payment for "${title}". It is now marked as taken.`,
        type: "PAYMENT_RECEIVED",
        link: "/owner/listings",
        metadata: { listingId: payment.listingId, paymentId: payment.id, reference: payment.reference },
      },
      { transaction }
    );

    const orphaned = await Inspection.findAll({
      where: {
        propertyId: payment.listingId,
        seekerId: { [Op.ne]: payment.buyerId },
        status: { [Op.in]: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
      },
      transaction,
    });

    for (const inspection of orphaned) {
      await inspection.update({ status: "CANCELLED" }, { transaction });
      await Notification.create(
        {
          userId: inspection.seekerId,
          title: "Property no longer available",
          message: `"${title}" has been taken, so your inspection request was cancelled.`,
          type: "INSPECTION_CANCELLED",
          link: "/profile/inquiries",
          metadata: { inspectionId: inspection.id, listingId: payment.listingId },
        },
        { transaction }
      );
    }
  }

  async getBuyerPayments(buyerId, pagination, status) {
    return Payment.findAndCountAll({
      where: { buyerId, ...(status ? { status } : {}) },
      include: [
        { model: Listing, as: "listing", attributes: LISTING_SUMMARY },
        { model: User, as: "seller", attributes: PARTY_SUMMARY },
      ],
      order: [["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  }

  /** An Owner's or Broker's own sales. Defaults to settled sales only. */
  async getSellerSales(sellerId, pagination, status = "SUCCESSFUL") {
    return Payment.findAndCountAll({
      where: { sellerId, ...(status && status !== "ALL" ? { status } : {}) },
      include: [
        { model: Listing, as: "listing", attributes: LISTING_SUMMARY },
        { model: User, as: "buyer", attributes: PARTY_SUMMARY },
      ],
      order: [["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  }

  /** Platform-wide sales report: every settled sale with both counterparties. */
  async getAllSales(pagination, filters = {}) {
    const where = {};
    const status = filters.status && filters.status !== "ALL" ? filters.status : "SUCCESSFUL";
    if (status) where.status = status;

    const listingWhere = {};
    if (filters.intent && filters.intent !== "ALL") {
      listingWhere.intent = String(filters.intent).toUpperCase();
    }

    const include = [
      {
        model: Listing,
        as: "listing",
        attributes: [...LISTING_SUMMARY, "propertyType", "availabilityStatus"],
        ...(Object.keys(listingWhere).length ? { where: listingWhere } : {}),
      },
      { model: User, as: "buyer", attributes: PARTY_SUMMARY },
      { model: User, as: "seller", attributes: [...PARTY_SUMMARY, "role", "kycStatus"] },
    ];

    if (filters.q && filters.q.trim()) {
      const term = `%${filters.q.trim()}%`;
      where[Op.or] = [
        { reference: { [Op.iLike]: term } },
        { "$listing.title$": { [Op.iLike]: term } },
        { "$buyer.email$": { [Op.iLike]: term } },
        { "$seller.email$": { [Op.iLike]: term } },
      ];
    }

    return Payment.findAndCountAll({
      where,
      include,
      order: [["paidAt", "DESC"], ["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
      subQuery: false,
    });
  }

  /** Headline totals for the sales report. Money is summed in the database. */
  async getSalesSummary(scope = {}) {
    const where = { status: "SUCCESSFUL" };
    if (scope.sellerId) where.sellerId = scope.sellerId;
    if (scope.buyerId) where.buyerId = scope.buyerId;

    const row = await Payment.findOne({
      where,
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "grossValue"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("platformFee")), 0), "platformFees"],
        [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("totalAmount")), 0), "totalCollected"],
      ],
      raw: true,
    });

    return {
      count: Number(row?.count || 0),
      grossValue: Number(row?.grossValue || 0),
      platformFees: Number(row?.platformFees || 0),
      totalCollected: Number(row?.totalCollected || 0),
    };
  }

  /** What the listing page needs to decide between Pay, Locked and Taken. */
  async getListingPurchaseState(listingId, viewerId) {
    if (!viewerId) return { canPay: false, reason: "AUTH_REQUIRED", payment: null };

    const [inspection, payment] = await Promise.all([
      Inspection.findOne({
        where: { propertyId: listingId, seekerId: viewerId, status: "COMPLETED" },
        order: [["completedAt", "DESC"]],
      }),
      Payment.findOne({
        where: { listingId, buyerId: viewerId, status: { [Op.in]: ["PENDING", "SUCCESSFUL"] } },
        order: [["createdAt", "DESC"]],
      }),
    ]);

    if (payment?.status === "SUCCESSFUL") {
      return { canPay: false, reason: "ALREADY_PURCHASED", payment };
    }

    const interested = inspection?.status === "COMPLETED" && inspection.outcome === "INTERESTED";
    return {
      canPay: interested,
      reason: interested ? null : inspection ? "INSPECTION_NOT_INTERESTED" : "INSPECTION_REQUIRED",
      payment,
    };
  }
}

module.exports = new PaymentRepository();
