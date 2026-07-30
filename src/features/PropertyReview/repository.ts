import { Op, fn, col } from 'sequelize';
import { PropertyReview } from './model';
import { Listing, Notification } from '../Listing/model';
import { Inspection } from '../Inspection/model';
import { User } from '../Authentication/model';
import {
  QUALIFYING_OUTCOMES,
  evaluateEligibility,
  assertCanSubmit,
  assertCanRevise,
  normalizeReviewInput,
} from './state';

const AUTHOR_ATTRIBUTES = ['id', 'firstName', 'surname', 'profilePicture'];

function notFound(message: string): Error {
  const error = new Error(message) as any;
  error.statusCode = 404;
  return error;
}

export function serializeReview(review: any) {
  if (!review) return null;
  const plain = typeof review.get === 'function' ? review.get({ plain: true }) : review;
  return {
    id: plain.id,
    propertyId: plain.propertyId,
    rating: plain.rating,
    body: plain.body,
    publishedAt: plain.publishedAt,
    editedAt: plain.editedAt,
    verifiedInspection: true,
    inspectionId: plain.inspectionId ?? null,
    author: plain.seeker
      ? {
          id: plain.seeker.id,
          firstName: plain.seeker.firstName,
          surname: plain.seeker.surname,
          profilePicture: plain.seeker.profilePicture,
        }
      : { id: plain.seekerId },
    property: plain.property
      ? {
          id: plain.property.id,
          title: plain.property.title,
          city: plain.property.city,
          state: plain.property.state,
          images: plain.property.images,
        }
      : undefined,
  };
}

