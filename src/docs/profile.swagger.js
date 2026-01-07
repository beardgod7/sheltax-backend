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
 *
 *     AgentProfile:
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
 *         profilePicture:
 *           type: string
 *         agencyCompanyName:
 *           type: string
 *           description: Agency/Company Name (if applicable)
 *         agentLicense:
 *           type: string
 *           description: Agent License (Optional)
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
 *         averageRating:
 *           type: number
 *           format: float
 *         totalReviews:
 *           type: integer
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
 *         profilePicture:
 *           type: string
 *         ownerType:
 *           type: string
 *           enum: [individual, company, investment_group]
 *         companyName:
 *           type: string
 *         businessRegistrationNumber:
 *           type: string
 *         bio:
 *           type: string
 *         website:
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
 *         isComplete:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /profile:
 *   post:
 *     summary: Create user profile (role-specific)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/SeekerProfile'
 *               - $ref: '#/components/schemas/AgentProfile'
 *               - $ref: '#/components/schemas/OwnerProfile'
 *             discriminator:
 *               propertyName: role
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   type: object
 *       409:
 *         description: Profile already exists
 *
 *   put:
 *     summary: Update user profile
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
 *         description: Filter by state
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [agent, owner, seeker]
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
 *                     - $ref: '#/components/schemas/AgentProfile'
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
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [agent, owner, seeker]
 *         description: User role (required to determine profile type)
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
 *         description: Valid role parameter is required
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
 *           enum: [agent, owner, seeker]
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
 *         description: Minimum rating filter (for agents)
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
 *                 enum: [agent, owner, seeker]
 *                 description: User role (required to determine profile type)
 *     responses:
 *       200:
 *         description: Profile verification status updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Profile not found
 */