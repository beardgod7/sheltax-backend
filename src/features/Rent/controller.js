const rentalRepository = require("./repository");
const {
  createRentalPropertySchema,
  updateRentalPropertySchema,
  createRentalInquirySchema,
  respondToInquirySchema,
  searchRentalPropertiesSchema,
  verifyRentalPropertySchema,
} = require("./schema");

class RentalController {
  // Create rental property
  async createRentalProperty(req, res) {
    try {
      const { error, value } = createRentalPropertySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await rentalRepository.createRentalProperty(
        value,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: "Rental property created successfully",
        data: property,
      });
    } catch (error) {
      console.error("Create rental property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create rental property",
        error: error.message,
      });
    }
  }

  // Get rental property by ID
  async getRentalProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await rentalRepository.getRentalPropertyById(id);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found",
        });
      }

      // Increment view count (don't await to avoid blocking response)
      rentalRepository.incrementViewCount(id).catch(console.error);

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Get rental property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get rental property",
        error: error.message,
      });
    }
  }

  // Search and filter rental properties
  async searchRentalProperties(req, res) {
    try {
      const { error, value } = searchRentalPropertiesSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const result = await rentalRepository.searchRentalProperties(value);

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Search rental properties error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search rental properties",
        error: error.message,
      });
    }
  }

  // Get user's rental properties
  async getMyRentalProperties(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await rentalRepository.getRentalPropertiesByOwner(
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
      console.error("Get my rental properties error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get your rental properties",
        error: error.message,
      });
    }
  }

  // Update rental property
  async updateRentalProperty(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateRentalPropertySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await rentalRepository.updateRentalProperty(
        id,
        value,
        req.user.id
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found or you don't have permission to update it",
        });
      }

      res.json({
        success: true,
        message: "Rental property updated successfully",
        data: property,
      });
    } catch (error) {
      console.error("Update rental property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update rental property",
        error: error.message,
      });
    }
  }

  // Delete rental property
  async deleteRentalProperty(req, res) {
    try {
      const { id } = req.params;
      const deleted = await rentalRepository.deleteRentalProperty(id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found or you don't have permission to delete it",
        });
      }

      res.json({
        success: true,
        message: "Rental property deleted successfully",
      });
    } catch (error) {
      console.error("Delete rental property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete rental property",
        error: error.message,
      });
    }
  }

  // Verify rental property (Admin only)
  async verifyRentalProperty(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = verifyRentalPropertySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const property = await rentalRepository.verifyRentalProperty(
        id,
        value.isVerified
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found",
        });
      }

      res.json({
        success: true,
        message: `Rental property ${value.isVerified ? 'verified' : 'unverified'} successfully`,
        data: property,
      });
    } catch (error) {
      console.error("Verify rental property error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify rental property",
        error: error.message,
      });
    }
  }

  // INQUIRY CONTROLLERS

  // Create rental inquiry
  async createRentalInquiry(req, res) {
    try {
      const { id: propertyId } = req.params;
      const { error, value } = createRentalInquirySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Check if property exists
      const property = await rentalRepository.getRentalPropertyById(propertyId, false);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found",
        });
      }

      const inquiry = await rentalRepository.createRentalInquiry(
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
      console.error("Create rental inquiry error:", error);
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

      const result = await rentalRepository.getInquiriesForProperty(
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
      const result = await rentalRepository.getUserInquiries(
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
      const { error, value } = respondToInquirySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const inquiry = await rentalRepository.respondToInquiry(
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
      const property = await rentalRepository.getRentalPropertyById(propertyId, false);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Rental property not found",
        });
      }

      const result = await rentalRepository.addToFavorites(propertyId, req.user.id);

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
      const removed = await rentalRepository.removeFromFavorites(propertyId, req.user.id);

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
      const result = await rentalRepository.getUserFavorites(
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
      const isFavorited = await rentalRepository.isPropertyFavorited(
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

module.exports = new RentalController();