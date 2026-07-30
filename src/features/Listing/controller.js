const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const sequelize = require("../../config/dbconfig");
const { Listing, ReviewDecision, Notification } = require("./model");
const { User } = require("../Authentication/model");
const { getPagination, paginatedData } = require("../../utils/pagination");
const reviewRepository = require("../PropertyReview/repository");

const MATERIAL_FIELDS = new Set([
  "title", "description", "intent", "propertyType", "price", "currency",
  "location", "address", "city", "state", "bedrooms", "bathrooms",
  "sittingRooms", "tags", "images",
]);

function userIdFrom(req) {
  return req.user?.sub || req.user?.id || req.user?.userId;
}

function publicListingWhere(query) {
  const where = { approvalStatus: "APPROVED" };
  // Taken properties stay reachable by direct link but drop out of discovery
  // unless the caller explicitly asks for them.
  if (String(query.includeSold) !== "true") {
    where.availabilityStatus = { [Op.ne]: "SOLD" };
  }
  if (query.intent) where.intent = String(query.intent).toUpperCase();
  if (query.propertyType && query.propertyType !== "any") where.propertyType = query.propertyType;
  if (query.state) where.state = { [Op.iLike]: `%${query.state}%` };
  if (query.city) where.city = { [Op.iLike]: `%${query.city}%` };
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = Number(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = Number(query.maxPrice);
  }
  const q = query.q || query.query || query.search;
  if (q) {
    const term = `%${q}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
      { location: { [Op.iLike]: term } },
      { city: { [Op.iLike]: term } },
      { state: { [Op.iLike]: term } },
    ];
  }
  if (query.isFeatured !== undefined) where.isFeatured = String(query.isFeatured) === "true";
  if (query.isPopular !== undefined) where.isPopular = String(query.isPopular) === "true";
  return where;
}

async function list(req, res) {
  try {
    const pagination = getPagination(req.query);
    const { count, rows } = await Listing.findAndCountAll({
      where: publicListingWhere(req.query),
      include: [{ model: User, as: "owner", attributes: ["id", "firstName", "surname", "email", "role", "profilePicture"] }],
      order: [["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
    // One grouped query for the whole page: a listing card shows its rating,
    // and a feed must not fan out into a query per card.
    const summaries = await reviewRepository.summariesFor(rows.map((row) => row.id));
    const properties = rows.map((row) => ({
      ...row.get({ plain: true }),
      reviewSummary: summaries[row.id],
    }));
    return res.json({
      success: true,
      message: "Listings retrieved successfully",
      data: paginatedData("properties", properties, count, pagination),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch listings", error: error.message });
  }
}

async function locations(req, res) {
  try {
    const rows = await Listing.findAll({
      // Facets mirror what discovery actually returns, so sold stock is excluded.
      where: { approvalStatus: "APPROVED", availabilityStatus: { [Op.ne]: "SOLD" } },
      attributes: ["state", "city"],
      raw: true,
    });
    const locationsByState = {};
    for (const row of rows) {
      if (!row.state) continue;
      if (!locationsByState[row.state]) locationsByState[row.state] = [];
      if (row.city && !locationsByState[row.state].includes(row.city)) {
        locationsByState[row.state].push(row.city);
      }
    }
    return res.json({
      success: true,
      data: { states: Object.keys(locationsByState).sort(), locationsByState },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch listing locations", error: error.message });
  }
}

async function stats(req, res) {
  try {
    // Same visibility rule as discovery, so the numbers on the landing page
    // always match what a search actually returns.
    const where = { approvalStatus: "APPROVED", availabilityStatus: { [Op.ne]: "SOLD" } };
    const count = sequelize.fn("COUNT", sequelize.col("id"));

    const [byIntent, byCity, byState] = await Promise.all([
      Listing.findAll({
        where,
        attributes: ["intent", [count, "count"]],
        group: ["intent"],
        raw: true,
      }),
      Listing.findAll({
        where,
        attributes: ["state", "city", [count, "count"]],
        group: ["state", "city"],
        order: [[count, "DESC"]],
        limit: 8,
        raw: true,
      }),
      Listing.findAll({ where, attributes: ["state"], group: ["state"], raw: true }),
    ]);

    const totals = { all: 0, RENT: 0, BUY: 0, SHORTLET: 0, SWAP: 0 };
    for (const row of byIntent) {
      const n = Number(row.count) || 0;
      totals.all += n;
      if (row.intent in totals) totals[row.intent] = n;
    }

    const cities = byCity
      .filter((row) => row.city && row.state)
      .map((row) => ({ city: row.city, state: row.state, count: Number(row.count) || 0 }));

    return res.json({
      success: true,
      data: {
        totals,
        cities,
        stateCount: byState.filter((row) => row.state).length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch listing stats", error: error.message });
  }
}

async function getOne(req, res) {
  try {
    let viewerId = null;
    const header = req.headers.authorization;
    if (header) {
      try {
        viewerId = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET).sub;
      } catch {}
    }
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: "owner", attributes: ["id", "firstName", "surname", "email", "role", "profilePicture"] }],
    });
    if (!listing || (listing.approvalStatus !== "APPROVED" && listing.ownerId !== viewerId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    const reviewSummary = await reviewRepository.summaryFor(listing.id);
    return res.json({
      success: true,
      data: { ...listing.get({ plain: true }), reviewSummary },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch listing", error: error.message });
  }
}

async function create(req, res) {
  try {
    const ownerId = userIdFrom(req);
    const owner = await User.findByPk(ownerId);
    if (!owner || !["owner", "broker"].includes(owner.role)) {
      return res.status(403).json({ success: false, message: "Only Owners and Brokers can create listings." });
    }
    if (owner.kycStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        code: "KYC_REQUIRED",
        kycStatus: owner.kycStatus || "UNSUBMITTED",
        message: "Approved Strong KYC is required before submitting a listing.",
      });
    }
    const required = ["title", "description", "intent", "propertyType", "price", "location", "city", "state"];
    const missing = required.filter((key) => req.body[key] === undefined || req.body[key] === "");
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!Array.isArray(req.body.images) || req.body.images.length < 8) {
      return res.status(400).json({ success: false, message: "At least 8 property photos are required." });
    }
    const listing = await sequelize.transaction(async (transaction) => {
      const created = await Listing.create({
        ...req.body,
        intent: String(req.body.intent).toUpperCase(),
        ownerId,
        approvalStatus: "PENDING",
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        submittedAt: new Date(),
      }, { transaction });
      await ReviewDecision.create({
        subjectType: "LISTING",
        subjectId: created.id,
        outcome: "SUBMITTED",
        submittedBy: ownerId,
      }, { transaction });
      return created;
    });
    return res.status(201).json({ success: true, message: "Listing submitted for admin review.", data: listing });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create listing", error: error.message });
  }
}

async function update(req, res) {
  try {
    const ownerId = userIdFrom(req);
    const listing = await Listing.findOne({ where: { id: req.params.id, ownerId } });
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    const safe = { ...req.body };
    delete safe.ownerId;
    delete safe.approvalStatus;
    delete safe.rejectionReason;
    delete safe.reviewedAt;
    delete safe.reviewedBy;
    // Availability is owned by the payment flow, never by a listing edit.
    delete safe.availabilityStatus;
    const material = Object.keys(safe).some((key) => MATERIAL_FIELDS.has(key));

    await sequelize.transaction(async (transaction) => {
      if (material) {
        safe.approvalStatus = "PENDING";
        safe.rejectionReason = null;
        safe.reviewedAt = null;
        safe.reviewedBy = null;
        safe.submittedAt = new Date();
      }
      await listing.update(safe, { transaction });
      if (material) {
        const lastCycle = await ReviewDecision.max("cycle", {
          where: { subjectType: "LISTING", subjectId: listing.id },
          transaction,
        });
        await ReviewDecision.create({
          subjectType: "LISTING",
          subjectId: listing.id,
          cycle: Number(lastCycle || 0) + 1,
          outcome: "RETURNED_TO_PENDING",
          submittedBy: ownerId,
        }, { transaction });
        await Notification.create({
          userId: ownerId,
          title: "Listing returned to review",
          message: `"${listing.title}" was materially edited and is pending admin approval again.`,
          type: "LISTING_RETURNED_TO_PENDING",
          link: "/owner/listings",
          metadata: { listingId: listing.id },
        }, { transaction });
      }
    });
    return res.json({
      success: true,
      message: material ? "Listing updated and returned to pending review." : "Listing updated.",
      data: listing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update listing", error: error.message });
  }
}

async function remove(req, res) {
  try {
    // Soft delete: the listing leaves discovery immediately, but the visits and
    // reviews it accumulated stay attached to it. Seekers can no longer submit
    // a review for it, and their 30-day window keeps running while it is gone.
    const count = await Listing.destroy({ where: { id: req.params.id, ownerId: userIdFrom(req) } });
    if (!count) return res.status(404).json({ success: false, message: "Listing not found" });
    return res.json({ success: true, message: "Listing deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete listing", error: error.message });
  }
}

module.exports = { list, locations, stats, getOne, create, update, remove, MATERIAL_FIELDS };
