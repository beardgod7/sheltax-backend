const propertyRequestRepository = require("./repository");
const {
  createPropertyRequestSchema,
  updatePropertyRequestSchema,
  createResponseSchema,
  updateResponseStatusSchema,
  searchPropertyRequestsSchema,
} = require("./schema");

class PropertyRequestController {
  // Create property request (Seeker only)
  async createPropertyRequest(req, res) {
    try {
      const { error, value } = createPropertyRequestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const request = await propertyRequestRepository.createPropertyRequest(
        value,
        req.user.sub
      );

      res.status(201).json({
        success: true,
        message: "Property request created successfully",
        data: request,
      });
    } catch (error) {
      console.error("Create property request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create property request",
        error: error.message,
      });
    }
  }

  // Get property request by ID
  async getPropertyRequest(req, res) {
    try {
      const { id } = req.params;
      const request = await propertyRequestRepository.getPropertyRequestById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Property request not found",
        });
      }

      // Increment view count (don't await to avoid blocking response)
      propertyRequestRepository.incrementViewCount(id).catch(console.error);

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error("Get property request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get property request",
        error: error.message,
      });
    }
  }

  // Search property requests (Brokers/Owners view all active requests)
  async searchPropertyRequests(req, res) {
    try {
      const { error, value } = searchPropertyRequestsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const result = await propertyRequestRepository.searchPropertyRequests(value);

      res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Search property requests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search property requests",
        error: error.message,
      });
    }
  }

  // Get seeker's own requests
  async getMyRequests(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await propertyRequestRepository.getSeekerRequests(
        req.user.sub,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get my requests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your requests",
        error: error.message,
      });
    }
  }

  // Update property request
  async updatePropertyRequest(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updatePropertyRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const request = await propertyRequestRepository.updatePropertyRequest(
        id,
        value,
        req.user.sub
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Property request not found or you don't have permission to update it",
        });
      }

      res.json({
        success: true,
        message: "Property request updated successfully",
        data: request,
      });
    } catch (error) {
      console.error("Update property request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update property request",
        error: error.message,
      });
    }
  }

  // Delete property request
  async deletePropertyRequest(req, res) {
    try {
      const { id } = req.params;
      const deleted = await propertyRequestRepository.deletePropertyRequest(
        id,
        req.user.sub
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Property request not found or you don't have permission to delete it",
        });
      }

      res.json({
        success: true,
        message: "Property request deleted successfully",
      });
    } catch (error) {
      console.error("Delete property request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete property request",
        error: error.message,
      });
    }
  }

  // RESPONSE CONTROLLERS

  // Create response to property request (Broker/Owner)
  async createResponse(req, res) {
    try {
      const { id: requestId } = req.params;
      const { error, value } = createResponseSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Check if request exists
      const request = await propertyRequestRepository.getPropertyRequestById(requestId, false);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Property request not found",
        });
      }

      // Check if request is still active
      if (request.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "This property request is no longer active",
        });
      }

      const response = await propertyRequestRepository.createResponse(
        requestId,
        value,
        req.user.sub
      );

      res.status(201).json({
        success: true,
        message: "Response sent successfully",
        data: response,
      });
    } catch (error) {
      console.error("Create response error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send response",
        error: error.message,
      });
    }
  }

  // Get responses for a request (Seeker views responses to their request)
  async getRequestResponses(req, res) {
    try {
      const { id: requestId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await propertyRequestRepository.getResponsesForRequest(
        requestId,
        req.user.sub,
        parseInt(page),
        parseInt(limit)
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Request not found or you don't have permission to view responses",
        });
      }

      res.json({
        success: true,
        data: result.responses,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get request responses error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get responses",
        error: error.message,
      });
    }
  }

  // Get broker/owner's own responses
  async getMyResponses(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await propertyRequestRepository.getResponderResponses(
        req.user.sub,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.responses,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get my responses error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your responses",
        error: error.message,
      });
    }
  }

  // Update response status (Seeker updates status of responses they received)
  async updateResponseStatus(req, res) {
    try {
      const { responseId } = req.params;
      const { error, value } = updateResponseStatusSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const response = await propertyRequestRepository.updateResponseStatus(
        responseId,
        value,
        req.user.sub
      );

      if (!response) {
        return res.status(404).json({
          success: false,
          message: "Response not found or you don't have permission to update it",
        });
      }

      res.json({
        success: true,
        message: "Response status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Update response status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update response status",
        error: error.message,
      });
    }
  }

  // Get response by ID
  async getResponse(req, res) {
    try {
      const { responseId } = req.params;
      const response = await propertyRequestRepository.getResponseById(responseId);

      if (!response) {
        return res.status(404).json({
          success: false,
          message: "Response not found",
        });
      }

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Get response error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get response",
        error: error.message,
      });
    }
  }
}

module.exports = new PropertyRequestController();
