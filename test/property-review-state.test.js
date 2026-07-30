const test = require("node:test");
const assert = require("node:assert/strict");

const {
  REVIEW_WINDOW_DAYS,
  ELIGIBILITY,
  reviewWindow,
  evaluateEligibility,
  assertCanSubmit,
  assertCanRevise,
  normalizeReviewInput,
} = require("../src/features/PropertyReview/state");

const NOW = new Date("2026-07-29T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBeforeNow(days) {
  return new Date(NOW.getTime() - days * DAY_MS);
}

function inspection({ id = "insp-1", outcome = "INTERESTED", daysAgo = 1, status = "COMPLETED" } = {}) {
  return {
    id,
    status,
    outcome,
    completedAt: daysBeforeNow(daysAgo),
    outcomeAt: daysBeforeNow(daysAgo),
  };
}

function codeOf(fn) {
  try {
    fn();
  } catch (error) {
    return error.code;
  }
  return null;
}

test("a completed inspection with a seeker verdict opens a 30-day window", () => {
  for (const outcome of ["INTERESTED", "NOT_INTERESTED"]) {
    const window = reviewWindow([inspection({ outcome, daysAgo: 0 })]);
    assert.ok(window, `${outcome} should grant eligibility`);
    assert.equal(
      window.expiresAt.getTime() - NOW.getTime(),
      REVIEW_WINDOW_DAYS * DAY_MS,
      "the window runs from the verdict, not from now"
    );
  }
});

test("a no-show never grants eligibility", () => {
  const eligibility = evaluateEligibility({
    inspections: [inspection({ outcome: "NO_SHOW" })],
    now: NOW,
  });
  assert.equal(eligibility.status, ELIGIBILITY.NO_QUALIFYING_INSPECTION);
  assert.equal(eligibility.canSubmit, false);
  assert.equal(
    codeOf(() => assertCanSubmit({ inspections: [inspection({ outcome: "NO_SHOW" })], now: NOW })),
    "REVIEW_NOT_ELIGIBLE"
  );
});

test("an inspection with no verdict yet grants nothing", () => {
  const pending = { id: "insp-1", status: "COMPLETED", outcome: null, completedAt: daysBeforeNow(1) };
  assert.equal(reviewWindow([pending]), null);
});

test("a seeker who never inspected the property cannot review it", () => {
  assert.equal(
    codeOf(() => assertCanSubmit({ inspections: [], now: NOW })),
    "REVIEW_NOT_ELIGIBLE"
  );
});

test("the window closes 30 days after the verdict", () => {
  const stale = [inspection({ daysAgo: 31 })];
  assert.equal(evaluateEligibility({ inspections: stale, now: NOW }).status, ELIGIBILITY.WINDOW_EXPIRED);
  assert.equal(codeOf(() => assertCanSubmit({ inspections: stale, now: NOW })), "REVIEW_WINDOW_EXPIRED");

  const fresh = [inspection({ daysAgo: 29 })];
  assert.equal(evaluateEligibility({ inspections: fresh, now: NOW }).status, ELIGIBILITY.ELIGIBLE);
});

test("a later qualifying inspection refreshes an expired window", () => {
  const inspections = [
    inspection({ id: "old", daysAgo: 90 }),
    inspection({ id: "recent", daysAgo: 2, outcome: "NOT_INTERESTED" }),
  ];
  const eligibility = evaluateEligibility({ inspections, now: NOW });
  assert.equal(eligibility.status, ELIGIBILITY.ELIGIBLE);
  assert.equal(
    eligibility.qualifyingInspectionId,
    "recent",
    "the newest visit is the provenance for the review"
  );
});

test("a later no-show does not refresh the window", () => {
  const inspections = [
    inspection({ id: "old", daysAgo: 40 }),
    inspection({ id: "noshow", daysAgo: 1, outcome: "NO_SHOW" }),
  ];
  assert.equal(evaluateEligibility({ inspections, now: NOW }).status, ELIGIBILITY.WINDOW_EXPIRED);
});

