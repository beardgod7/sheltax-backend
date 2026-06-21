/**
 * @swagger
 * tags:
 *   - name: Broker Auth
 *     description: |
 *       ## Broker Registration Flow
 *       **Step 1:** POST /auth/signup (role = broker) → fills personal + professional info, NO OTP yet
 *       **Step 2:** POST /auth/complete-profile → fills organization/professional info
 *       **Step 3:** POST /auth/verify-identity → uploads profile picture, government ID, NIN/CAC → OTP sent
 *       **Step 4:** GET /auth/verify/:code → verify OTP
 *       **Step 5:** POST /auth/set-password → set password, receive tokens (logged in)
 *
 *   - name: Broker Profile
 *     description: |
 *       After login, brokers can update their profile.
 *       POST /profile/broker → create profile
 *       PUT /profile → update profile
 *
 * /auth/signup-broker:
 *   post:
 *     summary: "BROKER - Step 1: Register (Personal + Professional Info)"
 *     description: |
 *       Creates a broker account with personal details and professional info.
 *       **No OTP is sent at this step.**
 *       After this, proceed to **POST /auth/complete-profile**
 *     tags: [Broker Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - brokerProfileType
 *               - firstName
 *               - surname
 *               - phoneNumber
 *               - email
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [broker]
 *                 example: broker
 *               brokerProfileType:
 *                 type: string
 *                 description: Type of broker (e.g. "freelancer/independent broker", "agency broker")
 *                 example: "Freelance Agent/Independent Broker"
 *               firstName:
 *                 type: string
 *                 example: Mike
 *               surname:
 *                 type: string
 *                 example: Johnson
 *               phoneNumber:
 *                 type: string
 *                 example: "08033445566"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mike@brokerage.com
 *               yearsOfExperience:
 *                 type: integer
 *                 description: Number of years in real estate
 *                 example: 5
 *               bio:
 *                 type: string
 *                 description: Personal bio or pitch
 *                 example: "Experienced real estate broker specializing in luxury properties"
 *               specialization:
 *                 type: string
 *                 description: Area of specialization
 *                 example: "Residential, Commercial, Short Let Deals"
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
 * /auth/complete-profile-broker:
 *   post:
 *     summary: "BROKER - Step 2: Organization / Professional Info"
 *     description: |
 *       Broker fills in organization details.
 *       After this step, proceed to **POST /auth/verify-identity**
 *     tags: [Broker Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - operatingLocations
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mike@brokerage.com
 *               agencyCompanyName:
 *                 type: string
 *                 description: Name of agency or company (optional)
 *                 example: "Mike Properties Ltd"
 *               companyYearsOfExistence:
 *                 type: string
 *                 description: How long the company has existed
 *                 example: "5 years"
 *               operatingLocations:
 *                 type: string
 *                 description: Where the broker operates (required)
 *                 example: "Lagos, Abuja"
 *               companySize:
 *                 type: string
 *                 description: Size of company/team
 *                 example: "1-10"
 *               portfolioSummary:
 *                 type: string
 *                 description: Summary of past deals and portfolio
 *                 example: "Closed over 50 deals in 2023"
 *     responses:
 *       200:
 *         description: Organization info saved. Proceed to verify-identity.
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
 *
 * /auth/verify-identity-broker:
 *   post:
 *     summary: "BROKER - Step 3: Upload Identity Documents (OTP sent after this)"
 *     description: |
 *       Upload profile picture or company logo, government ID, and NIN/CAC document.
 *       **OTP is sent to email after successful upload.**
 *       Proceed to **GET /auth/verify/:code**
 *       Use multipart/form-data for this request.
 *     tags: [Broker Auth]
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
 *                 example: mike@brokerage.com
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture or company logo (JPG/PNG, max 50MB)
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
 * /auth/verify-broker:
 *   get:
 *     summary: "BROKER - Step 4: Verify OTP"
 *     description: |
 *       Verify the 6-digit OTP sent after identity upload.
 *       Use **123456** as a fallback if email doesn't arrive.
 *     tags: [Broker Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: "920481"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 *
 * /auth/set-password-broker:
 *   post:
 *     summary: "BROKER - Step 5: Set Password (completes registration)"
 *     description: |
 *       Sets the broker's password. Returns tokens — broker is now logged in.
 *     tags: [Broker Auth]
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
 *         description: Password set. Broker is logged in.
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
 *                   example: broker
 *                 id:
 *                   type: string
 *                   format: uuid
 *
 * /profile/broker-create:
 *   post:
 *     summary: "BROKER - Create Profile (after login)"
 *     description: |
 *       Completes the broker profile.
 *       **Email is auto-populated — do not send it.**
 *       Requires Bearer token.
 *     tags: [Broker Profile]
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
 *         description: Broker profile created successfully
 */