export function emptySummary() {
  return {
    reviewCount: 0,
    averageRating: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export class PropertyReviewRepository {
  async findListing(propertyId: string) {
    const listing = await Listing.findByPk(propertyId, { paranoid: false });
    if (!listing) throw notFound('Property not found.');
    return listing;
  }

  async findPublicListing(propertyId: string) {
    const listing = await Listing.findOne({
      where: { id: propertyId, approvalStatus: 'APPROVED' },
    });
    if (!listing) throw notFound('Property not found.');
    return listing;
  }

  async seekerInspections(propertyId: string, seekerId: string) {
    return Inspection.findAll({
      where: {
        propertyId,
        seekerId,
        outcome: { [Op.in]: QUALIFYING_OUTCOMES },
      },
      attributes: ['id', 'status', 'outcome', 'completedAt', 'outcomeAt'],
      order: [['outcomeAt', 'DESC']],
    });
  }

  async findSeekerReview(propertyId: string, seekerId: string) {
    return PropertyReview.findOne({
      where: { propertyId, seekerId },
      include: [{ model: User, as: 'seeker', attributes: AUTHOR_ATTRIBUTES }],
    });
  }

  async getEligibility(propertyId: string, seekerId: string) {
    const listing = await this.findListing(propertyId);
    const [inspections, review] = await Promise.all([
      this.seekerInspections(propertyId, seekerId),
      this.findSeekerReview(propertyId, seekerId),
    ]);

    const eligibility = evaluateEligibility({
      inspections,
      review,
      listingDeleted: Boolean((listing as any).deletedAt),
    });

    return { ...eligibility, review: serializeReview(review) };
  }

  async submitReview(propertyId: string, seekerId: string, input: any) {
    const { rating, body } = normalizeReviewInput(input);
    const listing: any = await this.findListing(propertyId);
    const [inspections, existing] = await Promise.all([
      this.seekerInspections(propertyId, seekerId),
      this.findSeekerReview(propertyId, seekerId),
    ]);

    const eligibility = assertCanSubmit({
      inspections,
      review: existing,
      listingDeleted: Boolean(listing.deletedAt),
    });

    let review: any;
    try {
      review = await PropertyReview.create({
        propertyId,
        seekerId,
        rating,
        body,
        inspectionId: eligibility.qualifyingInspectionId,
        publishedAt: new Date(),
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const conflict = new Error(
          'You have already reviewed this property. Edit your review instead.'
        ) as any;
        conflict.statusCode = 409;
        conflict.code = 'REVIEW_ALREADY_EXISTS';
        throw conflict;
      }
      throw error;
    }

    await Notification.create({
      userId: listing.ownerId,
      title: 'New review on your listing',
      message: `A seeker who inspected "${listing.title}" left a ${rating}-star review.`,
      type: 'PROPERTY_REVIEW_PUBLISHED',
      link: `/owner/listings/${listing.id}`,
      metadata: { listingId: listing.id, reviewId: review.id, rating },
    });

    return this.findSeekerReview(propertyId, seekerId);
  }

  async reviseReview(propertyId: string, seekerId: string, input: any) {
    const { rating, body } = normalizeReviewInput(input);
    const listing: any = await this.findListing(propertyId);
    const review: any = await this.findSeekerReview(propertyId, seekerId);

    assertCanRevise({ review, listingDeleted: Boolean(listing.deletedAt) });

    review.set({ rating, body, editedAt: new Date() });
    await review.save();

    return review;
  }

  async listReviews(propertyId: string, pagination: any, sort = 'RECENT') {
    const order: any =
      sort === 'HIGHEST'
        ? [['rating', 'DESC'], ['publishedAt', 'DESC']]
        : sort === 'LOWEST'
          ? [['rating', 'ASC'], ['publishedAt', 'DESC']]
          : [['publishedAt', 'DESC']];

    const { count, rows } = await PropertyReview.findAndCountAll({
      where: { propertyId },
      include: [{ model: User, as: 'seeker', attributes: AUTHOR_ATTRIBUTES }],
      order,
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });

    return { count, rows: rows.map(serializeReview) };
  }

  async summaryFor(propertyId: string) {
    const summaries = await this.summariesFor([propertyId]);
    return summaries[propertyId] || emptySummary();
  }

  async summariesFor(propertyIds: string[] = []) {
    const ids = [...new Set(propertyIds.filter(Boolean))];
    if (!ids.length) return {};

    const rows = await PropertyReview.findAll({
      where: { propertyId: { [Op.in]: ids } },
      attributes: ['propertyId', 'rating', [fn('COUNT', col('id')), 'count']],
      group: ['propertyId', 'rating'],
      raw: true,
    });

    const summaries: Record<string, any> = {};
    for (const row of rows as any[]) {
      const summary = (summaries[row.propertyId] ||= emptySummary());
      const n = Number(row.count) || 0;
      summary.distribution[row.rating] = n;
      summary.reviewCount += n;
      summary.averageRating = (summary.averageRating || 0) + row.rating * n;
    }

    for (const summary of Object.values(summaries)) {
      summary.averageRating = summary.reviewCount
        ? Math.round((summary.averageRating / summary.reviewCount) * 10) / 10
        : null;
    }

    for (const id of ids) {
      if (!summaries[id]) summaries[id] = emptySummary();
    }

    return summaries;
  }

  async listSeekerReviews(seekerId: string, pagination: any) {
    const { count, rows } = await PropertyReview.findAndCountAll({
      where: { seekerId },
      include: [
        { model: User, as: 'seeker', attributes: AUTHOR_ATTRIBUTES },
        {
          model: Listing,
          as: 'property',
          attributes: ['id', 'title', 'city', 'state', 'images'],
          paranoid: false,
        },
      ],
      order: [['publishedAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });

    return { count, rows: rows.map(serializeReview) };
  }

  async listPendingReviews(seekerId: string) {
    const inspections = await Inspection.findAll({
      where: { seekerId, outcome: { [Op.in]: QUALIFYING_OUTCOMES } },
      attributes: ['id', 'propertyId', 'status', 'outcome', 'completedAt', 'outcomeAt'],
    });
    if (!inspections.length) return [];

    const propertyIds = [...new Set((inspections as any[]).map((row) => row.propertyId))];

    const [reviewed, listings] = await Promise.all([
      PropertyReview.findAll({
        where: { seekerId, propertyId: { [Op.in]: propertyIds } },
        attributes: ['propertyId'],
        raw: true,
      }),
      Listing.findAll({
        where: { id: { [Op.in]: propertyIds } },
        attributes: ['id', 'title', 'city', 'state', 'images', 'approvalStatus'],
      }),
    ]);

    const reviewedIds = new Set((reviewed as any[]).map((row) => row.propertyId));
    const listingById = new Map((listings as any[]).map((listing) => [listing.id, listing]));

    const pending: any[] = [];
    for (const propertyId of propertyIds) {
      if (reviewedIds.has(propertyId)) continue;
      const listing = listingById.get(propertyId);
      if (!listing || listing.approvalStatus !== 'APPROVED') continue;

      const eligibility = evaluateEligibility({
        inspections: (inspections as any[]).filter((row) => row.propertyId === propertyId),
      });
      if (!eligibility.canSubmit) continue;

      pending.push({
        propertyId,
        property: {
          id: listing.id,
          title: listing.title,
          city: listing.city,
          state: listing.state,
          images: listing.images,
        },
        inspectedAt: eligibility.inspectedAt,
        windowExpiresAt: eligibility.windowExpiresAt,
      });
    }

    return pending.sort((a, b) => a.windowExpiresAt - b.windowExpiresAt);
  }
}

export default new PropertyReviewRepository();
