/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         surname:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         username:
 *           type: string
 *         ninVerification:
 *           type: string
 *           description: NIN verification (optional, for seekers)
 *         brokerProfileType:
 *           type: string
 *           description: Broker profile type (for brokers only)
 *         yearsOfExperience:
 *           type: integer
 *           description: Years of experience (for brokers only)
 *         bio:
 *           type: string
 *           description: Bio (for brokers only)
 *         specialization:
 *           type: string
 *           description: Specialization (for brokers only)
 *         googleId:
 *           type: string
 *           description: Google account ID
 *         twitterId:
 *           type: string
 *           description: Twitter account ID
 *         facebookId:
 *           type: string
 *           description: Facebook account ID
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *         signup_channel:
 *           type: string
 *           enum: [manual, google, twitter, facebook]
 *           description: How the user signed up
 *         role:
 *           type: string
 *           enum: [seeker, owner, broker, admin, super_admin]
 *         verified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /auth/signup:
 *   post:
 *     summary: Register a new user (Step 1 - no password)
 *     description: |
 *       Creates a new user account. Password is NOT set at this stage.
 *       After signup, user receives an OTP via email for verification.
 *       Flow: signup -> verify OTP -> set password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *               - firstName
 *               - surname
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [seeker, owner, broker]
 *                 description: |
 *                   User role determines access level and profile type:
 *                   - `seeker` - Property seeker/tenant
 *                   - `owner` - Property owner
 *                   - `broker` - Real estate broker/agent
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               surname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number (10-15 digits, optional + prefix)
 *               ninVerification:
 *                 type: string
 *                 description: NIN verification (optional, for seekers)
 *               brokerProfileType:
 *                 type: string
 *                 description: Required when role is broker
 *               yearsOfExperience:
 *                 type: integer
 *                 description: Optional, for brokers
 *               bio:
 *                 type: string
 *                 description: Optional, for brokers (max 2000 chars)
 *               specialization:
 *                 type: string
 *                 description: Optional, for brokers
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Validation error
 *       409:
 *         description: Account already exists
 *
 * /auth/complete-profile:
 *   post:
 *     summary: "Step 2: Complete profile (Owner/Broker only)"
 *     description: |
 *       Owner fields: location, propertyTypes, listingIntent, ownerType
 *       Broker fields: agencyCompanyName, companyYearsOfExistence, operatingLocations, companySize, portfolioSummary
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               location:
 *                 type: string
 *                 description: Owner only - state/area
 *               propertyTypes:
 *                 type: string
 *                 description: Owner only - apartment, house, etc.
 *               listingIntent:
 *                 type: string
 *                 description: Owner only - rent/sale/both
 *               ownerType:
 *                 type: string
 *                 description: Owner only - who do you identify as
 *               agencyCompanyName:
 *                 type: string
 *                 description: Broker only
 *               companyYearsOfExistence:
 *                 type: string
 *                 description: Broker only
 *               operatingLocations:
 *                 type: string
 *                 description: Broker only (required)
 *               companySize:
 *                 type: string
 *                 description: Broker only
 *               portfolioSummary:
 *                 type: string
 *                 description: Broker only
 *     responses:
 *       200:
 *         description: Profile saved. Proceed to verify-identity.
 *       400:
 *         description: Validation error or wrong role
 *       404:
 *         description: User not found
 *
 * /auth/verify-identity:
 *   post:
 *     summary: "Step 3: Upload identity documents (Owner/Broker only)"
 *     description: Upload profile picture, government ID, and NIN/CAC document. Sends OTP after upload.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture or company logo
 *               governmentId:
 *                 type: string
 *                 format: binary
 *                 description: Valid government ID (passport, driver's license, national ID)
 *               ninCacDocument:
 *                 type: string
 *                 format: binary
 *                 description: NIN or CAC document (if company)
 *     responses:
 *       200:
 *         description: Documents uploaded. OTP sent to email.
 *       400:
 *         description: Wrong role
 *       404:
 *         description: User not found
 *
 * /auth/set-password:
 *   post:
 *     summary: Set password after OTP verification (Step 3)
 *     description: |
 *       Sets the user's password after they have verified their email via OTP.
 *       User must be verified before calling this endpoint.
 *       Returns access and refresh tokens on success.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match password
 *     responses:
 *       200:
 *         description: Password set successfully, user is logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 verification:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Validation error or password already set
 *       403:
 *         description: Account not verified
 *       404:
 *         description: User not found
 *
 * /auth/verify/{code}:
 *   get:
 *     summary: Verify email with OTP code (Step 2)
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 6-digit OTP verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *       400:
 *         description: Invalid or expired verification code
 *       404:
 *         description: User not found
 *
 * /auth/google-oauth:
 *   post:
 *     summary: Login or signup with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token received from Google OAuth
 *     responses:
 *       200:
 *         description: Google OAuth successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 verification:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *       400:
 *         description: Invalid Google token or unverified email
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /auth/twitter-oauth:
 *   post:
 *     summary: Login or signup with Twitter OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oauth_token
 *               - oauth_verifier
 *             properties:
 *               oauth_token:
 *                 type: string
 *                 description: Twitter OAuth token
 *               oauth_verifier:
 *                 type: string
 *                 description: Twitter OAuth verifier
 *     responses:
 *       200:
 *         description: Twitter OAuth successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 verification:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *       400:
 *         description: Invalid Twitter OAuth credentials
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /auth/facebook-oauth:
 *   post:
 *     summary: Login or signup with Facebook OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Facebook access token
 *     responses:
 *       200:
 *         description: Facebook OAuth successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 verification:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *       400:
 *         description: Invalid Facebook access token
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Authenticates user with email/username and password.
 *       User must have set their password (via /auth/set-password) before login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                 verification:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified or password not set
 *
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset code sent
 *
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 * /auth/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 * /auth/all-user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 * /auth/approve/{id}:
 *   patch:
 *     summary: Approve user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User approved successfully
 */