test("later visits refresh the window but open no second review slot", () => {
  const inspections = [inspection({ id: "old", daysAgo: 40 }), inspection({ id: "recent", daysAgo: 1 })];
  const review = { id: "review-1" };

  const eligibility = evaluateEligibility({ inspections, review, now: NOW });
  assert.equal(eligibility.status, ELIGIBILITY.ALREADY_REVIEWED);
  assert.equal(eligibility.canSubmit, false);
  assert.equal(eligibility.canRevise, true);
  assert.equal(codeOf(() => assertCanSubmit({ inspections, review, now: NOW })), "REVIEW_ALREADY_EXISTS");
});

test("a published review stays revisable after its window closes", () => {
  const inspections = [inspection({ daysAgo: 200 })];
  const review = { id: "review-1" };
  assert.equal(evaluateEligibility({ inspections, review, now: NOW }).canRevise, true);
  assert.equal(assertCanRevise({ review }), true);
});

test("listing deletion suspends writing without pausing the clock", () => {
  const inspections = [inspection({ daysAgo: 10 })];

  const eligible = evaluateEligibility({ inspections, listingDeleted: true, now: NOW });
  assert.equal(eligible.status, ELIGIBILITY.ELIGIBLE, "the seeker is still within their window");
  assert.equal(eligible.canSubmit, false, "but cannot submit while the listing is gone");
  assert.equal(eligible.suspended, true);
  assert.equal(
    eligible.windowExpiresAt.getTime(),
    daysBeforeNow(10).getTime() + REVIEW_WINDOW_DAYS * DAY_MS,
    "the deadline is unchanged by the deletion"
  );
  assert.equal(
    codeOf(() => assertCanSubmit({ inspections, listingDeleted: true, now: NOW })),
    "LISTING_UNAVAILABLE"
  );
  assert.equal(
    codeOf(() => assertCanRevise({ review: { id: "review-1" }, listingDeleted: true })),
    "LISTING_UNAVAILABLE"
  );
});

test("an expired window reports expiry even while the listing is deleted", () => {
  const eligibility = evaluateEligibility({
    inspections: [inspection({ daysAgo: 45 })],
    listingDeleted: true,
    now: NOW,
  });
  assert.equal(eligibility.status, ELIGIBILITY.WINDOW_EXPIRED);
  assert.equal(eligibility.canSubmit, false);
});

test("revising a review that was never written is a 404", () => {
  assert.equal(codeOf(() => assertCanRevise({ review: null })), "REVIEW_NOT_FOUND");
});

test("a rating must be a whole number of stars from 1 to 5", () => {
  for (const rating of [0, 6, 4.5, "", null, undefined, "many"]) {
    assert.equal(
      codeOf(() => normalizeReviewInput({ rating, body: "x".repeat(25) })),
      "INVALID_RATING",
      `${rating} is not a rating`
    );
  }
  assert.equal(normalizeReviewInput({ rating: "4", body: "x".repeat(25) }).rating, 4);
});

test("a review body runs from 20 to 1000 characters and is stored trimmed", () => {
  assert.equal(codeOf(() => normalizeReviewInput({ rating: 5, body: "Too short" })), "INVALID_BODY");
  assert.equal(
    codeOf(() => normalizeReviewInput({ rating: 5, body: "x".repeat(1001) })),
    "INVALID_BODY"
  );

  const padded = `   ${"x".repeat(19)}   `;
  assert.equal(
    codeOf(() => normalizeReviewInput({ rating: 5, body: padded })),
    "INVALID_BODY",
    "whitespace does not count toward the minimum"
  );

  const { body } = normalizeReviewInput({ rating: 5, body: `  ${"x".repeat(30)}  ` });
  assert.equal(body, "x".repeat(30));
});
