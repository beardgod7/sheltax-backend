/**
 * @swagger
 * components:
 *   schemas:
 *     PropertyRequest:
 *       type: object
 *       required:
 *         - category
 *         - minimumBudget
 *         - maximumBudget
 *         - state
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the property request
 *         seekerId:
 *           type: string
 *           format: uuid
 *           description: ID of the seeker who created the request
 *         category:
 *           type: string
 *           enum: [rent, buy, shortlet]
 *           description: Type of property request
 *         minimumBudget:
 *           type: number
 *           description: Minimum budget
 *         maximumBudget:
 *           type: number
 *           description: Maximum budget
 *         currency:
 *           type: string
 *           default: NGN
 *           description: Currency code
 *         state:
 *           type: string
 *           description: Preferred state
 *         locality:
 *           type: string
 *           description: Specific area/neighborhood
 *         numberOfBedrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           description: Preferred number of bedrooms
 *         numberOfBathrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           description: Preferred number of bathrooms
 *         propertyType:
 *           type: string
 *           description: Preferred property type
 *         otherInformation:
 *           type: string
 *           description: Additional details or special requirements
 *         status:
 *           type: string
 *           enum: [active, fulfilled, cancelled, expired]
 *           default: active
 *           description: Request status
 *         urgency:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           description: Request urgency level
 *         desiredMoveInDate:
 *           type: string
 *           format: date
 *           description: Desired move-in date (for rent/shortlet)
 *         stayDuration:
 *           type: integer
 *           description: Duration in days (for shortlet requests)
 *         responseCount:
 *           type: integer
 *           default: 0
 *           description: Number of responses received
 *         viewCount:
 *           type: integer
 *           default: 0
 *           description: Number of views
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Request expiration date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     PropertyRequestResponse:
 *       type: object
 *       required:
 *         - message
 *         - contactName
 *         - contactPhone
 *         - contactEmail
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the response
 *         requestId:
 *           type: string
 *           format: uuid
 *           description: ID of the property request
 *         responderId:
 *           type: string
 *           format: uuid
 *           description: ID of the broker/owner responding
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Response message
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: Reference to a specific property listing (optional)
 *         propertyType:
 *           type: string
 *           description: Type of property being offered
 *         propertyLocation:
 *           type: string
 *           description: Location of the property
 *         propertyPrice:
 *           type: number
 *           description: Price of the property
 *         propertyImages:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Property images
 *         propertyDescription:
 *           type: string
 *           description: Property description
 *         contactName:
 *           type: string
 *           description: Contact person name
 *         contactPhone:
 *           type: string
 *           description: Contact phone number
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Contact email address
 *         status:
 *           type: string
 *           enum: [pending, viewed, interested, rejected, accepted]
 *           default: pending
 *           description: Response status
 *         seekerFeedback:
 *           type: string
 *           description: Feedback from the seeker
 *         seekerRating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given by the seeker
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 * /v1/api/property-requests/search:
 *   get:
 *     summary: Search property requests (Brokers/Owners view all active requests)
 *     tags: [Property Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [rent, buy, shortlet]
 *         description: Filter by category
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, fulfilled, cancelled, expired]
 *         description: Filter by status
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by urgency
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *         description: Minimum budget filter
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *         description: Maximum budget filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, minimumBudget, maximumBudget, urgency, responseCount]
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Property requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyRequest'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Broker/Owner role required
 *
 * /v1/api/property-requests/{id}:
 *   get:
 *     summary: Get property request by ID
 *     tags: [Property Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property request ID
 *     responses:
 *       200:
 *         description: Property request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PropertyRequest'
 *       404:
 *         description: Property request not found
 *
 * /v1/api/property-requests:
 *   post:
 *     summary: Create a new property request (Seeker only)
 *     tags: [Property Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - minimumBudget
 *               - maximumBudget
 *               - state
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [rent, buy, shortlet]
 *               minimumBudget:
 *                 type: number
 *               maximumBudget:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: NGN
 *               state:
 *                 type: string
 *               locality:
 *                 type: string
 *               numberOfBedrooms:
 *                 type: integer
 *               numberOfBathrooms:
 *                 type: integer
 *               propertyType:
 *                 type: string
 *               otherInformation:
 *                 type: string
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               desiredMoveInDate:
 *                 type: string
 *                 format: date
 *               stayDuration:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Property request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PropertyRequest'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *
 * /v1/api/property-requests/my/requests:
 *   get:
 *     summary: Get seeker's own property requests
 *     tags: [Property Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyRequest'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/property-requests/{id}/responses:
 *   post:
 *     summary: Create response to property request (Broker/Owner only)
 *     tags: [Property Request Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - contactName
 *               - contactPhone
 *               - contactEmail
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               propertyType:
 *                 type: string
 *               propertyLocation:
 *                 type: string
 *               propertyPrice:
 *                 type: number
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               propertyDescription:
 *                 type: string
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Response sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PropertyRequestResponse'
 *       400:
 *         description: Validation error or request not active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Broker/Owner role required
 *       404:
 *         description: Property request not found
 *
 *   get:
 *     summary: Get responses for a request (Seeker views responses to their request)
 *     tags: [Property Request Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property request ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Responses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyRequestResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *       404:
 *         description: Request not found or no permission
 *
 * /v1/api/property-requests/my/responses:
 *   get:
 *     summary: Get broker/owner's own responses
 *     tags: [Property Request Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Responses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PropertyRequestResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/property-requests/responses/{responseId}/status:
 *   put:
 *     summary: Update response status (Seeker updates status of responses they received)
 *     tags: [Property Request Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Response ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, viewed, interested, rejected, accepted]
 *               seekerFeedback:
 *                 type: string
 *                 maxLength: 500
 *               seekerRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Response status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PropertyRequestResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *       404:
 *         description: Response not found or no permission
 */