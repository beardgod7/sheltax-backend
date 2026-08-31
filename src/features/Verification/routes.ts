import express from 'express';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';
import {
  getUserVerificationsHandler,
  getDocumentSignedUrl,
  submitPropertyOwnership,
} from './controller';

const router = express.Router();

router.use(authenticate);

router.get('/me', getUserVerificationsHandler);
router.get('/documents/:id/url', getDocumentSignedUrl);
router.post('/ownership', authorize(['owner', 'broker', 'admin', 'super_admin']), submitPropertyOwnership);

export default router;
