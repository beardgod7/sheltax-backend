import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', InspectionController.createInspection);
router.get('/my-requests', InspectionController.getUserInspections);
router.patch('/:id/status', InspectionController.updateInspectionStatus);

export default router;
