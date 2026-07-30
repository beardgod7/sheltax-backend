const { Op } = require("sequelize");
const sequelize = require("../../config/dbconfig");
const { User } = require("../Authentication/model");
const { OwnerProfile, BrokerProfile } = require("../Profile/model");
const { Listing, ReviewDecision, Notification } = require("../Listing/model");
const { sendModerationEmail } = require("../../service/emailservice");
const { getPagination, paginatedData } = require("../../utils/pagination");
const paymentRepository = require("../Payment/repository");

class AdminController {
  // GET /admin/stats
  async getStats(req, res) {
    try {
      const totalProperties = await Listing.count();
      const pendingProperties = await Listing.count({ where: { approvalStatus: "PENDING" } });
      const approvedProperties = await Listing.count({ where: { approvalStatus: "APPROVED" } });
      const rejectedProperties = await Listing.count({ where: { approvalStatus: "REJECTED" } });

      const totalUsers = await User.count();
      const seekersCount = await User.count({ where: { role: "seeker" } });
      const ownersCount = await User.count({ where: { role: "owner" } });
      const brokersCount = await User.count({ where: { role: "broker" } });
      const verifiedUsersCount = await User.count({ where: { verified: true } });

      const ownerKycCount = await User.count({ where: { role: "owner", kycStatus: "PENDING" } });
      const brokerKycCount = await User.count({ where: { role: "broker", kycStatus: "PENDING" } });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const usersNewToday = await User.count({
        where: { createdAt: { [Op.gte]: startOfToday } },
      });

      const approvedThisWeek = await Listing.count({
        where: {
          approvalStatus: "APPROVED",
          reviewedAt: { [Op.gte]: oneWeekAgo },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          properties: {
            total: totalProperties,
            pending: pendingProperties,
            approved: approvedProperties,
            rejected: rejectedProperties,
            approvedThisWeek,
          },
          users: {
            total: totalUsers,
            seekers: seekersCount,
            owners: ownersCount,
            brokers: brokersCount,
            verified: verifiedUsersCount,
            newToday: usersNewToday,
          },
          kyc: {
            pendingOwnerSubmissions: ownerKycCount,
            pendingBrokerSubmissions: brokerKycCount,
          },
        },
      });
    } catch (error) {
      console.error("Get Admin Stats Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch admin stats", error: error.message });
    }
  }

  // GET /admin/properties
  async getProperties(req, res) {
    try {
      const { status, intent, q } = req.query;
      const whereClause = {};

      if (status && status !== "ALL") {
        const s = status.toUpperCase();
        if (s === "APPROVED" || s === "PUBLISHED" || s === "ACTIVE") {
          whereClause.approvalStatus = "APPROVED";
        } else if (s === "PENDING") {
          whereClause.approvalStatus = "PENDING";
        } else if (s === "REJECTED") {
          whereClause.approvalStatus = "REJECTED";
        } else {
          whereClause.approvalStatus = status.toUpperCase();
        }
      }

      if (intent && intent !== "ALL") {
        whereClause.intent = intent.toUpperCase();
      }

      if (q && q.trim().length > 0) {
        const searchTerm = `%${q.trim()}%`;
        whereClause[Op.or] = [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } },
          { address: { [Op.iLike]: searchTerm } },
          { city: { [Op.iLike]: searchTerm } },
          { state: { [Op.iLike]: searchTerm } },
        ];
      }

      const pagination = getPagination(req.query, { defaultLimit: 50 });
      const { count, rows: properties } = await Listing.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["id", "firstName", "surname", "email", "phoneNumber", "role", "kycStatus"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset: pagination.offset,
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "Properties retrieved successfully",
        data: paginatedData("properties", properties, count, pagination),
      });
    } catch (error) {
      console.error("Get Admin Properties Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch properties", error: error.message });
    }
  }

  // PATCH /admin/properties/:id/status
  async updatePropertyStatus(req, res) {
    try {
      const { id } = req.params;
      const { approvalStatus, rejectionReason } = req.body;

      const status = String(approvalStatus || "").toUpperCase();
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid listing review outcome." });
      }
      if (status === "REJECTED" && !String(rejectionReason || "").trim()) {
        return res.status(400).json({ success: false, message: "A rejection reason is required." });
      }

      const property = await Listing.findByPk(id, {
        include: [{ model: User, as: "owner", attributes: ["id", "email", "firstName"] }],
      });
      if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }

      const reviewerId = req.user?.sub || req.user?.id;
      await sequelize.transaction(async (transaction) => {
        await property.update({
          approvalStatus: status,
          rejectionReason: status === "REJECTED" ? rejectionReason.trim() : null,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
        }, { transaction });
        const cycle = await ReviewDecision.max("cycle", {
          where: { subjectType: "LISTING", subjectId: property.id },
          transaction,
        });
        await ReviewDecision.create({
          subjectType: "LISTING",
          subjectId: property.id,
          cycle: Number(cycle || 1),
          outcome: status,
          reason: status === "REJECTED" ? rejectionReason.trim() : null,
          reviewerId,
        }, { transaction });
        await Notification.create({
          userId: property.ownerId,
          title: status === "APPROVED" ? "Listing approved" : status === "REJECTED" ? "Listing needs changes" : "Listing pending review",
          message: status === "REJECTED"
            ? `"${property.title}" was rejected: ${rejectionReason.trim()}`
            : `"${property.title}" is now ${status.toLowerCase()}.`,
          type: `LISTING_${status}`,
          link: `/owner/listings`,
          metadata: { listingId: property.id },
        }, { transaction });
      });

      if (status !== "PENDING" && property.owner?.email) {
        const message = status === "APPROVED"
          ? `Your listing "${property.title}" has been approved and is now visible to seekers.`
          : `Your listing "${property.title}" needs changes. Reason: ${rejectionReason.trim()}`;
        sendModerationEmail(
          property.owner.email,
          property.owner.firstName,
          `Shelta-X listing ${status.toLowerCase()}`,
          message
        ).catch((error) => console.error("Listing moderation email error:", error.message));
      }

      res.status(200).json({
        success: true,
        message: `Listing review status updated to ${status}`,
        data: property,
      });
    } catch (error) {
      console.error("Update Property Status Error:", error);
      res.status(500).json({ success: false, message: "Failed to update property status", error: error.message });
    }
  }

  // GET /admin/users
  async getUsers(req, res) {
    try {
      const { role, q, verifiedOnly } = req.query;
      const whereClause = {};

      if (role && role !== "ALL") {
        whereClause.role = role.toLowerCase();
      }

      if (verifiedOnly === "true" || verifiedOnly === true) {
        whereClause.verified = true;
      }

      if (q && q.trim().length > 0) {
        const searchTerm = `%${q.trim()}%`;
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: searchTerm } },
          { surname: { [Op.iLike]: searchTerm } },
          { email: { [Op.iLike]: searchTerm } },
          { phoneNumber: { [Op.iLike]: searchTerm } },
        ];
      }

      const pagination = getPagination(req.query);
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset: pagination.offset,
      });

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: paginatedData("users", users, count, pagination),
      });
    } catch (error) {
      console.error("Get Admin Users Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
    }
  }

  // GET /admin/users/:id
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [
          { model: OwnerProfile, as: "ownerProfile" },
          { model: BrokerProfile, as: "brokerProfile" },
        ],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get Admin User By ID Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
    }
  }

  // GET /admin/kyc
  async getKycSubmissions(req, res) {
    try {
      const { status, role, q } = req.query;
      const whereClause = {
        role: { [Op.notIn]: ["admin", "super_admin"] },
        [Op.or]: [
          { ninVerification: { [Op.ne]: null } },
          { governmentId: { [Op.ne]: null } },
          { ninCacDocument: { [Op.ne]: null } },
          { kycStatus: { [Op.ne]: "UNSUBMITTED" } },
        ],
      };

      if (role && role !== "ALL") {
        whereClause.role = role.toLowerCase();
      }

      if (status && status !== "ALL") {
        if (status === "APPROVED") {
          whereClause.kycStatus = "APPROVED";
        } else if (status === "PENDING") {
          whereClause.kycStatus = "PENDING";
        } else if (status === "REJECTED") {
          whereClause.kycStatus = "REJECTED";
        }
      }

      if (q && q.trim().length > 0) {
        const searchTerm = `%${q.trim()}%`;
        const submittedEvidence = whereClause[Op.or];
        delete whereClause[Op.or];
        whereClause[Op.and] = [
          { [Op.or]: submittedEvidence },
          { [Op.or]: [
            { firstName: { [Op.iLike]: searchTerm } },
            { surname: { [Op.iLike]: searchTerm } },
            { email: { [Op.iLike]: searchTerm } },
            { phoneNumber: { [Op.iLike]: searchTerm } },
            { ninVerification: { [Op.iLike]: searchTerm } },
          ] },
        ];
      }

      const pagination = getPagination(req.query);
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ["password"] },
        include: [
          { model: OwnerProfile, as: "ownerProfile" },
          { model: BrokerProfile, as: "brokerProfile" },
        ],
        order: [
          ["kycStatus", "ASC"],
          ["updatedAt", "DESC"],
        ],
        limit: pagination.limit,
        offset: pagination.offset,
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "KYC submissions retrieved successfully",
        data: paginatedData("submissions", users, count, pagination),
      });
    } catch (error) {
      console.error("Get Admin KYC Submissions Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch KYC submissions", error: error.message });
    }
  }

  // PATCH /admin/users/:id/verify
  async updateUserVerification(req, res) {
    try {
      const id = req.params.id || req.params.userId;
      const { isVerified, rejectionReason } = req.body;
      if (typeof isVerified !== "boolean") {
        return res.status(400).json({ success: false, message: "isVerified must be a boolean." });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!["owner", "broker"].includes(user.role)) {
        return res.status(400).json({ success: false, message: "Only Owner or Broker Strong KYC can be reviewed." });
      }
      if (!isVerified && !String(rejectionReason || "").trim()) {
        return res.status(400).json({ success: false, message: "A KYC rejection reason is required." });
      }

      const status = Boolean(isVerified) ? "APPROVED" : "REJECTED";
      const reviewerId = req.user?.sub || req.user?.id;
      await sequelize.transaction(async (transaction) => {
        await user.update({
          kycStatus: status,
          kycLevel: isVerified ? "VERIFIED" : "BASIC",
          kycRejectionReason: isVerified ? null : rejectionReason.trim(),
        }, { transaction });
        const cycle = await ReviewDecision.max("cycle", {
          where: { subjectType: "KYC", subjectId: user.id },
          transaction,
        });
        await ReviewDecision.create({
          subjectType: "KYC",
          subjectId: user.id,
          cycle: Number(cycle || 1),
          outcome: status,
          reason: isVerified ? null : rejectionReason.trim(),
          reviewerId,
        }, { transaction });
        await Notification.create({
          userId: user.id,
          title: isVerified ? "Strong KYC approved" : "Strong KYC needs attention",
          message: isVerified
            ? "Your Strong KYC is approved. You can now submit listings."
            : `Your Strong KYC was rejected: ${rejectionReason.trim()}`,
          type: `KYC_${status}`,
          link: "/owner/listings/create",
        }, { transaction });
      });

      sendModerationEmail(
        user.email,
        user.firstName,
        `Shelta-X KYC ${status.toLowerCase()}`,
        isVerified
          ? "Your Strong KYC has been approved. You can now submit listings."
          : `Your Strong KYC needs changes. Reason: ${rejectionReason.trim()}`
      ).catch((error) => console.error("KYC moderation email error:", error.message));

      res.status(200).json({
        success: true,
        message: `Strong KYC status updated to ${status}`,
        data: user,
      });
    } catch (error) {
      console.error("Update User Verification Error:", error);
      res.status(500).json({ success: false, message: "Failed to update user verification", error: error.message });
    }
  }

  // GET /admin/sales — platform-wide sold-property report
  async getSales(req, res) {
    try {
      const pagination = getPagination(req.query, { defaultLimit: 50 });
      const { count, rows: sales } = await paymentRepository.getAllSales(pagination, {
        status: req.query.status,
        intent: req.query.intent,
        q: req.query.q,
      });
      const summary = await paymentRepository.getSalesSummary();

      return res.status(200).json({
        success: true,
        message: "Sales retrieved successfully",
        data: { ...paginatedData("sales", sales, count, pagination), summary },
      });
    } catch (error) {
      console.error("Get Admin Sales Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch sales report.",
      });
    }
  }
}

module.exports = new AdminController();
