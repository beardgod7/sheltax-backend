export const REVIEW_WINDOW_DAYS = 30;
export const REVIEW_WINDOW_MS = REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const BODY_MIN = 20;
export const BODY_MAX = 1000;

export const QUALIFYING_OUTCOMES = ['INTERESTED', 'NOT_INTERESTED'];

export const ELIGIBILITY = {
  ELIGIBLE: 'ELIGIBLE',
  ALREADY_REVIEWED: 'ALREADY_REVIEWED',
  WINDOW_EXPIRED: 'WINDOW_EXPIRED',
  NO_QUALIFYING_INSPECTION: 'NO_QUALIFYING_INSPECTION',
};

function fail(message: string, statusCode: number, code?: string): Error {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function toTime(value: any): number | null {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function qualifiedAt(inspection: any): number | null {
  if (!inspection) return null;
  if (!QUALIFYING_OUTCOMES.includes(inspection.outcome)) return null;
  if (inspection.status && inspection.status !== 'COMPLETED') return null;
  return toTime(inspection.outcomeAt) ?? toTime(inspection.completedAt);
}

export function latestQualifyingInspection(inspections: any[] = []): { inspection: any; qualifiedAt: Date } | null {
  let latest: any = null;
  let latestAt: number | null = null;

  for (const inspection of inspections) {
    const at = qualifiedAt(inspection);
    if (at === null) continue;
    if (latestAt === null || at > latestAt) {
      latest = inspection;
      latestAt = at;
    }
  }

  return latest ? { inspection: latest, qualifiedAt: new Date(latestAt!) } : null;
}

export function reviewWindow(inspections: any[] = []): { inspectionId: any; inspectedAt: Date; expiresAt: Date } | null {
  const latest = latestQualifyingInspection(inspections);
  if (!latest) return null;

  return {
    inspectionId: latest.inspection.id ?? null,
    inspectedAt: latest.qualifiedAt,
    expiresAt: new Date(latest.qualifiedAt.getTime() + REVIEW_WINDOW_MS),
  };
}

export function evaluateEligibility({
  inspections = [],
  review = null,
  listingDeleted = false,
  now = new Date(),
}: {
  inspections?: any[];
  review?: any;
  listingDeleted?: boolean;
  now?: Date;
} = {}): any {
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
    canRevise: Boolean(review) && !listingDeleted,
    suspended: Boolean(listingDeleted),
    windowExpiresAt: window ? window.expiresAt : null,
    inspectedAt: window ? window.inspectedAt : null,
    qualifyingInspectionId: window ? window.inspectionId : null,
  };
}

export function assertCanSubmit(input: any): any {
  const eligibility = evaluateEligibility(input);

  if (eligibility.status === ELIGIBILITY.ALREADY_REVIEWED) {
    throw fail(
      'You have already reviewed this property. Edit your review instead.',
      409,
      'REVIEW_ALREADY_EXISTS'
    );
  }

  if (eligibility.status === ELIGIBILITY.NO_QUALIFYING_INSPECTION) {
    throw fail(
      'Only seekers who completed an inspection of this property can review it.',
      403,
      'REVIEW_NOT_ELIGIBLE'
    );
  }

  if (eligibility.status === ELIGIBILITY.WINDOW_EXPIRED) {
    throw fail(
      `Reviews close ${REVIEW_WINDOW_DAYS} days after an inspection. Book another inspection to review this property.`,
      409,
      'REVIEW_WINDOW_EXPIRED'
    );
  }

  if (eligibility.suspended) {
    throw fail(
      'This property is no longer listed, so reviews are closed.',
      409,
      'LISTING_UNAVAILABLE'
    );
  }

  return eligibility;
}

export function assertCanRevise({ review, listingDeleted = false }: { review?: any; listingDeleted?: boolean } = {}): boolean {
  if (!review) {
    throw fail('You have not reviewed this property yet.', 404, 'REVIEW_NOT_FOUND');
  }

  if (listingDeleted) {
    throw fail(
      'This property is no longer listed, so reviews are closed.',
      409,
      'LISTING_UNAVAILABLE'
    );
  }

  return true;
}

export function normalizeReviewInput({ rating, body }: { rating?: any; body?: any } = {}): { rating: number; body: string } {
  const score = typeof rating === 'number' ? rating : Number.parseInt(rating, 10);
  if (!Number.isInteger(score) || score < RATING_MIN || score > RATING_MAX) {
    throw fail(
      `Give the property a rating from ${RATING_MIN} to ${RATING_MAX} stars.`,
      400,
      'INVALID_RATING'
    );
  }

  const text = typeof body === 'string' ? body.trim() : '';
  if (text.length < BODY_MIN) {
    throw fail(
      `Tell other seekers what the visit was like — at least ${BODY_MIN} characters.`,
      400,
      'INVALID_BODY'
    );
  }
  if (text.length > BODY_MAX) {
    throw fail(
      `Keep your review under ${BODY_MAX} characters.`,
      400,
      'INVALID_BODY'
    );
  }

  return { rating: score, body: text };
}
