import { Router } from 'express';
import { SavedPropertyController } from '../controllers/saved-property.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protect all saved property endpoints
router.use(authenticateJWT);

router.post('/:propertyId/toggle', SavedPropertyController.toggleSave);
router.get('/', SavedPropertyController.getSavedProperties);
router.get('/ids', SavedPropertyController.getSavedPropertyIds);

export default router;
