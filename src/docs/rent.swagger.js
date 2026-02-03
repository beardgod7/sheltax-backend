/**
 * @swagger
 * components:
 *   schemas:
 *     RentalProperty:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - propertyType
 *         - address
 *         - city
 *         - state
 *         - bedrooms
 *         - bathrooms
 *         - rentAmount
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the rental property
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Property title
 *         description:
 *           type: string
 *           minLength: 20
 *           maxLength: 2000
 *           description: Property description
 *         propertyType:
 *           type: string
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio]
 *           description: Type of property
 *         address:
 *           type: string
 *           description: Property address
 *         city:
 *           type: string
 *           description: City where property is located
 *         state:
 *           type: string
 *           description: State where property is located
 *         area:
 *           type: string
 *           description: Specific area/neighborhood
 *         bedrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           description: Number of bathrooms
 *         toilets:
 *           type: integer
 *           minimum: 0
 *           maximum: 20
 *           description: Number of toilets
 *         rentAmount:
 *           type: number
 *           description: Monthly/yearly rent amount
 *         currency:
 *           type: string
 *           default: NGN
 *           description: Currency code
 *         rentPeriod:
 *           type: string
 *           enum: [monthly, yearly]
 *           default: yearly
 *           description: Rent payment period
 *         securityDeposit:
 *           type: number
 *           description: Security deposit amount
 *         agentFee:
 *           type: number
 *           description: Agent fee amount
 *         serviceFee:
 *           type: number
 *           description: Service fee amount
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Property features
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: Property amenities
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Property images
 *         virtualTourUrl:
 *           type: string
 *           format: uri
 *           description: Virtual tour URL
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           description: Property availability status
 *         availableFrom:
 *           type: string
 *           format: date
 *           description: Date when property becomes available
 *         status:
 *           type: string
 *           enum: [active, rented, inactive, under_review]
 *           default: active
 *           description: Property status
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Verification status
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           description: Featured listing status
 *         tag:
 *           type: string
 *           enum: [rent, buy, swap, shortlet]
 *           default: rent
 *           description: Property tag/category
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     RentalInquiry:
 *       type: object
 *       required:
 *         - message
 *         - inquirerName
 *         - inquirerEmail
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the inquiry
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Inquiry message
 *         inquirerName:
 *           type: string
 *           description: Name of the person making inquiry
 *         inquirerEmail:
 *           type: string
 *           format: email
 *           description: Email of the person making inquiry
 *         inquirerPhone:
 *           type: string
 *           description: Phone number of the person making inquiry
 *         inquiryType:
 *           type: string
 *           enum: [viewing_request, rental_inquiry, general_question]
 *           default: rental_inquiry
 *           description: Type of inquiry
 *         preferredViewingDate:
 *           type: string
 *           format: date-time
 *           description: Preferred viewing date
 *         status:
 *           type: string
 *           enum: [pending, responded, viewing_scheduled, closed]
 *           default: pending
 *           description: Inquiry status
 *         response:
 *           type: string
 *           description: Response to the inquiry
 *         respondedAt:
 *           type: string
 *           format: date-time
 *           description: Response timestamp
 *
 *     RentalFavorite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the favorite
 *         propertyId:
 *           type: string
 *           format: uuid
 *           description: ID of the favorited property
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who favorited
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: Current page number
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *         totalItems:
 *           type: integer
 *           description: Total number of items
 *         itemsPerPage:
 *           type: integer
 *           description: Number of items per page
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *
 * /v1/api/rent/search:
 *   get:
 *     summary: Search and filter rental properties
 *     tags: [Rental Properties]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for title, description, or address
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio]
 *         description: Filter by property type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *       - in: query
 *         name: minBedrooms
 *         schema:
 *           type: integer
 *         description: Minimum number of bedrooms
 *       - in: query
 *         name: maxBedrooms
 *         schema:
 *           type: integer
 *         description: Maximum number of bedrooms
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           enum: [rent, buy, swap, shortlet]
 *         description: Filter by property tag
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rentAmount, createdAt, updatedAt, bedrooms, bathrooms, title]
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
 *         description: Properties retrieved successfully
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
 *                     $ref: '#/components/schemas/RentalProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/rent/{id}:
 *   get:
 *     summary: Get rental property by ID
 *     tags: [Rental Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RentalProperty'
 *       404:
 *         description: Property not found
 *
 * /v1/api/rent:
 *   post:
 *     summary: Create a new rental property
 *     tags: [Rental Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentalProperty'
 *     responses:
 *       201:
 *         description: Property created successfully
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
 *                   $ref: '#/components/schemas/RentalProperty'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Owner/Broker role required
 *
 * /v1/api/rent/my/properties:
 *   get:
 *     summary: Get user's rental properties
 *     tags: [Rental Properties]
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
 *         description: Properties retrieved successfully
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
 *                     $ref: '#/components/schemas/RentalProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/rent/{id}/inquiries:
 *   post:
 *     summary: Create inquiry for a rental property
 *     tags: [Rental Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentalInquiry'
 *     responses:
 *       201:
 *         description: Inquiry sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *       404:
 *         description: Property not found
 *
 * /v1/api/rent/{id}/favorites:
 *   post:
 *     summary: Add property to favorites
 *     tags: [Rental Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       201:
 *         description: Property added to favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *       404:
 *         description: Property not found
 *       409:
 *         description: Property already in favorites
 *
 *   delete:
 *     summary: Remove property from favorites
 *     tags: [Rental Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property removed from favorites
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker role required
 *       404:
 *         description: Property not found in favorites
 */