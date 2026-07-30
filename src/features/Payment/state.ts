export const PAYMENT_STATUSES = ['PENDING', 'SUCCESSFUL', 'FAILED'];
export const TERMINAL_STATUSES = ['SUCCESSFUL', 'FAILED'];
export const PURCHASABLE_AVAILABILITY = ['AVAILABLE'];
export const PLATFORM_FEE_RATE = 0.015;

function fail(message: string, statusCode: number, code?: string): Error {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

export function priceBreakdown(price: any): { amount: number; platformFee: number; totalAmount: number } {
  const amount = Math.round(Number(price));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw fail('This listing has no valid price to charge.', 422, 'INVALID_PRICE');
  }
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  return { amount, platformFee, totalAmount: amount + platformFee };
}

export function buildReference(): string {
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return `SLX-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export function assertCanCheckout({ listing, buyerId, inspection }: { listing: any; buyerId: string; inspection: any }): boolean {
  if (!listing) {
    throw fail('Listing not found.', 404, 'LISTING_NOT_FOUND');
  }

  if (listing.approvalStatus !== 'APPROVED') {
    throw fail('This listing is not available for purchase.', 409, 'LISTING_NOT_APPROVED');
  }

  if (listing.ownerId === buyerId) {
    throw fail('You cannot buy your own listing.', 403, 'SELF_PURCHASE');
  }

  if (listing.availabilityStatus === 'SOLD') {
    throw fail('This property has already been taken.', 409, 'LISTING_SOLD');
  }

  if (!PURCHASABLE_AVAILABILITY.includes(listing.availabilityStatus)) {
    throw fail(
      'Another buyer is currently completing checkout on this property.',
      409,
      'LISTING_RESERVED'
    );
  }

  if (!inspection) {
    throw fail(
      'Complete an inspection for this property before paying.',
      403,
      'INSPECTION_REQUIRED'
    );
  }

  if (inspection.status !== 'COMPLETED' || inspection.outcome !== 'INTERESTED') {
    throw fail(
      'You can pay once your inspection is complete and you have confirmed you are interested.',
      403,
      'INSPECTION_NOT_INTERESTED'
    );
  }

  return true;
}

export function resolveSettlement({ payment, outcome, reason }: { payment: any; outcome: string; reason?: string }): {
  alreadySettled: boolean;
  changes: any;
  availabilityStatus: string | null;
} {
  if (!payment) {
    throw fail('Payment not found.', 404, 'PAYMENT_NOT_FOUND');
  }

  if (!['SUCCESS', 'FAILURE'].includes(outcome)) {
    throw fail('Outcome must be SUCCESS or FAILURE.', 400, 'INVALID_OUTCOME');
  }

  const target = outcome === 'SUCCESS' ? 'SUCCESSFUL' : 'FAILED';

  if (payment.status === target) {
    return { alreadySettled: true, changes: null, availabilityStatus: null };
  }

  if (TERMINAL_STATUSES.includes(payment.status)) {
    throw fail(
      `This payment already ${payment.status === 'SUCCESSFUL' ? 'succeeded' : 'failed'} and cannot be changed.`,
      409,
      'PAYMENT_ALREADY_SETTLED'
    );
  }

  if (target === 'SUCCESSFUL') {
    return {
      alreadySettled: false,
      changes: { status: 'SUCCESSFUL', paidAt: new Date(), failureReason: null },
      availabilityStatus: 'SOLD',
    };
  }

  return {
    alreadySettled: false,
    changes: {
      status: 'FAILED',
      failureReason: reason || 'Payment was declined by the provider.',
    },
    availabilityStatus: 'AVAILABLE',
  };
}
