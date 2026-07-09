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
 *         role:
 *           type: string
 *           enum: [seeker, owner, broker, admin, super_admin]
 *         verified:
 *           type: boolean
 *         registrationStep:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /auth/signup:
 *   post:
 *     summary: "Step 1: Register new user (all roles)"
 *     description: |
 *       ## Registration Flows
 *
 *       ### 🔵 Seeker (3-step flow)
 *       Send: role, firstName, surname, phoneNumber, email, ninVerification
 *       → OTP is sent immediately → next: verify OTP → set password
 *
 *       ### 🟡 Owner (5-step flow)
 *       Send: role, firstName, surname, phoneNumber, email
 *       → No OTP yet → next: /auth/complete-profile
 *
 *       ### 🟢 Broker (5-step flow)
 *       Send: role, brokerProfileType, firstName, surname, phoneNumber, email, yearsOfExperience, bio, specialization
 *       → No OTP yet → next: /auth/complete-profile
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - firstName
 *               - surname
 *               - phoneNumber
 *               - email
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [seeker, owner, broker]
 *                 description: "seeker = 3 steps, owner/broker = 5 steps"
 *               firstName:
 *                 type: string
 *                 example: John
 *               surname:
 *                 type: string
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               ninVerification:
 *                 type: string
 *                 description: "Seeker only (optional)"
 *               brokerProfileType:
 *                 type: string
 *                 description: "Broker only (required) — e.g. Freelance Agent/Independent Broker"
 *               yearsOfExperience:
 *                 type: integer
 *                 description: "Broker only"
 *               bio:
 *                 type: string
 *                 description: "Broker only — personal pitch"
 *               specialization:
 *                 type: string
 *                 description: "Broker only — e.g. Residential, Commercial"
 *           examples:
 *             seeker:
 *               summary: Seeker signup
 *               value:
 *                 role: seeker
 *                 firstName: John
 *                 surname: Doe
 *                 phoneNumber: "08012345678"
 *                 email: john@example.com
 *                 ninVerification: "12345678901"
 *             owner:
 *               summary: Owner signup
 *               value:
 *                 role: owner
 *                 firstName: Jane
 *                 surname: Smith
 *                 phoneNumber: "08098765432"
 *                 email: jane@example.com
 *             broker:
 *               summary: Broker signup
 *               value:
 *                 role: broker
 *                 brokerProfileType: "Freelance Agent/Independent Broker"
 *                 firstName: Mike
 *                 surname: Johnson
 *                 phoneNumber: "08033445566"
 *                 email: mike@brokerage.com
 *                 yearsOfExperience: 5
 *                 bio: "Experienced broker specializing in luxury properties"
 *                 specialization: "Residential, Commercial"
 *     responses:
 *       201:
 *         description: Account created
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
 *                 nextStep:
 *                   type: string
 *                   description: "verify-otp (seeker) or complete-profile (owner/broker)"
 *       409:
 *         description: Account already exists
 *
 * /auth/complete-profile:
 *   post:
 *     summary: "Step 2: Complete profile (Owner/Broker only)"
 *     description: |
 *       ### 🟡 Owner fields:
 *       email, location, propertyTypes, listingIntent, ownerType
 *
 *       ### 🟢 Broker fields:
 *       email, agencyCompanyName, companyYearsOfExistence, operatingLocations, companySize, portfolioSummary
 *
 *       **Next step:** POST /auth/verify-identity
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
 *                 description: "Owner only"
 *               propertyTypes:
 *                 type: string
 *                 description: "Owner only — e.g. apartment, house"
 *               listingIntent:
 *                 type: string
 *                 description: "Owner only — rent/sale/both"
 *               ownerType:
 *                 type: string
 *                 description: "Owner only — individual/company"
 *               agencyCompanyName:
 *                 type: string
 *                 description: "Broker only"
 *               companyYearsOfExistence:
 *                 type: string
 *                 description: "Broker only"
 *               operatingLocations:
 *                 type: string
 *                 description: "Broker only (required)"
 *               companySize:
 *                 type: string
 *                 description: "Broker only"
 *               portfolioSummary:
 *                 type: string
 *                 description: "Broker only"
 *           examples:
 *             owner:
 *               summary: Owner complete profile
 *               value:
 *                 email: jane@example.com
 *                 location: Lagos
 *                 propertyTypes: "apartment, house"
 *                 listingIntent: rent
 *                 ownerType: individual
 *             broker:
 *               summary: Broker complete profile
 *               value:
 *                 email: mike@brokerage.com
 *                 agencyCompanyName: "Mike Properties Ltd"
 *                 companyYearsOfExistence: "5 years"
 *                 operatingLocations: "Lagos, Abuja"
 *                 companySize: "1-10"
 *                 portfolioSummary: "Closed over 50 deals in 2023"
 *     responses:
 *       200:
 *         description: Profile info saved. Next step is verify-identity.
 *       400:
 *         description: Validation error or wrong role (seekers cannot use this)
 *       404:
 *         description: User not found
 *
 * /auth/verify-identity:
 *   post:
 *     summary: "Step 3: Upload identity documents (Owner/Broker only) — OTP sent after this"
 *     description: |
 *       Upload profile picture, government ID, and NIN/CAC document.
 *       **OTP is sent to email after successful upload.**
 *
 *       Use **multipart/form-data** for this request.
 *
 *       **Next step:** GET /auth/verify/:code
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
 *                 format: email
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo or company logo (JPG/PNG, max 50MB)
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
 *         description: Wrong role (seekers cannot use this)
 *       404:
 *         description: User not found
 *
 * /auth/verify/{code}:
 *   get:
 *     summary: "Verify OTP (all roles)"
 *     description: |
 *       Verify the 6-digit OTP code sent to email.
 *       - **Seeker:** OTP sent at signup (Step 1)
 *       - **Owner/Broker:** OTP sent after verify-identity (Step 3)
 *
 *       **Fallback OTP: 123456** (verifies all unverified accounts)
 *
 *       **Next step:** POST /auth/set-password
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 6-digit OTP code
 *         example: "482910"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *
 * /auth/set-password:
 *   post:
 *     summary: "Final Step: Set password (all roles — completes registration)"
 *     description: |
 *       Sets the user's password after OTP verification.
 *       Returns access_token and refresh_token — user is now logged in.
 *
 *       **Must verify OTP first.**
 *
 *       Password requirements: min 8 chars, uppercase, lowercase, number, symbol recommended.
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
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Password@123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password@123"
 *     responses:
 *       200:
 *         description: Password set. User is logged in.
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
 *                 id:
 *                   type: string
 *                   format: uuid
 *       403:
 *         description: Account not verified — verify OTP first
 *       400:
 *         description: Password already set (use forgot-password to reset)
 *
 * /auth/login:
 *   post:
 *     summary: Login (all roles)
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
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: "Password@123"
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
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification OTP
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
 *         description: OTP resent
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset code
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
 *         description: Reset code sent (valid for 5 minutes)
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
 *                 description: 6-digit reset code from email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *         description: Token refreshed
 *
 * /auth/logout:
 *   post:
 *     summary: Logout (invalidate refresh token)
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
 * /auth/google-oauth:
 *   post:
 *     summary: Login/Signup with Google
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
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Google OAuth successful
 *
 * /auth/all-user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved
 *
 * /auth/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved
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
 *         description: User approved
 */
