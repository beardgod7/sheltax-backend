/**
 * @swagger
 * components:
 *   schemas:
 *     SeekerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         emailAddress:
 *           type: string
 *           format: email
 *           description: Auto-populated from user registration
 *         stateOfResidence:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         profilePicture:
 *           type: string
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             surname:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             role:
 *               type: string
 *             verified:
 *               type: boolean
 *
 *     BrokerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         emailAddress:
 *           type: string
 *           format: email
 *           description: Auto-populated from registration
 *         agencyCompanyName:
 *           type: string
 *         companyYearsOfExistence:
 *           type: string
 *         operatingLocations:
 *           type: array
 *           items:
 *             type: string
 *         companySize:
 *           type: string
 *         portfolioSummary:
 *           type: string
 *         profilePicture:
 *           type: string
 *         governmentId:
 *           type: string
 *         ninCacDocument:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             surname:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             brokerProfileType:
 *               type: string
 *             yearsOfExperience:
 *               type: integer
 *             bio:
 *               type: string
 *             specialization:
 *               type: string
 *             role:
 *               type: string
 *             verified:
 *               type: boolean
 *
 *     OwnerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         emailAddress:
 *           type: string
 *           format: email
 *           description: Auto-populated from registration
 *         location:
 *           type: string
 *         propertyTypes:
 *           type: array
 *           items:
 *             type: string
 *         listingIntent:
 *           type: string
 *         ownerType:
 *           type: string
 *         profilePicture:
 *           type: string
 *         governmentId:
 *           type: string
 *         ninCacDocument:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             surname:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             role:
 *               type: string
 *             verified:
 *               type: boolean
 *
 *     SeekerPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         profileId:
 *           type: string
 *           format: uuid
 *         preferredPropertyType:
 *           type: string
 *           enum: [apartment, house, condo, townhouse, studio, any]
 *         preferredLocation:
 *           type: string
 *         budgetMin:
 *           type: number
 *         budgetMax:
 *           type: number
 *         preferredBedrooms:
 *           type: integer
 *         preferredBathrooms:
 *           type: integer
 *         occupation:
 *           type: string
 *         monthlyIncome:
 *           type: number
 *         employmentStatus:
 *           type: string
 *           enum: [employed, self_employed, unemployed, student, retired]
 *         preferredCity:
 *           type: string
 *         preferredState:
 *           type: string
 *         preferredZipCode:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /profile/seeker:
 *   post:
 *     summary: Create seeker profile (Step 2 for seekers)
 *     description: Complete seeker profile with personal details after signup and password set
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stateOfResidence
 *               - gender
 *               - dateOfBirth
 *             properties:
 *               stateOfResidence:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Seeker profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/SeekerProfile'
 *       409:
 *         description: Profile already exists
 *
 * /profile/owner:
 *   post:
 *     summary: Create owner profile (Step 2 for owners)
 *     description: |
 *       Complete owner profile with property information.
 *       Called after signup, OTP verification, and password set.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - propertyTypes
 *               - listingIntent
 *               - ownerType
 *             properties:
 *               location:
 *                 type: string
 *                 description: Property/owner location
 *               propertyTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of property types owned
 *               listingIntent:
 *                 type: string
 *                 description: Intent for listing (e.g., rent, sell, both)
 *               ownerType:
 *                 type: string
 *                 description: Type of owner (e.g., individual, company)
 *     responses:
 *       201:
 *         description: Owner profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/OwnerProfile'
 *       409:
 *         description: Owner profile already exists
 *
 * /profile/owner/verify-identity:
 *   post:
 *     summary: Owner identity verification (Step 3 for owners)
 *     description: |
 *       Upload verification documents for owner identity.
 *       Accepts multipart form data with profile picture, government ID, and NIN/CAC document.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file
 *               governmentId:
 *                 type: string
 *                 format: binary
 *                 description: Government-issued ID file
 *               ninCacDocument:
 *                 type: string
 *                 format: binary
 *                 description: NIN or CAC document file
 *     responses:
 *       200:
 *         description: Identity verification documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/OwnerProfile'
 *       400:
 *         description: No verification documents provided
 *       404:
 *         description: Owner profile not found
 *
 * /profile/broker:
 *   post:
 *     summary: Create broker profile (Step 2 for brokers)
 *     description: |
 *       Complete broker profile with company/agency information.
 *       Called after signup, OTP verification, and password set.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agencyCompanyName:
 *                 type: string
 *                 description: Agency or company name
 *               companyYearsOfExistence:
 *                 type: string
 *                 description: How long the company has existed
 *               operatingLocations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of operating locations
 *               companySize:
 *                 type: string
 *                 description: Size of the company
 *               portfolioSummary:
 *                 type: string
 *                 description: Summary of portfolio (max 2000 chars)
 *     responses:
 *       201:
 *         description: Broker profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/BrokerProfile'
 *       409:
 *         description: Broker profile already exists
 *
 * /profile/broker/verify-identity:
 *   post:
 *     summary: Broker identity verification (Step 3 for brokers)
 *     description: |
 *       Upload verification documents for broker identity.
 *       Accepts multipart form data with profile picture, government ID, and NIN/CAC document.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file
 *               governmentId:
 *                 type: string
 *                 format: binary
 *                 description: Government-issued ID file
 *               ninCacDocument:
 *                 type: string
 *                 format: binary
 *                 description: NIN or CAC document file
 *     responses:
 *       200:
 *         description: Identity verification documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/BrokerProfile'
 *       400:
 *         description: No verification documents provided
 *       404:
 *         description: Broker profile not found
 *
 * /profile/seeker/preferences:
 *   post:
 *     summary: Create seeker preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredPropertyType:
 *                 type: string
 *                 enum: [apartment, house, condo, townhouse, studio, any]
 *               preferredLocation:
 *                 type: string
 *               budgetMin:
 *                 type: number
 *               budgetMax:
 *                 type: number
 *               preferredBedrooms:
 *                 type: integer
 *               preferredBathrooms:
 *                 type: integer
 *               occupation:
 *                 type: string
 *               monthlyIncome:
 *                 type: number
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self_employed, unemployed, student, retired]
 *               preferredCity:
 *                 type: string
 *               preferredState:
 *                 type: string
 *               preferredZipCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seeker preferences created successfully
 *       404:
 *         description: Seeker profile not found
 *
 *   put:
 *     summary: Update seeker preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredPropertyType:
 *                 type: string
 *                 enum: [apartment, house, condo, townhouse, studio, any]
 *               preferredLocation:
 *                 type: string
 *               budgetMin:
 *                 type: number
 *               budgetMax:
 *                 type: number
 *               preferredBedrooms:
 *                 type: integer
 *               preferredBathrooms:
 *                 type: integer
 *               occupation:
 *                 type: string
 *               monthlyIncome:
 *                 type: number
 *               employmentStatus:
 *                 type: string
 *                 enum: [employed, self_employed, unemployed, student, retired]
 *               preferredCity:
 *                 type: string
 *               preferredState:
 *                 type: string
 *               preferredZipCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seeker preferences updated successfully
 *       404:
 *         description: Seeker profile not found
 *
 * /profile:
 *   put:
 *     summary: Update user profile (works for all profile types)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Profile fields to update (varies by user role)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 *
 *   get:
 *     summary: Get all profiles (Admin only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [broker, owner, seeker]
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 *
 * /profile/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/SeekerProfile'
 *                     - $ref: '#/components/schemas/BrokerProfile'
 *                     - $ref: '#/components/schemas/OwnerProfile'
 *                 hasProfile:
 *                   type: boolean
 *
 * /profile/public/{id}:
 *   get:
 *     summary: Get public profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [broker, owner, seeker]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       400:
 *         description: Valid type parameter is required
 *       404:
 *         description: Profile not found
 *
 * /profile/role/{role}:
 *   get:
 *     summary: Get profiles by role
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [broker, owner, seeker]
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       400:
 *         description: Invalid role
 *
 * /profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: No profile picture uploaded
 *       404:
 *         description: Profile not found
 *
 * /profile/verification-documents:
 *   post:
 *     summary: Upload verification documents (JSON)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [license, id_card, certificate, nin, other]
 *                     url:
 *                       type: string
 *                       format: uri
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Verification documents uploaded successfully
 *       404:
 *         description: Profile not found
 *
 * /profile/verify/{userId}:
 *   patch:
 *     summary: Update profile verification status (Admin only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *               - role
 *             properties:
 *               isVerified:
 *                 type: boolean
 *               role:
 *                 type: string
 *                 enum: [broker, owner, seeker]
 *     responses:
 *       200:
 *         description: Profile verification status updated
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Profile not found
 */
