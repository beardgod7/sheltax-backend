const PAYMENT_STATUSES = ["PENDING", "SUCCESSFUL", "FAILED"];
const TERMINAL_STATUSES = ["SUCCESSFUL", "FAILED"];

// Only these listing states can start a checkout. RESERVED means another buyer
// already has an open checkout; SOLD means the sale already settled.
const PURCHASABLE_AVAILABILITY = ["AVAILABLE"];

const PLATFORM_FEE_RATE = 0.015;

function fail(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

/** Naira are quoted whole; keep money integral so totals always reconcile. */
function priceBreakdown(price) {
  const amount = Math.round(Number(price));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw fail("This listing has no valid price to charge.", 422, "INVALID_PRICE");
  }
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  return { amount, platformFee, totalAmount: amount + platformFee };
}

function buildReference() {
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return `SLX-${Date.now().toString(36).toUpperCase()}-${random}`;
}

/**
 * Decide whether a seeker may open a checkout on a listing.
 *
 * `inspection` is the caller's own inspection record for this listing, or null.
 * Paying is gated on a completed inspection the seeker marked INTERESTED, so a
 * purchase is always backed by evidence the buyer actually saw the property.
 */
function assertCanCheckout({ listing, buyerId, inspection }) {
  if (!listing) {
    throw fail("Listing not found.", 404, "LISTING_NOT_FOUND");
  }

  if (listing.approvalStatus !== "APPROVED") {
    throw fail("This listing is not available for purchase.", 409, "LISTING_NOT_APPROVED");
  }

  if (listing.ownerId === buyerId) {
    throw fail("You cannot buy your own listing.", 403, "SELF_PURCHASE");
  }

  if (listing.availabilityStatus === "SOLD") {
    throw fail("This property has already been taken.", 409, "LISTING_SOLD");
  }

  if (!PURCHASABLE_AVAILABILITY.includes(listing.availabilityStatus)) {
    throw fail(
      "Another buyer is currently completing checkout on this property.",
      409,
      "LISTING_RESERVED"
    );
  }

  if (!inspection) {
    throw fail(
      "Complete an inspection for this property before paying.",
      403,
      "INSPECTION_REQUIRED"
    );
  }

  if (inspection.status !== "COMPLETED" || inspection.outcome !== "INTERESTED") {
    throw fail(
      "You can pay once your inspection is complete and you have confirmed you are interested.",
      403,
      "INSPECTION_NOT_INTERESTED"
    );
  }

  return true;
}

/**
 * Decide how a pending checkout settles. Returns the payment fields to persist
 * and the availability the listing should end up in.
 */
function resolveSettlement({ payment, outcome, reason }) {
  if (!payment) {
    throw fail("Payment not found.", 404, "PAYMENT_NOT_FOUND");
  }

  if (!["SUCCESS", "FAILURE"].includes(outcome)) {
    throw fail("Outcome must be SUCCESS or FAILURE.", 400, "INVALID_OUTCOME");
  }

  const target = outcome === "SUCCESS" ? "SUCCESSFUL" : "FAILED";

  // Idempotent replay: settling the same way twice is a no-op, not an error,
  // because a real gateway may deliver its webhook more than once.
  if (payment.status === target) {
    return { alreadySettled: true, changes: null, availabilityStatus: null };
  }

  if (TERMINAL_STATUSES.includes(payment.status)) {
    throw fail(
      `This payment already ${payment.status === "SUCCESSFUL" ? "succeeded" : "failed"} and cannot be changed.`,
      409,
      "PAYMENT_ALREADY_SETTLED"
    );
  }

  if (target === "SUCCESSFUL") {
    return {
      alreadySettled: false,
      changes: { status: "SUCCESSFUL", paidAt: new Date(), failureReason: null },
      availabilityStatus: "SOLD",
    };
  }

  return {
    alreadySettled: false,
    changes: {
      status: "FAILED",
      failureReason: reason || "Payment was declined by the provider.",
    },
    // A failed checkout puts the property back on the market.
    availabilityStatus: "AVAILABLE",
  };
}

module.exports = {
  PAYMENT_STATUSES,
  TERMINAL_STATUSES,
  PLATFORM_FEE_RATE,
  priceBreakdown,
  buildReference,
  assertCanCheckout,
  resolveSettlement,
};
