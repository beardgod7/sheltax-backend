import express from 'express';
import { authenticate } from '../../middleware/authentication';
import * as controller from './controller';

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

export default router;
