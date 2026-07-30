const inspectionRepository = require("./repository");
const { getPagination, paginatedData } = require("../../utils/pagination");

class InspectionController {
  async createInspection(req, res) {
    try {
      const seekerId = req.user.sub || req.user.id || req.user.userId;
      const { propertyId, preferredDate, preferredTime, contactPhone } = req.body;

      if (!propertyId || !preferredDate || !preferredTime || !contactPhone) {
        return res.status(400).json({
          success: false,
          message: "Missing required inspection booking details (propertyId, preferredDate, preferredTime, contactPhone).",
        });
      }

      const inspection = await inspectionRepository.createInspection(seekerId, req.body);

      return res.status(201).json({
        success: true,
        message: "Inspection request submitted successfully. The property host has been notified.",
        data: inspection,
      });
    } catch (error) {
      console.error("Create Inspection Error:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to submit inspection request.",
        ...(error.code ? { code: error.code } : {}),
        ...(error.inspectionId ? { inspectionId: error.inspectionId } : {}),
      });
    }
  }

  async getUserInspections(req, res) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const pagination = getPagination(req.query);
      const status = req.query.status && req.query.status !== "ALL"
        ? String(req.query.status).toUpperCase()
        : undefined;
      const scope = ["OWNER", "SEEKER"].includes(String(req.query.scope || "").toUpperCase())
        ? String(req.query.scope).toUpperCase()
        : undefined;
      const { count, rows: inspections } =
        await inspectionRepository.getUserInspections(userId, pagination, status, scope);

      return res.status(200).json({
        success: true,
        message: "Inspection requests retrieved successfully",
        data: paginatedData("inspections", inspections, count, pagination),
      });
    } catch (error) {
      console.error("Get User Inspections Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch user inspection requests.",
      });
    }
  }

  async updateInspectionStatus(req, res) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const { id } = req.params;
      const { status, notes, outcome } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required (CONFIRMED, RESCHEDULED, CANCELLED, COMPLETED).",
        });
      }

      const inspection = await inspectionRepository.updateInspectionStatus(
        id,
        userId,
        String(status).toUpperCase(),
        notes,
        outcome ? String(outcome).toUpperCase() : undefined
      );

      return res.status(200).json({
        success: true,
        message: `Inspection request updated to ${inspection.status}.`,
        data: inspection,
      });
    } catch (error) {
      console.error("Update Inspection Status Error:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update inspection request status.",
        ...(error.code ? { code: error.code } : {}),
      });
    }
  }

  async recordInspectionOutcome(req, res) {
    try {
      const userId = req.user.sub || req.user.id || req.user.userId;
      const { id } = req.params;
      const { outcome } = req.body;

      if (!outcome) {
        return res.status(400).json({
          success: false,
          message: "Outcome is required (INTERESTED, NOT_INTERESTED).",
        });
      }

      const inspection = await inspectionRepository.recordInspectionOutcome(
        id,
        userId,
        String(outcome).toUpperCase()
      );

      return res.status(200).json({
        success: true,
        message: "Thanks — your feedback has been shared with the owner.",
        data: inspection,
      });
    } catch (error) {
      console.error("Record Inspection Outcome Error:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to record inspection outcome.",
        ...(error.code ? { code: error.code } : {}),
      });
    }
  }
}

module.exports = new InspectionController();
