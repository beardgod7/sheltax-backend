const shortletRepository = require("./repository");
const {
  createShortletPropertySchema,
  updateShortletPropertySchema,
  createShortletInquirySchema,
  respondToShortletInquirySchema,
  searchShortletPropertiesSchema,
  verifyShortletPropertySchema,
} = require("./schema");

class ShortletController {
  // Create shortlet property
  async createShortletProperty(req, res) {
    try {
      const { error, value } = createShortletPropertySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await shortletRepository.createShortletProperty(
        value,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: "Shortlet property created successfully",
        data: property,
      });
    } catch (error) {
      console.error("Create shortlet property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create shortlet property",
        error: error.message,
      });
    }
  }

  // Get shortlet property by ID
  async getShortletProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await shortletRepository.getShortletPropertyById(id);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found",
        });
      }

      // Increment view count (don't await to avoid blocking response)
      shortletRepository.incrementViewCount(id).catch(console.error);

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Get shortlet property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get shortlet property",
        error: error.message,
      });
    }
  }

  // Search and filter shortlet properties
  async searchShortletProperties(req, res) {
    try {
      const { error, value } = searchShortletPropertiesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const result = await shortletRepository.searchShortletProperties(value);

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Search shortlet properties error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search shortlet properties",
        error: error.message,
      });
    }
  }

  // Get user's shortlet properties
  async getMyShortletProperties(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await shortletRepository.getShortletPropertiesByOwner(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get my shortlet properties error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your shortlet properties",
        error: error.message,
      });
    }
  }

  // Update shortlet property
  async updateShortletProperty(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateShortletPropertySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await shortletRepository.updateShortletProperty(
        id,
        value,
        req.user.id
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found or you don't have permission to update it",
        });
      }

      res.json({
        success: true,
        message: "Shortlet property updated successfully",
        data: property,
      });
    } catch (error) {
      console.error("Update shortlet property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update shortlet property",
        error: error.message,
      });
    }
  }

  // Delete shortlet property
  async deleteShortletProperty(req, res) {
    try {
      const { id } = req.params;
      const deleted = await shortletRepository.deleteShortletProperty(id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found or you don't have permission to delete it",
        });
      }

      res.json({
        success: true,
        message: "Shortlet property deleted successfully",
      });
    } catch (error) {
      console.error("Delete shortlet property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete shortlet property",
        error: error.message,
      });
    }
  }

  // Verify shortlet property (Admin only)
  async verifyShortletProperty(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = verifyShortletPropertySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await shortletRepository.verifyShortletProperty(
        id,
        value.isVerified
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found",
        });
      }

      res.json({
        success: true,
        message: `Shortlet property ${value.isVerified ? 'verified' : 'unverified'} successfully`,
        data: property,
      });
    } catch (error) {
      console.error("Verify shortlet property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify shortlet property",
        error: error.message,
      });
    }
  }

  // INQUIRY CONTROLLERS

  // Create shortlet inquiry
  async createShortletInquiry(req, res) {
    try {
      const { id: propertyId } = req.params;
      const { error, value } = createShortletInquirySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Check if property exists
      const property = await shortletRepository.getShortletPropertyById(propertyId, false);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found",
        });
      }

      const inquiry = await shortletRepository.createShortletInquiry(
        propertyId,
        value,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: "Inquiry sent successfully",
        data: inquiry,
      });
    } catch (error) {
      console.error("Create shortlet inquiry error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send inquiry",
        error: error.message,
      });
    }
  }

  // Get inquiries for a property (Owner only)
  async getPropertyInquiries(req, res) {
    try {
      const { id: propertyId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await shortletRepository.getInquiriesForProperty(
        propertyId,
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Property not found or you don't have permission to view inquiries",
        });
      }

      res.json({
        success: true,
        data: result.inquiries,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get property inquiries error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get property inquiries",
        error: error.message,
      });
    }
  }

  // Get user's inquiries
  async getMyInquiries(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await shortletRepository.getUserInquiries(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.inquiries,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get my inquiries error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your inquiries",
        error: error.message,
      });
    }
  }

  // Respond to inquiry (Owner only)
  async respondToInquiry(req, res) {
    try {
      const { inquiryId } = req.params;
      const { error, value } = respondToShortletInquirySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const inquiry = await shortletRepository.respondToInquiry(
        inquiryId,
        value,
        req.user.id
      );

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found or you don't have permission to respond",
        });
      }

      res.json({
        success: true,
        message: "Response sent successfully",
        data: inquiry,
      });
    } catch (error) {
      console.error("Respond to inquiry error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to respond to inquiry",
        error: error.message,
      });
    }
  }

  // FAVORITE CONTROLLERS

  // Add to favorites
  async addToFavorites(req, res) {
    try {
      const { id: propertyId } = req.params;

      // Check if property exists
      const property = await shortletRepository.getShortletPropertyById(propertyId, false);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Shortlet property not found",
        });
      }

      const result = await shortletRepository.addToFavorites(propertyId, req.user.id);

      if (!result.created) {
        return res.status(409).json({
          success: false,
          message: "Property is already in your favorites",
        });
      }

      res.status(201).json({
        success: true,
        message: "Property added to favorites successfully",
        data: result.favorite,
      });
    } catch (error) {
      console.error("Add to favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add property to favorites",
        error: error.message,
      });
    }
  }

  // Remove from favorites
  async removeFromFavorites(req, res) {
    try {
      const { id: propertyId } = req.params;
      const removed = await shortletRepository.removeFromFavorites(propertyId, req.user.id);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Property not found in your favorites",
        });
      }

      res.json({
        success: true,
        message: "Property removed from favorites successfully",
      });
    } catch (error) {
      console.error("Remove from favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove property from favorites",
        error: error.message,
      });
    }
  }

  // Get user's favorite properties
  async getMyFavorites(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await shortletRepository.getUserFavorites(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result.favorites,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get my favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your favorite properties",
        error: error.message,
      });
    }
  }

  // Check if property is favorited
  async checkFavoriteStatus(req, res) {
    try {
      const { id: propertyId } = req.params;
      const isFavorited = await shortletRepository.isPropertyFavorited(
        propertyId,
        req.user.id
      );

      res.json({
        success: true,
        data: { isFavorited },
      });
    } catch (error) {
      console.error("Check favorite status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check favorite status",
        error: error.message,
      });
    }
  }
}

module.exports = new ShortletController();