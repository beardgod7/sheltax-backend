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
 *         stateOfResidence:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dateOfBirth:
 *           type: string
 *           format: date
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
 */
export {};
