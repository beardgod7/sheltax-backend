import { Router } from 'express';
import {
  signup,
  verifyAccount,
  resendVerification,
  setPassword,
  login,
  getCurrentUser,
  completeOwnerProfile,
  verifyIdentity,
} from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Registration & Auth routes matching frontend specifications
router.post('/signup', signup);
router.post('/complete-profile', completeOwnerProfile);
router.post('/complete-owner-profile', completeOwnerProfile);
router.post('/verify-identity', verifyIdentity);
router.get('/verify/:code', verifyAccount);
router.post('/verify', verifyAccount);
router.post('/verify-otp', verifyAccount);
router.post('/resend-verification', resendVerification);
router.post('/set-password', setPassword);
router.post('/login', login);
router.get('/me', authenticateJWT, getCurrentUser);

export default router;
