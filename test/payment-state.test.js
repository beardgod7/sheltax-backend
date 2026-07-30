const test = require("node:test");
const assert = require("node:assert/strict");

const {
  priceBreakdown,
  assertCanCheckout,
  resolveSettlement,
} = require("../src/features/Payment/state");

const BUYER = "buyer-1";

function listing(overrides = {}) {
  return {
    id: "listing-1",
    ownerId: "owner-1",
    approvalStatus: "APPROVED",
    availabilityStatus: "AVAILABLE",
    price: 1000000,
    ...overrides,
  };
}

function interestedInspection(overrides = {}) {
  return { id: "insp-1", status: "COMPLETED", outcome: "INTERESTED", ...overrides };
}

function codeOf(fn) {
  try {
    fn();
  } catch (error) {
    return error.code;
  }
  return null;
}

test("the fee is 1.5% and the total always reconciles", () => {
  const { amount, platformFee, totalAmount } = priceBreakdown(1000000);
  assert.equal(amount, 1000000);
  assert.equal(platformFee, 15000);
  assert.equal(totalAmount, 1015000);
  assert.equal(amount + platformFee, totalAmount);
});

test("a listing with no usable price cannot be charged", () => {
  for (const price of [0, -5, null, undefined, "abc"]) {
    assert.equal(codeOf(() => priceBreakdown(price)), "INVALID_PRICE", `price ${price}`);
  }
});

test("an interested seeker on an available listing may check out", () => {
  assert.equal(
    assertCanCheckout({
      listing: listing(),
      buyerId: BUYER,
      inspection: interestedInspection(),
    }),
    true
  );
});

test("checkout is blocked without a completed, interested inspection", () => {
  assert.equal(
    codeOf(() => assertCanCheckout({ listing: listing(), buyerId: BUYER, inspection: null })),
    "INSPECTION_REQUIRED"
  );
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing(),
        buyerId: BUYER,
        inspection: interestedInspection({ outcome: "NOT_INTERESTED" }),
      })
    ),
    "INSPECTION_NOT_INTERESTED"
  );
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing(),
        buyerId: BUYER,
        inspection: interestedInspection({ outcome: "NO_SHOW" }),
      })
    ),
    "INSPECTION_NOT_INTERESTED"
  );
});

test("a sold or reserved listing cannot be bought again", () => {
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing({ availabilityStatus: "SOLD" }),
        buyerId: BUYER,
        inspection: interestedInspection(),
      })
    ),
    "LISTING_SOLD"
  );
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing({ availabilityStatus: "RESERVED" }),
        buyerId: BUYER,
        inspection: interestedInspection(),
      })
    ),
    "LISTING_RESERVED"
  );
});

test("an owner cannot buy their own listing", () => {
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing({ ownerId: BUYER }),
        buyerId: BUYER,
        inspection: interestedInspection(),
      })
    ),
    "SELF_PURCHASE"
  );
});

test("an unapproved listing is not purchasable", () => {
  assert.equal(
    codeOf(() =>
      assertCanCheckout({
        listing: listing({ approvalStatus: "PENDING" }),
        buyerId: BUYER,
        inspection: interestedInspection(),
      })
    ),
    "LISTING_NOT_APPROVED"
  );
});

test("a successful settlement marks the listing sold and stamps paidAt", () => {
  const { changes, availabilityStatus, alreadySettled } = resolveSettlement({
    payment: { status: "PENDING" },
    outcome: "SUCCESS",
  });
  assert.equal(alreadySettled, false);
  assert.equal(changes.status, "SUCCESSFUL");
  assert.ok(changes.paidAt instanceof Date);
  assert.equal(availabilityStatus, "SOLD");
});

test("a failed settlement returns the listing to the market", () => {
  const { changes, availabilityStatus } = resolveSettlement({
    payment: { status: "PENDING" },
    outcome: "FAILURE",
    reason: "Insufficient funds",
  });
  assert.equal(changes.status, "FAILED");
  assert.equal(changes.failureReason, "Insufficient funds");
  assert.equal(availabilityStatus, "AVAILABLE");
});

test("replaying the same settlement is a no-op, as a webhook may be redelivered", () => {
  const replay = resolveSettlement({ payment: { status: "SUCCESSFUL" }, outcome: "SUCCESS" });
  assert.equal(replay.alreadySettled, true);
  assert.equal(replay.changes, null);

  const failReplay = resolveSettlement({ payment: { status: "FAILED" }, outcome: "FAILURE" });
  assert.equal(failReplay.alreadySettled, true);
});

test("a settled payment cannot be flipped to the opposite outcome", () => {
  assert.equal(
    codeOf(() => resolveSettlement({ payment: { status: "SUCCESSFUL" }, outcome: "FAILURE" })),
    "PAYMENT_ALREADY_SETTLED"
  );
  assert.equal(
    codeOf(() => resolveSettlement({ payment: { status: "FAILED" }, outcome: "SUCCESS" })),
    "PAYMENT_ALREADY_SETTLED"
  );
});

test("an unknown settlement outcome is rejected", () => {
  assert.equal(
    codeOf(() => resolveSettlement({ payment: { status: "PENDING" }, outcome: "MAYBE" })),
    "INVALID_OUTCOME"
  );
});
