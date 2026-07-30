export const INSPECTION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'RESCHEDULED',
  'CANCELLED',
  'COMPLETED',
];

export const INSPECTION_OUTCOMES = ['INTERESTED', 'NOT_INTERESTED', 'NO_SHOW'];
export const SEEKER_OUTCOMES = ['INTERESTED', 'NOT_INTERESTED'];
export const OWNER_OUTCOMES = ['NO_SHOW'];

export const TERMINAL_STATUSES = ['CANCELLED', 'COMPLETED'];

const TRANSITIONS: Record<string, Record<string, string[]>> = {
  OWNER: {
    PENDING: ['CONFIRMED', 'RESCHEDULED', 'CANCELLED'],
    RESCHEDULED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    CANCELLED: [],
    COMPLETED: [],
  },
  SEEKER: {
    PENDING: ['CANCELLED'],
    RESCHEDULED: ['CANCELLED'],
    CONFIRMED: ['CANCELLED'],
    CANCELLED: [],
    COMPLETED: [],
  },
};

function fail(message: string, statusCode: number, code?: string): Error {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

export function allowedTransitions(role: string, from: string): string[] {
  return TRANSITIONS[role]?.[from] ?? [];
}

export function assertStatusTransition({
  role,
  from,
  to,
  outcome,
}: {
  role: string;
  from: string;
  to: string;
  outcome?: string;
}): any {
  if (!INSPECTION_STATUSES.includes(to)) {
    throw fail(`Unknown inspection status "${to}".`, 400, 'INVALID_STATUS');
  }

  if (TERMINAL_STATUSES.includes(from)) {
    throw fail(
      `This inspection is already ${from.toLowerCase()} and can no longer change.`,
      409,
      'INSPECTION_TERMINAL'
    );
  }

  if (!allowedTransitions(role, from).includes(to)) {
    throw fail(
      `A ${role.toLowerCase()} cannot move an inspection from ${from} to ${to}.`,
      403,
      'TRANSITION_NOT_ALLOWED'
    );
  }

  if (to !== 'COMPLETED' && outcome) {
    throw fail(
      'An outcome can only be recorded when an inspection is completed.',
      400,
      'OUTCOME_NOT_APPLICABLE'
    );
  }

  const changes: any = { status: to };

  if (to === 'COMPLETED') {
    changes.completedAt = new Date();
    if (outcome) {
      if (!OWNER_OUTCOMES.includes(outcome)) {
        throw fail(
          'Only the seeker can record whether they are interested. An owner may report NO_SHOW.',
          403,
          'OUTCOME_NOT_ALLOWED'
        );
      }
      changes.outcome = outcome;
      changes.outcomeAt = new Date();
    }
  }

  return changes;
}

export function assertOutcome({
  role,
  status,
  currentOutcome,
  outcome,
}: {
  role: string;
  status: string;
  currentOutcome?: string | null;
  outcome: string;
}): any {
  if (role !== 'SEEKER') {
    throw fail(
      'Only the seeker who requested this inspection can record how it went.',
      403,
      'OUTCOME_NOT_ALLOWED'
    );
  }

  if (!SEEKER_OUTCOMES.includes(outcome)) {
    throw fail(
      `Outcome must be one of ${SEEKER_OUTCOMES.join(', ')}.`,
      400,
      'INVALID_OUTCOME'
    );
  }

  if (status !== 'COMPLETED') {
    throw fail(
      'You can only record how an inspection went once the owner marks it completed.',
      409,
      'INSPECTION_NOT_COMPLETED'
    );
  }

  if (currentOutcome === 'NO_SHOW') {
    throw fail(
      'The owner reported that this inspection did not take place.',
      409,
      'INSPECTION_NO_SHOW'
    );
  }

  if (currentOutcome) {
    throw fail(
      'You have already recorded how this inspection went.',
      409,
      'OUTCOME_ALREADY_RECORDED'
    );
  }

  return { outcome, outcomeAt: new Date() };
}
