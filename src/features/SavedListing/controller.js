const { SavedListing } = require("./model");
const { Listing } = require("../Listing/model");
const { getPagination, paginatedData } = require("../../utils/pagination");

function userIdFrom(req) {
  return req.user?.sub || req.user?.id || req.user?.userId;
}

async function toggle(req, res) {
  try {
    const userId = userIdFrom(req);
    const property = await Listing.findOne({
      where: { id: req.params.propertyId, approvalStatus: "APPROVED" },
    });
    if (!property) return res.status(404).json({ success: false, message: "Listing not found" });
    const existing = await SavedListing.findOne({ where: { userId, propertyId: property.id } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, data: { isSaved: false }, message: "Listing removed from saved properties." });
    }
    await SavedListing.create({ userId, propertyId: property.id });
    return res.json({ success: true, data: { isSaved: true }, message: "Listing saved." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update saved listing", error: error.message });
  }
}

async function list(req, res) {
  try {
    const pagination = getPagination(req.query);
    const { count, rows: saved } = await SavedListing.findAndCountAll({
      where: { userId: userIdFrom(req) },
      include: [{ model: Listing, as: "property", where: { approvalStatus: "APPROVED" } }],
      order: [["createdAt", "DESC"]],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
    return res.json({
      success: true,
      message: "Saved listings retrieved successfully",
      data: paginatedData(
        "properties",
        saved.map((item) => item.property),
        count,
        pagination,
      ),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch saved listings", error: error.message });
  }
}

async function ids(req, res) {
  try {
    const saved = await SavedListing.findAll({
      where: { userId: userIdFrom(req) },
      attributes: ["propertyId"],
      raw: true,
    });
    return res.json({ success: true, data: saved.map((item) => item.propertyId) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch saved listing IDs", error: error.message });
  }
}

module.exports = { toggle, list, ids };
