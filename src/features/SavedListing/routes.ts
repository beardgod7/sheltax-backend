import express from 'express';
import { authenticate } from '../../middleware/authentication';
import * as controller from './controller';

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.get('/ids', controller.ids);
router.post('/:propertyId/toggle', controller.toggle);

export default router;
