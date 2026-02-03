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
 *         firstName:
 *           type: string
 *         surname:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         emailAddress:
 *           type: string
 *           format: email
 *         stateOfResidence:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         ninVerification:
 *           type: string
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
 *         firstName:
 *           type: string
 *         surname:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         emailAddress:
 *           type: string
 *           format: email
 *         stateOfResidence:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         ninVerification:
 *           type: string
 *         profilePicture:
 *           type: string
 *         agencyCompanyName:
 *           type: string
 *           description: Agency/Company Name (Optional)
 *         agentLicenseNumber:
 *           type: string
 *           description: Agent License Number (Optional)
 *         yearsOfExperience:
 *           type: integer
 *         specialization:
 *           type: string
 *         bio:
 *           type: string
 *         website:
 *           type: string
 *         linkedinProfile:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 *         averageRating:
 *           type: number
 *           format: float
 *         totalReviews:
 *           type: integer
 *         isVerified:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *         firstName:
 *           type: string
 *         surname:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         emailAddress:
 *           type: string
 *           format: email
 *         stateOfResidence:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         ninVerification:
 *           type: string
 *         profilePicture:
 *           type: string
 *         ownerType:
 *           type: string
 *           enum: [individual, company, investment_group]
 *           description: Required - Type of owner
 *         companyName:
 *           type: string
 *         businessRegistrationNumber:
 *           type: string
 *         bio:
 *           type: string
 *         website:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 *         totalProperties:
 *           type: integer
 *         activeListings:
 *           type: integer
 *         averageRating:
 *           type: number
 *           format: float
 *         totalReviews:
 *           type: integer
 *         isVerified:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *     summary: Create seeker profile
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
 *               - firstName
 *               - surname
 *               - phoneNumber
 *               - emailAddress
 *               - stateOfResidence
 *               - gender
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               stateOfResidence:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               ninVerification:
 *                 type: string
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
 * /profile/broker:
 *   post:
 *     summary: Create broker profile
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
 *               - firstName
 *               - surname
 *               - phoneNumber
 *               - emailAddress
 *               - stateOfResidence
 *               - gender
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               stateOfResidence:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               ninVerification:
 *                 type: string
 *               agencyCompanyName:
 *                 type: string
 *               agentLicenseNumber:
 *                 type: string
 *               yearsOfExperience:
 *                 type: integer
 *               specialization:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *               linkedinProfile:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
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
 * /profile/owner:
 *   post:
 *     summary: Create owner profile
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
 *               - firstName
 *               - surname
 *               - phoneNumber
 *               - emailAddress
 *               - stateOfResidence
 *               - gender
 *               - dateOfBirth
 *               - ownerType
 *             properties:
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               stateOfResidence:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               ninVerification:
 *                 type: string
 *               ownerType:
 *                 type: string
 *                 enum: [individual, company, investment_group]
 *               companyName:
 *                 type: string
 *               businessRegistrationNumber:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   $ref: '#/components/schemas/SeekerPreference'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   $ref: '#/components/schemas/SeekerPreference'
 *       404:
 *         description: Seeker profile not found
 *
 * * /profile:
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
 *             description: Profile fields to update (varies by user role - seeker/broker/owner)
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
 *         description: Filter by state
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [broker, owner, seeker]
 *         description: Filter by user role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by gender
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
 *       404:
 *         description: Profile not found
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
 *         description: Profile type (required to determine profile type)
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
 *                   type: object
 *                   description: Public profile data (sensitive info excluded)
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
 *         description: Filter by state
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating filter (for brokers)
 *       - in: query
 *         name: budgetMin
 *         schema:
 *           type: number
 *         description: Minimum budget filter (for seekers)
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *         description: Maximum budget filter (for seekers)
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
 *     summary: Upload verification documents
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
 *                 description: User role (required to determine profile type)
 *     responses:
 *       200:
 *         description: Profile verification status updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Profile not found
 */