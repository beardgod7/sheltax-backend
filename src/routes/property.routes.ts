import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', PropertyController.getProperties);
router.get('/locations', PropertyController.getLocations);
router.get('/:id', PropertyController.getPropertyById);

// Protected routes
router.post('/', authenticateJWT, PropertyController.createProperty);
router.put('/:id', authenticateJWT, PropertyController.updateProperty);
router.delete('/:id', authenticateJWT, PropertyController.deleteProperty);
router.patch('/:id/approval', authenticateJWT, PropertyController.updateApproval);

export default router;
