const reviewRepository = require("./repository");
const { getPagination, paginatedData } = require("../../utils/pagination");

const SORTS = ["RECENT", "HIGHEST", "LOWEST"];

function userIdFrom(req) {
  return req.user?.sub || req.user?.id || req.user?.userId;
}

function propertyIdFrom(req) {
  return req.params.propertyId || req.params.id;
}

function failed(res, error, fallback) {
  console.error(`${fallback}:`, error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallback,
    ...(error.code ? { code: error.code } : {}),
  });
}

class PropertyReviewController {
  /** Public: the reviews and rating summary shown on a listing page. */
  async listReviews(req, res) {
    try {
      const propertyId = propertyIdFrom(req);
      await reviewRepository.findPublicListing(propertyId);

      const pagination = getPagination(req.query, { defaultLimit: 10 });
      const sort = SORTS.includes(String(req.query.sort || "").toUpperCase())
        ? String(req.query.sort).toUpperCase()
        : "RECENT";

      const [{ count, rows }, summary] = await Promise.all([
        reviewRepository.listReviews(propertyId, pagination, sort),
        reviewRepository.summaryFor(propertyId),
      ]);

      return res.status(200).json({
        success: true,
        message: "Property reviews retrieved successfully",
        data: { ...paginatedData("reviews", rows, count, pagination), summary },
      });
    } catch (error) {
      return failed(res, error, "Failed to fetch property reviews");
    }
  }

  /** Public: the rating summary alone, for cards and headers. */
  async summary(req, res) {
    try {
      const propertyId = propertyIdFrom(req);
      await reviewRepository.findPublicListing(propertyId);
      const summary = await reviewRepository.summaryFor(propertyId);
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      return failed(res, error, "Failed to fetch review summary");
    }
  }

  /** What the signed-in seeker may do about reviewing this listing. */
  async eligibility(req, res) {
    try {
      const eligibility = await reviewRepository.getEligibility(
        propertyIdFrom(req),
        userIdFrom(req)
      );
      return res.status(200).json({ success: true, data: eligibility });
    } catch (error) {
      return failed(res, error, "Failed to check review eligibility");
    }
  }

  async submitReview(req, res) {
    try {
      const review = await reviewRepository.submitReview(
        propertyIdFrom(req),
        userIdFrom(req),
        req.body
      );
      return res.status(201).json({
        success: true,
        message: "Thanks — your review is now live on this property.",
        data: reviewRepository.serializeReview(review),
      });
    } catch (error) {
      return failed(res, error, "Failed to publish review");
    }
  }

  async reviseReview(req, res) {
    try {
      const review = await reviewRepository.reviseReview(
        propertyIdFrom(req),
        userIdFrom(req),
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Your review has been updated.",
        data: reviewRepository.serializeReview(review),
      });
    } catch (error) {
      return failed(res, error, "Failed to update review");
    }
  }

  /** The seeker's own published reviews. */
  async myReviews(req, res) {
    try {
      const pagination = getPagination(req.query, { defaultLimit: 10 });
      const { count, rows } = await reviewRepository.listSeekerReviews(
        userIdFrom(req),
        pagination
      );
      return res.status(200).json({
        success: true,
        message: "Your reviews retrieved successfully",
        data: paginatedData("reviews", rows, count, pagination),
      });
    } catch (error) {
      return failed(res, error, "Failed to fetch your reviews");
    }
  }

  /** Listings the seeker can still review, soonest deadline first. */
  async pendingReviews(req, res) {
    try {
      const pending = await reviewRepository.listPendingReviews(userIdFrom(req));
      return res.status(200).json({
        success: true,
        message: "Pending reviews retrieved successfully",
        data: { pending },
      });
    } catch (error) {
      return failed(res, error, "Failed to fetch pending reviews");
    }
  }
}

module.exports = new PropertyReviewController();
