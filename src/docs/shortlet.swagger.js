/**
 * @swagger
 * components:
 *   schemas:
 *     ShortletProperty:
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
 *         - maxGuests
 *         - pricePerNight
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the shortlet property
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
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio, hotel, resort]
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
 *         maxGuests:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Maximum number of guests allowed
 *         pricePerNight:
 *           type: number
 *           description: Price per night
 *         pricePerWeek:
 *           type: number
 *           description: Price per week
 *         pricePerMonth:
 *           type: number
 *           description: Price per month
 *         currency:
 *           type: string
 *           default: NGN
 *           description: Currency code
 *         securityDeposit:
 *           type: number
 *           description: Security deposit amount
 *         cleaningFee:
 *           type: number
 *           description: Cleaning fee amount
 *         serviceFee:
 *           type: number
 *           description: Service fee amount
 *         minimumStay:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Minimum number of nights
 *         maximumStay:
 *           type: integer
 *           minimum: 1
 *           description: Maximum number of nights
 *         checkInTime:
 *           type: string
 *           format: time
 *           default: "15:00:00"
 *           description: Check-in time
 *         checkOutTime:
 *           type: string
 *           format: time
 *           default: "11:00:00"
 *           description: Check-out time
 *         instantBooking:
 *           type: boolean
 *           default: false
 *           description: Allow instant booking without approval
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
 *         houseRules:
 *           type: array
 *           items:
 *             type: string
 *           description: House rules
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
 *         availableTo:
 *           type: string
 *           format: date
 *           description: Date until property is available
 *         status:
 *           type: string
 *           enum: [active, booked, inactive, under_review]
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
 *           default: shortlet
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
 *     ShortletInquiry:
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
 *           enum: [booking_inquiry, availability_check, general_question]
 *           default: booking_inquiry
 *           description: Type of inquiry
 *         checkInDate:
 *           type: string
 *           format: date
 *           description: Desired check-in date
 *         checkOutDate:
 *           type: string
 *           format: date
 *           description: Desired check-out date
 *         numberOfGuests:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Number of guests
 *         status:
 *           type: string
 *           enum: [pending, responded, booking_confirmed, closed]
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
 *     ShortletFavorite:
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
 * /v1/api/shortlet/search:
 *   get:
 *     summary: Search and filter shortlet properties
 *     tags: [Shortlet Properties]
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
 *           enum: [apartment, house, duplex, bungalow, flat, room, studio, hotel, resort]
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
 *         name: minPricePerNight
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *       - in: query
 *         name: maxPricePerNight
 *         schema:
 *           type: number
 *         description: Maximum price per night
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
 *         name: minGuests
 *         schema:
 *           type: integer
 *         description: Minimum guest capacity
 *       - in: query
 *         name: maxGuests
 *         schema:
 *           type: integer
 *         description: Maximum guest capacity
 *       - in: query
 *         name: checkInDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Desired check-in date
 *       - in: query
 *         name: checkOutDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Desired check-out date
 *       - in: query
 *         name: instantBooking
 *         schema:
 *           type: boolean
 *         description: Filter by instant booking availability
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
 *           enum: [pricePerNight, createdAt, updatedAt, bedrooms, bathrooms, maxGuests, title]
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
 *                     $ref: '#/components/schemas/ShortletProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/shortlet/{id}:
 *   get:
 *     summary: Get shortlet property by ID
 *     tags: [Shortlet Properties]
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
 *                   $ref: '#/components/schemas/ShortletProperty'
 *       404:
 *         description: Property not found
 *
 * /v1/api/shortlet:
 *   post:
 *     summary: Create a new shortlet property
 *     tags: [Shortlet Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortletProperty'
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
 *                   $ref: '#/components/schemas/ShortletProperty'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Owner/Broker role required
 *
 * /v1/api/shortlet/my/properties:
 *   get:
 *     summary: Get user's shortlet properties
 *     tags: [Shortlet Properties]
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
 *                     $ref: '#/components/schemas/ShortletProperty'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *
 * /v1/api/shortlet/{id}/inquiries:
 *   post:
 *     summary: Create inquiry for a shortlet property
 *     tags: [Shortlet Inquiries]
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
 *             $ref: '#/components/schemas/ShortletInquiry'
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
 * /v1/api/shortlet/{id}/favorites:
 *   post:
 *     summary: Add property to favorites
 *     tags: [Shortlet Favorites]
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
 *     tags: [Shortlet Favorites]
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