import { Router } from 'express';
import {
  getProfile,
  createSeekerProfile,
  createOwnerProfile,
  createBrokerProfile,
  submitKyc,
} from '../controllers/profile.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// All profile endpoints require Bearer JWT authentication
router.use(authenticateJWT);

router.get('/me', getProfile);
router.post('/seeker', createSeekerProfile);
router.post('/owner', createOwnerProfile);
router.post('/broker', createBrokerProfile);
router.post('/kyc/submit', submitKyc);

export default router;
