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
        url: "http://localhost:7000/v1/api",
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
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Profile",
        description: "User profile management endpoints",
      },
    ],
  },
  apis: [
    "./src/docs/auth.swagger.js",
    "./src/docs/profile.swagger.js",
    "./src/features/Authentication/routes.js",
    "./src/features/Profile/routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
