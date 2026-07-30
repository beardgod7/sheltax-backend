const { MainProperty: Listing } = require("./model");
const { getPagination, paginatedData } = require("../../utils/pagination");

class OwnerController {
  // GET /api/v1/owner/dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub || req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const activeListings = await Listing.count({
        where: { ownerId: userId, approvalStatus: "APPROVED" },
      });

      const pendingListings = await Listing.count({
        where: { ownerId: userId, approvalStatus: "PENDING" },
      });

      res.status(200).json({
        success: true,
        message: "Owner dashboard statistics retrieved successfully",
        data: {
          kpi: {
            activeListings,
            pendingClosings: pendingListings,
            newLeads: 0,
          },
          recentActivity: [],
        },
      });
    } catch (error) {
      console.error("Get Owner Dashboard Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch owner dashboard data",
        error: error.message,
      });
    }
  }

  // GET /api/v1/owner/properties
  async getProperties(req, res) {
    try {
      const userId = req.user?.id || req.user?.sub || req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const pagination = getPagination(req.query);
      const whereClause = { ownerId: userId };
      const requestedStatus = String(req.query.status || "").toUpperCase();
      if (requestedStatus && requestedStatus !== "ALL") {
        whereClause.approvalStatus = requestedStatus === "ACTIVE" ? "APPROVED" : requestedStatus;
      }
      const { count, rows: properties } = await Listing.findAndCountAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const formatted = properties.map((p) => {
        const item = p.toJSON();
        return {
          ...item,
          listingStatus: (item.approvalStatus || "PENDING").toLowerCase(),
          rentAmount: item.price,
        };
      });

      res.status(200).json({
        success: true,
        message: "Owner properties retrieved successfully",
        data: paginatedData("properties", formatted, count, pagination),
      });
    } catch (error) {
      console.error("Get Owner Properties Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch owner properties",
        error: error.message,
      });
    }
  }
}

module.exports = new OwnerController();
