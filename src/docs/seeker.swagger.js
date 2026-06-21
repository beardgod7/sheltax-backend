/**
 * @swagger
 * tags:
 *   - name: Seeker Auth
 *     description: |
 *       ## Seeker Registration Flow
 *       **Step 1:** POST /auth/signup (role = seeker) → OTP sent to email
 *       **Step 2:** GET /auth/verify/:code → verify OTP
 *       **Step 3:** POST /auth/set-password → set password, receive tokens (logged in)
 *
 *   - name: Seeker Profile
 *     description: |
 *       After login, seekers complete their profile.
 *       POST /profile/seeker → create profile
 *       PUT /profile → update profile
 *
 * /auth/signup-seeker:
 *   post:
 *     summary: "SEEKER - Step 1: Register"
 *     description: |
 *       Creates a seeker account and sends OTP to the provided email.
 *       After this step, proceed to verify OTP at **GET /auth/verify/:code**
 *     tags: [Seeker Auth]
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
 *                 enum: [seeker]
 *                 example: seeker
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
 *                 description: NIN number (optional)
 *                 example: "12345678901"
 *     responses:
 *       201:
 *         description: Account created. OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created successfully! Please check your email to verify your account."
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 nextStep:
 *                   type: string
 *                   example: "verify-otp"
 *       409:
 *         description: Email already registered
 *
 * /auth/verify-seeker:
 *   get:
 *     summary: "SEEKER - Step 2: Verify OTP"
 *     description: |
 *       Verify the 6-digit OTP sent to the seeker's email.
 *       Use **123456** as a fallback if OTP email doesn't arrive.
 *       After verification, proceed to **POST /auth/set-password**
 *     tags: [Seeker Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 6-digit OTP code from email (use 123456 as fallback)
 *         example: "482910"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account verified successfully!"
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *
 * /auth/set-password-seeker:
 *   post:
 *     summary: "SEEKER - Step 3: Set Password (completes registration)"
 *     description: |
 *       Sets the seeker's password after OTP verification.
 *       Returns access and refresh tokens — seeker is now logged in.
 *       **Must verify OTP first before calling this.**
 *     tags: [Seeker Auth]
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
 *                 description: "Must contain: uppercase, lowercase, number, symbol"
 *                 example: "Password@123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password@123"
 *     responses:
 *       200:
 *         description: Password set. Seeker is logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *                   description: JWT access token (expires in 12h)
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh token (expires in 24h)
 *                 role:
 *                   type: string
 *                   example: seeker
 *                 id:
 *                   type: string
 *                   format: uuid
 *       403:
 *         description: Email not verified yet — verify OTP first
 *
 * /profile/seeker-create:
 *   post:
 *     summary: "SEEKER - Create Profile (after login)"
 *     description: |
 *       Completes the seeker profile after registration.
 *       Requires Bearer token from login/set-password.
 *       **Email is auto-populated from registration — do not send it.**
 *     tags: [Seeker Profile]
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
 *                 example: John
 *               surname:
 *                 type: string
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *               stateOfResidence:
 *                 type: string
 *                 example: Lagos
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-15"
 *               ninVerification:
 *                 type: string
 *                 description: NIN number (optional)
 *     responses:
 *       201:
 *         description: Seeker profile created successfully
 *       409:
 *         description: Profile already exists
 */
