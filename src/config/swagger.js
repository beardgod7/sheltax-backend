const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sheltax Backend API",
      version: "1.0.0",
      description: "Real Estate Platform API for property seekers, agents, and owners",
      contact: {
        name: "API Support",
        email: "support@sheltax.com",
      },
    },
    servers: [
      {
        url: "https://sheltax-backend.onrender.com/v1/api",
        description: "Production server",
      },
      {
        url: `http://localhost:${process.env.PORT || 7001}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Access denied. No token provided.",
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "User does not have permission to perform this action",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "Forbidden: You do not have permission to perform this action.",
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Resource not found",
                  },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: "Invalid request parameters",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Invalid request parameters",
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Internal Server Error",
                  },
                  error: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Registration, login, OTP, password management. See each endpoint for per-role examples.",
      },
      {
        name: "Profile",
        description: "Profile management (all roles)",
      },
      {
        name: "Rental Properties",
        description: "Rental property management",
      },
      {
        name: "Sale Properties",
        description: "Sale property management",
      },
      {
        name: "Shortlet Properties",
        description: "Shortlet property management",
      },
      {
        name: "Property Requests",
        description: "Property request management (seekers post, brokers/owners respond)",
      },
    ],
  },
  apis: [
    "./src/docs/auth.swagger.js",
    "./src/docs/profile.swagger.js",
    "./src/docs/rent.swagger.js",
    "./src/docs/buy.swagger.js",
    "./src/docs/shortlet.swagger.js",
    "./src/docs/property-request.swagger.js",
    "./src/features/Authentication/routes.js",
    "./src/features/Profile/routes.js",
    "./src/features/Rent/routes.js",
    "./src/features/Buy/routes.js",
    "./src/features/Shortlet/routes.js",
    "./src/features/PropertyRequest/routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
