import { Router } from 'express';
import { getOwnerDashboard, getOwnerProperties } from '../controllers/owner.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protect all owner routes
router.use(authenticateJWT);

router.get('/dashboard', getOwnerDashboard);
router.get('/properties', getOwnerProperties);

export default router;
