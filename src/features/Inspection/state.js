const INSPECTION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
];

// NO_SHOW is the Listing Owner's observation that the seeker never arrived.
// INTERESTED/NOT_INTERESTED are the seeker's own verdict and only the seeker
// may record them, so an owner can never speak for a seeker's intent.
const INSPECTION_OUTCOMES = ["INTERESTED", "NOT_INTERESTED", "NO_SHOW"];
const SEEKER_OUTCOMES = ["INTERESTED", "NOT_INTERESTED"];
const OWNER_OUTCOMES = ["NO_SHOW"];

const TERMINAL_STATUSES = ["CANCELLED", "COMPLETED"];

// An inspection only reaches COMPLETED from CONFIRMED: a visit that was never
// agreed on cannot have happened.
const TRANSITIONS = {
  OWNER: {
    PENDING: ["CONFIRMED", "RESCHEDULED", "CANCELLED"],
    RESCHEDULED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    CANCELLED: [],
    COMPLETED: [],
  },
  SEEKER: {
    PENDING: ["CANCELLED"],
    RESCHEDULED: ["CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    CANCELLED: [],
    COMPLETED: [],
  },
};

function fail(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function allowedTransitions(role, from) {
  return TRANSITIONS[role]?.[from] ?? [];
}

/**
 * Validate a status change. Returns the fields to persist so the caller never
 * has to remember that COMPLETED also stamps completedAt.
 */
function assertStatusTransition({ role, from, to, outcome }) {
  if (!INSPECTION_STATUSES.includes(to)) {
    throw fail(`Unknown inspection status "${to}".`, 400, "INVALID_STATUS");
  }

  if (TERMINAL_STATUSES.includes(from)) {
    throw fail(
      `This inspection is already ${from.toLowerCase()} and can no longer change.`,
      409,
      "INSPECTION_TERMINAL"
    );
  }

  if (!allowedTransitions(role, from).includes(to)) {
    throw fail(
      `A ${role.toLowerCase()} cannot move an inspection from ${from} to ${to}.`,
      403,
      "TRANSITION_NOT_ALLOWED"
    );
  }

  if (to !== "COMPLETED" && outcome) {
    throw fail(
      "An outcome can only be recorded when an inspection is completed.",
      400,
      "OUTCOME_NOT_APPLICABLE"
    );
  }

  const changes = { status: to };

  if (to === "COMPLETED") {
    changes.completedAt = new Date();
    if (outcome) {
      if (!OWNER_OUTCOMES.includes(outcome)) {
        throw fail(
          "Only the seeker can record whether they are interested. An owner may report NO_SHOW.",
          403,
          "OUTCOME_NOT_ALLOWED"
        );
      }
      changes.outcome = outcome;
      changes.outcomeAt = new Date();
    }
  }

  return changes;
}

/**
 * Validate the seeker's post-visit verdict. Returns the fields to persist.
 */
function assertOutcome({ role, status, currentOutcome, outcome }) {
  if (role !== "SEEKER") {
    throw fail(
      "Only the seeker who requested this inspection can record how it went.",
      403,
      "OUTCOME_NOT_ALLOWED"
    );
  }

  if (!SEEKER_OUTCOMES.includes(outcome)) {
    throw fail(
      `Outcome must be one of ${SEEKER_OUTCOMES.join(", ")}.`,
      400,
      "INVALID_OUTCOME"
    );
  }

  if (status !== "COMPLETED") {
    throw fail(
      "You can only record how an inspection went once the owner marks it completed.",
      409,
      "INSPECTION_NOT_COMPLETED"
    );
  }

  if (currentOutcome === "NO_SHOW") {
    throw fail(
      "The owner reported that this inspection did not take place.",
      409,
      "INSPECTION_NO_SHOW"
    );
  }

  if (currentOutcome) {
    throw fail(
      "You have already recorded how this inspection went.",
      409,
      "OUTCOME_ALREADY_RECORDED"
    );
  }

  return { outcome, outcomeAt: new Date() };
}

module.exports = {
  INSPECTION_STATUSES,
  INSPECTION_OUTCOMES,
  SEEKER_OUTCOMES,
  OWNER_OUTCOMES,
  TERMINAL_STATUSES,
  allowedTransitions,
  assertStatusTransition,
  assertOutcome,
};
