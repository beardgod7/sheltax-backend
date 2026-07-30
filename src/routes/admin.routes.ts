import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.get('/stats', AdminController.getStats);
router.get('/properties', AdminController.getProperties);
router.patch('/properties/:id/status', AdminController.updatePropertyStatus);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/verify', AdminController.updateUserVerification);

export default router;
