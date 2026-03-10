/**
 * @swagger
 * components:
 *   schemas:
 *     SaleProperty:
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
 *         - salePrice
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the sale property
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
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio, land, commercial]
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
 *         salePrice:
 *           type: number
 *           description: Sale price of the property
 *         currency:
 *           type: string
 *           default: NGN
 *           description: Currency code
 *         propertyAge:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Age of property in years
 *         landSize:
 *           type: number
 *           description: Land size in square meters
 *         builtUpArea:
 *           type: number
 *           description: Built-up area in square meters
 *         titleDocument:
 *           type: string
 *           enum: [certificate_of_occupancy, deed_of_assignment, survey_plan, governors_consent, other]
 *           description: Type of title document
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
 *         status:
 *           type: string
 *           enum: [active, sold, inactive, under_review]
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
 *           default: buy
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
 *     SaleInquiry:
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
 *           enum: [purchase_inquiry, viewing_request, price_negotiation, general_question]
 *           default: purchase_inquiry
 *           description: Type of inquiry
 *         offerAmount:
 *           type: number
 *           description: Buyer's offer amount
 *         preferredViewingDate:
 *           type: string
 *           format: date-time
 *           description: Preferred viewing date
 *         status:
 *           type: string
 *           enum: [pending, responded, viewing_scheduled, offer_made, closed]
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
 *     SaleFavorite:
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
 * /buy/search:
 *   get:
 *     summary: Search and filter sale properties
 *     tags: [Sale Properties]
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
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio, land, commercial]
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
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum sale price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum sale price
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
 *         name: titleDocument
 *         schema:
 *           type: string
 *           enum: [certificate_of_occupancy, deed_of_assignment, survey_plan, governors_consent, other]
 *         description: Filter by title document type
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
 *           enum: [salePrice, createdAt, updatedAt, bedrooms, bathrooms, title, propertyAge, landSize]
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
 *                     $ref: '#/components/schemas/SaleProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /buy/{id}:
 *   get:
 *     summary: Get sale property by ID
 *     tags: [Sale Properties]
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
 *                   $ref: '#/components/schemas/SaleProperty'
 *       404:
 *         description: Property not found
 *
 * /buy:
 *   post:
 *     summary: Create a new sale property
 *     tags: [Sale Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleProperty'
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
 *                   $ref: '#/components/schemas/SaleProperty'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Owner/Broker role required
 *
 * /buy/my/properties:
 *   get:
 *     summary: Get user's sale properties
 *     tags: [Sale Properties]
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
 *                     $ref: '#/components/schemas/SaleProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /buy/{id}/inquiries:
 *   post:
 *     summary: Create inquiry for a sale property
 *     tags: [Sale Inquiries]
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
 *             $ref: '#/components/schemas/SaleInquiry'
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
 * /buy/{id}/favorites:
 *   post:
 *     summary: Add property to favorites
 *     tags: [Sale Favorites]
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
 *     tags: [Sale Favorites]
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
