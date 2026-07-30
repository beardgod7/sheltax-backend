import express from 'express';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';
import * as controller from './controller';
import { propertyScoped as reviewRoutes } from '../PropertyReview/routes';

const router = express.Router();

router.use('/:propertyId/reviews', reviewRoutes);

router.get('/', controller.list);
router.get('/locations', controller.locations);
router.get('/stats', controller.stats);
router.get('/:id', controller.getOne);
router.post('/', authenticate, authorize(['owner', 'broker']), controller.create);
router.put('/:id', authenticate, authorize(['owner', 'broker']), controller.update);
router.delete('/:id', authenticate, authorize(['owner', 'broker']), controller.remove);

export default router;
