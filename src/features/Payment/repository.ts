import { Op, fn, col } from 'sequelize';
import sequelize from '../../config/dbconfig';
import { Payment } from './model';
import { Listing, Notification } from '../Listing/model';
import { User } from '../Authentication/model';
import { Inspection } from '../Inspection/model';
import {
  priceBreakdown,
  buildReference,
  assertCanCheckout,
  resolveSettlement,
} from './state';

const LISTING_SUMMARY = ['id', 'title', 'location', 'city', 'state', 'images', 'price', 'currency', 'intent'];
const PARTY_SUMMARY = ['id', 'firstName', 'surname', 'email', 'phoneNumber'];

export class PaymentRepository {
  async initiateCheckout(buyerId: string, listingId: string) {
    return sequelize.transaction(async (transaction) => {
      const listing: any = await Listing.findByPk(listingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const existing = await Payment.findOne({
        where: { listingId, buyerId, status: 'PENDING' },
        transaction,
      });
      if (existing) return existing;

      const inspection = await Inspection.findOne({
        where: { propertyId: listingId, seekerId: buyerId, status: 'COMPLETED' },
        order: [['completedAt', 'DESC']],
        transaction,
      });

      assertCanCheckout({ listing, buyerId, inspection });

      const { amount, platformFee, totalAmount } = priceBreakdown(listing.price);

      const payment: any = await Payment.create(
        {
          listingId,
          buyerId,
          sellerId: listing.ownerId,
          inspectionId: (inspection as any).id,
          amount,
          platformFee,
          totalAmount,
          currency: listing.currency || 'NGN',
          provider: 'MOCK',
          reference: buildReference(),
          status: 'PENDING',
          metadata: { listingTitle: listing.title, intent: listing.intent },
        },
        { transaction }
      );

      await listing.update({ availabilityStatus: 'RESERVED' }, { transaction });

      return payment;
    });
  }

  async settleCheckout(reference: string, buyerId: string, outcome: string, reason?: string) {
    return sequelize.transaction(async (transaction) => {
      const payment: any = await Payment.findOne({
        where: { reference },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!payment) {
        const error = new Error('Payment not found.') as any;
        error.statusCode = 404;
        throw error;
      }

      if (payment.buyerId !== buyerId) {
        const error = new Error('This checkout belongs to another buyer.') as any;
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

      const listing: any = await Listing.findByPk(payment.listingId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (listing) {
        await listing.update({ availabilityStatus }, { transaction });
      }

      if (payment.status === 'SUCCESSFUL') {
        await this.onSaleSettled({ payment, listing, transaction });
      }

      return payment;
    });
  }

  async onSaleSettled({ payment, listing, transaction }: { payment: any; listing: any; transaction: any }) {
    const title = listing?.title || 'the property';

    await Notification.create(
      {
        userId: payment.sellerId,
        title: 'Your property has been paid for',
        message: `A buyer completed payment for "${title}". It is now marked as taken.`,
        type: 'PAYMENT_RECEIVED',
        link: '/owner/listings',
        metadata: { listingId: payment.listingId, paymentId: payment.id, reference: payment.reference },
      },
      { transaction }
    );

    const orphaned = await Inspection.findAll({
      where: {
        propertyId: payment.listingId,
        seekerId: { [Op.ne]: payment.buyerId },
        status: { [Op.in]: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
      },
      transaction,
    });

    for (const inspection of (orphaned as any[])) {
      await inspection.update({ status: 'CANCELLED' }, { transaction });
      await Notification.create(
        {
          userId: inspection.seekerId,
          title: 'Property no longer available',
          message: `"${title}" has been taken, so your inspection request was cancelled.`,
          type: 'INSPECTION_CANCELLED',
          link: '/profile/inquiries',
          metadata: { inspectionId: inspection.id, listingId: payment.listingId },
        },
        { transaction }
      );
    }
  }

  async getBuyerPayments(buyerId: string, pagination: any, status?: string) {
    return Payment.findAndCountAll({
      where: { buyerId, ...(status ? { status } : {}) },
      include: [
        { model: Listing, as: 'listing', attributes: LISTING_SUMMARY },
        { model: User, as: 'seller', attributes: PARTY_SUMMARY },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  }

  async getSellerSales(sellerId: string, pagination: any, status = 'SUCCESSFUL') {
    return Payment.findAndCountAll({
      where: { sellerId, ...(status && status !== 'ALL' ? { status } : {}) },
      include: [
        { model: Listing, as: 'listing', attributes: LISTING_SUMMARY },
        { model: User, as: 'buyer', attributes: PARTY_SUMMARY },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
  }

  async getAllSales(pagination: any, filters: any = {}) {
    const where: any = {};
    const status = filters.status && filters.status !== 'ALL' ? filters.status : 'SUCCESSFUL';
    if (status) where.status = status;

    const listingWhere: any = {};
    if (filters.intent && filters.intent !== 'ALL') {
      listingWhere.intent = String(filters.intent).toUpperCase();
    }

    const include: any[] = [
      {
        model: Listing,
        as: 'listing',
        attributes: [...LISTING_SUMMARY, 'propertyType', 'availabilityStatus'],
        ...(Object.keys(listingWhere).length ? { where: listingWhere } : {}),
      },
      { model: User, as: 'buyer', attributes: PARTY_SUMMARY },
      { model: User, as: 'seller', attributes: [...PARTY_SUMMARY, 'role', 'kycStatus'] },
    ];

    if (filters.q && filters.q.trim()) {
      const term = `%${filters.q.trim()}%`;
      where[Op.or] = [
        { reference: { [Op.iLike]: term } },
        { '$listing.title$': { [Op.iLike]: term } },
        { '$buyer.email$': { [Op.iLike]: term } },
        { '$seller.email$': { [Op.iLike]: term } },
      ];
    }

    return Payment.findAndCountAll({
      where,
      include,
      order: [['paidAt', 'DESC'], ['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
      subQuery: false,
    });
  }

  async getSalesSummary(filters: { sellerId?: string; buyerId?: string } = {}) {
    const where: any = { status: 'SUCCESSFUL' };
    if (filters.sellerId) where.sellerId = filters.sellerId;
    if (filters.buyerId) where.buyerId = filters.buyerId;

    const row = await Payment.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'successfulDeals'],
        [fn('COALESCE', fn('SUM', col('amount')), 0), 'grossVolume'],
        [fn('COALESCE', fn('SUM', col('platformFee')), 0), 'platformFees'],
        [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'totalCollected'],
      ],
      raw: true,
    });

    return {
      successfulDeals: Number((row as any)?.successfulDeals || 0),
      grossVolume: Number((row as any)?.grossVolume || 0),
      platformFees: Number((row as any)?.platformFees || 0),
      totalCollected: Number((row as any)?.totalCollected || 0),
    };
  }

  async getListingPurchaseState(listingId: string, viewerId?: string) {
    if (!viewerId) return { canPay: false, reason: 'AUTH_REQUIRED', payment: null };

    const [inspection, payment]: [any, any] = await Promise.all([
      Inspection.findOne({
        where: { propertyId: listingId, seekerId: viewerId, status: 'COMPLETED' },
        order: [['completedAt', 'DESC']],
      }),
      Payment.findOne({
        where: { listingId, buyerId: viewerId, status: { [Op.in]: ['PENDING', 'SUCCESSFUL'] } },
        order: [['createdAt', 'DESC']],
      }),
    ]);

    if (payment?.status === 'SUCCESSFUL') {
      return { canPay: false, reason: 'ALREADY_PURCHASED', payment };
    }

    const interested = inspection?.status === 'COMPLETED' && inspection.outcome === 'INTERESTED';
    return {
      canPay: interested,
      reason: interested ? null : inspection ? 'INSPECTION_NOT_INTERESTED' : 'INSPECTION_REQUIRED',
      payment,
    };
  }
}

export default new PaymentRepository();
