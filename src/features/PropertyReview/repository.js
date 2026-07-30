const { Op, fn, col } = require("sequelize");
const { PropertyReview } = require("./model");
const { Listing, Notification } = require("../Listing/model");
const { Inspection } = require("../Inspection/model");
const { User } = require("../Authentication/model");
const {
  QUALIFYING_OUTCOMES,
  evaluateEligibility,
  assertCanSubmit,
  assertCanRevise,
  normalizeReviewInput,
} = require("./state");

const AUTHOR_ATTRIBUTES = ["id", "firstName", "surname", "profilePicture"];

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

/**
 * Every Property Review is backed by a completed inspection, so the badge is a
 * property of the record rather than something a caller has to prove.
 */
function serializeReview(review) {
  if (!review) return null;
  const plain = typeof review.get === "function" ? review.get({ plain: true }) : review;
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

function emptySummary() {
  return {
    reviewCount: 0,
    averageRating: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

class PropertyReviewRepository {
  /**
   * Load a listing even when it has been deleted: deletion suspends review
   * submission, it does not make the listing unknown.
   */
  async findListing(propertyId) {
    const listing = await Listing.findByPk(propertyId, { paranoid: false });
    if (!listing) throw notFound("Property not found.");
    return listing;
  }

  async findPublicListing(propertyId) {
    const listing = await Listing.findOne({
      where: { id: propertyId, approvalStatus: "APPROVED" },
    });
    if (!listing) throw notFound("Property not found.");
    return listing;
  }

  /** Only the seeker's own inspections of this listing bear on eligibility. */
  async seekerInspections(propertyId, seekerId) {
    return Inspection.findAll({
      where: {
        propertyId,
        seekerId,
        outcome: { [Op.in]: QUALIFYING_OUTCOMES },
      },
      attributes: ["id", "status", "outcome", "completedAt", "outcomeAt"],
      order: [["outcomeAt", "DESC"]],
    });
  }

  async findSeekerReview(propertyId, seekerId) {
    return PropertyReview.findOne({
      where: { propertyId, seekerId },
      include: [{ model: User, as: "seeker", attributes: AUTHOR_ATTRIBUTES }],
    });
  }

  async getEligibility(propertyId, seekerId) {
    const listing = await this.findListing(propertyId);
    const [inspections, review] = await Promise.all([
      this.seekerInspections(propertyId, seekerId),
      this.findSeekerReview(propertyId, seekerId),
    ]);

    const eligibility = evaluateEligibility({
      inspections,
      review,
      listingDeleted: Boolean(listing.deletedAt),
    });

    return { ...eligibility, review: serializeReview(review) };
  }

  async submitReview(propertyId, seekerId, input) {
    const { rating, body } = normalizeReviewInput(input);
    const listing = await this.findListing(propertyId);
    const [inspections, existing] = await Promise.all([
      this.seekerInspections(propertyId, seekerId),
      this.findSeekerReview(propertyId, seekerId),
    ]);

    const eligibility = assertCanSubmit({
      inspections,
      review: existing,
      listingDeleted: Boolean(listing.deletedAt),
    });

    let review;
    try {
      review = await PropertyReview.create({
        propertyId,
        seekerId,
        rating,
        body,
        inspectionId: eligibility.qualifyingInspectionId,
        publishedAt: new Date(),
      });
    } catch (error) {
      // The unique index is the real guard against a double submit racing the
      // eligibility read above.
      if (error.name === "SequelizeUniqueConstraintError") {
        const conflict = new Error(
          "You have already reviewed this property. Edit your review instead."
        );
        conflict.statusCode = 409;
        conflict.code = "REVIEW_ALREADY_EXISTS";
        throw conflict;
      }
      throw error;
    }

    await Notification.create({
      userId: listing.ownerId,
      title: "New review on your listing",
      message: `A seeker who inspected "${listing.title}" left a ${rating}-star review.`,
      type: "PROPERTY_REVIEW_PUBLISHED",
      link: `/owner/listings/${listing.id}`,
      metadata: { listingId: listing.id, reviewId: review.id, rating },
    });

    return this.findSeekerReview(propertyId, seekerId);
  }

  async reviseReview(propertyId, seekerId, input) {
    const { rating, body } = normalizeReviewInput(input);
    const listing = await this.findListing(propertyId);
    const review = await this.findSeekerReview(propertyId, seekerId);

    assertCanRevise({ review, listingDeleted: Boolean(listing.deletedAt) });

    // publishedAt is when the seeker first spoke; edits never reset it.
    review.set({ rating, body, editedAt: new Date() });
    await review.save();

    return review;
  }

  async listReviews(propertyId, pagination, sort = "RECENT") {
    const order =
      sort === "HIGHEST"
        ? [["rating", "DESC"], ["publishedAt", "DESC"]]
        : sort === "LOWEST"
          ? [["rating", "ASC"], ["publishedAt", "DESC"]]
          : [["publishedAt", "DESC"]];

    const { count, rows } = await PropertyReview.findAndCountAll({
      where: { propertyId },
      include: [{ model: User, as: "seeker", attributes: AUTHOR_ATTRIBUTES }],
      order,
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });

    return { count, rows: rows.map(serializeReview) };
  }

  /** Average, total and star distribution for one listing. */
  async summaryFor(propertyId) {
    const summaries = await this.summariesFor([propertyId]);
    return summaries[propertyId] || emptySummary();
  }

  /**
   * Summaries for a page of listings in one grouped query, so a listing feed
   * never fans out into a query per card.
   */
  async summariesFor(propertyIds = []) {
    const ids = [...new Set(propertyIds.filter(Boolean))];
    if (!ids.length) return {};

    const rows = await PropertyReview.findAll({
      where: { propertyId: { [Op.in]: ids } },
      attributes: ["propertyId", "rating", [fn("COUNT", col("id")), "count"]],
      group: ["propertyId", "rating"],
      raw: true,
    });

    const summaries = {};
    for (const row of rows) {
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

  /** The seeker's own published reviews, newest first. */
  async listSeekerReviews(seekerId, pagination) {
    const { count, rows } = await PropertyReview.findAndCountAll({
      where: { seekerId },
      include: [
        { model: User, as: "seeker", attributes: AUTHOR_ATTRIBUTES },
        {
          model: Listing,
          as: "property",
          attributes: ["id", "title", "city", "state", "images"],
          paranoid: false,
        },
      ],
      order: [["publishedAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });

    return { count, rows: rows.map(serializeReview) };
  }

  /**
   * Listings the seeker still owes a review on: a qualifying inspection, an
   * open window, no review yet, and a listing that is still live. Drives the
   * "review your visit" prompt.
   */
  async listPendingReviews(seekerId) {
    const inspections = await Inspection.findAll({
      where: { seekerId, outcome: { [Op.in]: QUALIFYING_OUTCOMES } },
      attributes: ["id", "propertyId", "status", "outcome", "completedAt", "outcomeAt"],
    });
    if (!inspections.length) return [];

    const propertyIds = [...new Set(inspections.map((row) => row.propertyId))];

    const [reviewed, listings] = await Promise.all([
      PropertyReview.findAll({
        where: { seekerId, propertyId: { [Op.in]: propertyIds } },
        attributes: ["propertyId"],
        raw: true,
      }),
      Listing.findAll({
        where: { id: { [Op.in]: propertyIds } },
        attributes: ["id", "title", "city", "state", "images", "approvalStatus"],
      }),
    ]);

    const reviewedIds = new Set(reviewed.map((row) => row.propertyId));
    const listingById = new Map(listings.map((listing) => [listing.id, listing]));

    const pending = [];
    for (const propertyId of propertyIds) {
      if (reviewedIds.has(propertyId)) continue;
      const listing = listingById.get(propertyId);
      if (!listing || listing.approvalStatus !== "APPROVED") continue;

      const eligibility = evaluateEligibility({
        inspections: inspections.filter((row) => row.propertyId === propertyId),
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

module.exports = new PropertyReviewRepository();
module.exports.serializeReview = serializeReview;
module.exports.emptySummary = emptySummary;
