/**
 * @swagger
 * tags:
 *   - name: Owner Auth
 *     description: |
 *       ## Owner Registration Flow
 *       **Step 1:** POST /auth/signup (role = owner) → account created, NO OTP yet
 *       **Step 2:** POST /auth/complete-profile → location, property types, listing intent, owner type
 *       **Step 3:** POST /auth/verify-identity → upload profile picture, government ID, NIN/CAC → OTP sent
 *       **Step 4:** GET /auth/verify/:code → verify OTP
 *       **Step 5:** POST /auth/set-password → set password, receive tokens (logged in)
 *
 *   - name: Owner Profile
 *     description: |
 *       After login, owners can update their profile.
 *       POST /profile/owner → create profile
 *       PUT /profile → update profile
 *
 * /auth/signup-owner:
 *   post:
 *     summary: "OWNER - Step 1: Register"
 *     description: |
 *       Creates an owner account. **No OTP is sent at this step.**
 *       After this step, proceed to **POST /auth/complete-profile**
 *     tags: [Owner Auth]
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
 *                 enum: [owner]
 *                 example: owner
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               surname:
 *                 type: string
 *                 example: Smith
 *               phoneNumber:
 *                 type: string
 *                 example: "08098765432"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *     responses:
 *       201:
 *         description: Account created. Proceed to complete-profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created successfully! Please complete your profile."
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 nextStep:
 *                   type: string
 *                   example: "complete-profile"
 *       409:
 *         description: Email already registered
 *
 * /auth/complete-profile-owner:
 *   post:
 *     summary: "OWNER - Step 2: Complete Profile Setup"
 *     description: |
 *       Owner fills in their property preferences and profile setup.
 *       After this step, proceed to **POST /auth/verify-identity**
 *     tags: [Owner Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - location
 *               - propertyTypes
 *               - listingIntent
 *               - ownerType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               location:
 *                 type: string
 *                 description: State or area where owner operates
 *                 example: Lagos
 *               propertyTypes:
 *                 type: string
 *                 description: Types of properties owned (e.g. apartment, house, commercial)
 *                 example: "apartment, house"
 *               listingIntent:
 *                 type: string
 *                 description: What owner wants to do with properties
 *                 example: "rent"
 *               ownerType:
 *                 type: string
 *                 description: How the owner identifies (individual, company, investor)
 *                 example: "individual"
 *     responses:
 *       200:
 *         description: Profile saved. Proceed to verify-identity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 registrationStep:
 *                   type: integer
 *                   example: 2
 *       404:
 *         description: User not found
 *
 * /auth/verify-identity-owner:
 *   post:
 *     summary: "OWNER - Step 3: Upload Identity Documents (OTP sent after this)"
 *     description: |
 *       Upload profile picture, government ID, and NIN/CAC document.
 *       **OTP is sent to email after successful upload.**
 *       Proceed to **GET /auth/verify/:code**
 *       Use multipart/form-data for this request.
 *     tags: [Owner Auth]
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
 *                 example: jane@example.com
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo (JPG/PNG, max 50MB)
 *               governmentId:
 *                 type: string
 *                 format: binary
 *                 description: Valid government ID — International Passport, Driver's License, or National ID
 *               ninCacDocument:
 *                 type: string
 *                 format: binary
 *                 description: NIN document or CAC document (if company)
 *     responses:
 *       200:
 *         description: Documents uploaded. OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Identity documents uploaded successfully. OTP sent to your email."
 *                 registrationStep:
 *                   type: integer
 *                   example: 3
 *
 * /auth/verify-owner:
 *   get:
 *     summary: "OWNER - Step 4: Verify OTP"
 *     description: |
 *       Verify the 6-digit OTP sent after identity upload.
 *       Use **123456** as a fallback if email doesn't arrive.
 *     tags: [Owner Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: "738201"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 *
 * /auth/set-password-owner:
 *   post:
 *     summary: "OWNER - Step 5: Set Password (completes registration)"
 *     description: |
 *       Sets the owner's password. Returns tokens — owner is now logged in.
 *     tags: [Owner Auth]
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
 *                 minLength: 8
 *                 example: "Password@123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password@123"
 *     responses:
 *       200:
 *         description: Password set. Owner is logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 role:
 *                   type: string
 *                   example: owner
 *                 id:
 *                   type: string
 *                   format: uuid
 *
 * /profile/owner-create:
 *   post:
 *     summary: "OWNER - Create Profile (after login)"
 *     description: |
 *       Completes the owner profile.
 *       **Email is auto-populated — do not send it.**
 *       Requires Bearer token.
 *     tags: [Owner Profile]
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
 *                 description: Agency or company name (optional)
 *               agentLicenseNumber:
 *                 type: string
 *                 description: License number (optional)
 *     responses:
 *       201:
 *         description: Owner profile created successfully
 */
