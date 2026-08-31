import express from 'express';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';
import { upload } from '../../middleware/upload';
import {
  createSeekerProfile,
  createBrokerProfileHandler,
  createOwnerProfileHandler,
  verifyOwnerIdentity,
  verifyBrokerIdentity,
  createSeekerPreferences,
  updateSeekerPreferences,
  getMyProfile,
  getProfileById,
  updateUserProfile,
  uploadProfilePicture,
  getAllUserProfiles,
  getProfilesByUserRole,
  deleteUserProfile,
  updateProfileVerification,
  uploadVerificationDocuments,
  submitKyc,
} from './controller';

const router = express.Router();

router.use(authenticate);

router.get('/public/:id', getProfileById);
router.get('/role/:role', getProfilesByUserRole);

router.post('/seeker', authorize(['seeker']), createSeekerProfile);
router.post('/broker', authorize(['broker']), createBrokerProfileHandler);
router.post('/owner', authorize(['owner']), createOwnerProfileHandler);

router.post(
  '/owner/verify-identity',
  authorize(['owner']),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
    { name: 'ninCacDocument', maxCount: 1 },
  ]),
  verifyOwnerIdentity
);

router.post(
  '/broker/verify-identity',
  authorize(['broker']),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
    { name: 'ninCacDocument', maxCount: 1 },
  ]),
  verifyBrokerIdentity
);

router.post(
  '/seeker/preferences',
  authorize(['seeker']),
  createSeekerPreferences
);
router.put(
  '/seeker/preferences',
  authorize(['seeker']),
  updateSeekerPreferences
);

router.get('/me', getMyProfile);
router.put('/', updateUserProfile);
router.delete('/', deleteUserProfile);

router.post('/picture', upload.single('profilePicture'), uploadProfilePicture);

router.post('/verification-documents', uploadVerificationDocuments);
router.post('/kyc/submit', submitKyc);
router.post('/kyc', submitKyc);

router.get('/', authorize(['admin', 'super_admin']), getAllUserProfiles);
router.patch(
  '/verify/:userId',
  authorize(['admin', 'super_admin']),
  updateProfileVerification
);

export default router;
