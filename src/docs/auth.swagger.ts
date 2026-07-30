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
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Account created
 */
export {};
