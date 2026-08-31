import express from 'express';
import { authenticate } from '../../middleware/authentication';
import {
  getUserSessionsHandler,
  revokeSessionHandler,
  revokeAllSessionsHandler,
} from './controller';

const router = express.Router();

router.use(authenticate);

router.get('/', getUserSessionsHandler);
router.post('/:id/revoke', revokeSessionHandler);
router.post('/revoke-all', revokeAllSessionsHandler);

export default router;
