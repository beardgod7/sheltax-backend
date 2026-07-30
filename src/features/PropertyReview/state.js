// The rules that decide who may write a Property Review, and what a valid one
// looks like. Kept free of Sequelize so the policy can be read — and tested —
// without a database.

const REVIEW_WINDOW_DAYS = 30;
const REVIEW_WINDOW_MS = REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const RATING_MIN = 1;
const RATING_MAX = 5;
const BODY_MIN = 20;
const BODY_MAX = 1000;

// A no-show never grants eligibility: the seeker never saw the property, so
// they have nothing to account for.
const QUALIFYING_OUTCOMES = ["INTERESTED", "NOT_INTERESTED"];

const ELIGIBILITY = {
  ELIGIBLE: "ELIGIBLE",
  ALREADY_REVIEWED: "ALREADY_REVIEWED",
  WINDOW_EXPIRED: "WINDOW_EXPIRED",
  NO_QUALIFYING_INSPECTION: "NO_QUALIFYING_INSPECTION",
};

function fail(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function toTime(value) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

/**
 * The moment an inspection became reviewable: when the seeker recorded their
 * verdict, not when the owner closed the visit. Older rows that predate
 * outcomeAt fall back to completedAt.
 */
function qualifiedAt(inspection) {
  if (!inspection) return null;
  if (!QUALIFYING_OUTCOMES.includes(inspection.outcome)) return null;
  if (inspection.status && inspection.status !== "COMPLETED") return null;
  return toTime(inspection.outcomeAt) ?? toTime(inspection.completedAt);
}

/**
 * The seeker's most recent qualifying inspection of a listing. Every later
 * qualifying visit refreshes the window, so only the latest one matters.
 */
function latestQualifyingInspection(inspections = []) {
  let latest = null;
  let latestAt = null;

  for (const inspection of inspections) {
    const at = qualifiedAt(inspection);
    if (at === null) continue;
    if (latestAt === null || at > latestAt) {
      latest = inspection;
      latestAt = at;
    }
  }

  return latest ? { inspection: latest, qualifiedAt: new Date(latestAt) } : null;
}

/**
 * The open review window for a seeker on a listing, or null if they never
 * completed a qualifying inspection.
 */
function reviewWindow(inspections = []) {
  const latest = latestQualifyingInspection(inspections);
  if (!latest) return null;

  return {
    inspectionId: latest.inspection.id ?? null,
    inspectedAt: latest.qualifiedAt,
    expiresAt: new Date(latest.qualifiedAt.getTime() + REVIEW_WINDOW_MS),
  };
}

/**
 * What a seeker may do about reviewing a listing right now.
 *
 * `suspended` is deletion of the listing: submission pauses, the window does
 * not. A seeker whose listing is deleted for the rest of their window loses
 * the slot, which is deliberate — the account is of a property no one can
 * still see. Reservation and sale are not suspensions; a seeker may review a
 * property that was taken out from under them.
 */
function evaluateEligibility({ inspections = [], review = null, listingDeleted = false, now = new Date() } = {}) {
  const window = reviewWindow(inspections);
  const nowMs = toTime(now) ?? Date.now();
  const expired = window ? nowMs > window.expiresAt.getTime() : false;

  const status = review
    ? ELIGIBILITY.ALREADY_REVIEWED
    : !window
      ? ELIGIBILITY.NO_QUALIFYING_INSPECTION
      : expired
        ? ELIGIBILITY.WINDOW_EXPIRED
        : ELIGIBILITY.ELIGIBLE;

  return {
    status,
    canSubmit: status === ELIGIBILITY.ELIGIBLE && !listingDeleted,
    // A published review outlives its window: later visits open no second
    // slot, but the account the seeker already gave stays theirs to correct.
    canRevise: Boolean(review) && !listingDeleted,
    suspended: Boolean(listingDeleted),
    windowExpiresAt: window ? window.expiresAt : null,
    inspectedAt: window ? window.inspectedAt : null,
    qualifyingInspectionId: window ? window.inspectionId : null,
  };
}

/**
 * Guard a submission. Returns the eligibility so the caller can persist the
 * inspection that granted it as the review's provenance.
 */
function assertCanSubmit(input) {
  const eligibility = evaluateEligibility(input);

  if (eligibility.status === ELIGIBILITY.ALREADY_REVIEWED) {
    throw fail(
      "You have already reviewed this property. Edit your review instead.",
      409,
      "REVIEW_ALREADY_EXISTS"
    );
  }

  if (eligibility.status === ELIGIBILITY.NO_QUALIFYING_INSPECTION) {
    throw fail(
      "Only seekers who completed an inspection of this property can review it.",
      403,
      "REVIEW_NOT_ELIGIBLE"
    );
  }

  if (eligibility.status === ELIGIBILITY.WINDOW_EXPIRED) {
    throw fail(
      `Reviews close ${REVIEW_WINDOW_DAYS} days after an inspection. Book another inspection to review this property.`,
      409,
      "REVIEW_WINDOW_EXPIRED"
    );
  }

  if (eligibility.suspended) {
    throw fail(
      "This property is no longer listed, so reviews are closed.",
      409,
      "LISTING_UNAVAILABLE"
    );
  }

  return eligibility;
}

/** Guard a revision of an already published review. */
function assertCanRevise({ review, listingDeleted = false } = {}) {
  if (!review) {
    throw fail("You have not reviewed this property yet.", 404, "REVIEW_NOT_FOUND");
  }

  if (listingDeleted) {
    throw fail(
      "This property is no longer listed, so reviews are closed.",
      409,
      "LISTING_UNAVAILABLE"
    );
  }

  return true;
}

/**
 * Validate and normalize what the seeker actually wrote. Returns the fields to
 * persist, so no caller has to remember that the body is stored trimmed.
 */
function normalizeReviewInput({ rating, body } = {}) {
  const score = typeof rating === "number" ? rating : Number.parseInt(rating, 10);
  if (!Number.isInteger(score) || score < RATING_MIN || score > RATING_MAX) {
    throw fail(
      `Give the property a rating from ${RATING_MIN} to ${RATING_MAX} stars.`,
      400,
      "INVALID_RATING"
    );
  }

  const text = typeof body === "string" ? body.trim() : "";
  if (text.length < BODY_MIN) {
    throw fail(
      `Tell other seekers what the visit was like — at least ${BODY_MIN} characters.`,
      400,
      "INVALID_BODY"
    );
  }
  if (text.length > BODY_MAX) {
    throw fail(
      `Keep your review under ${BODY_MAX} characters.`,
      400,
      "INVALID_BODY"
    );
  }

  return { rating: score, body: text };
}

module.exports = {
  REVIEW_WINDOW_DAYS,
  REVIEW_WINDOW_MS,
  RATING_MIN,
  RATING_MAX,
  BODY_MIN,
  BODY_MAX,
  QUALIFYING_OUTCOMES,
  ELIGIBILITY,
  qualifiedAt,
  latestQualifyingInspection,
  reviewWindow,
  evaluateEligibility,
  assertCanSubmit,
  assertCanRevise,
  normalizeReviewInput,
};
