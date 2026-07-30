import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import propertyRoutes from './property.routes';
import savedPropertyRoutes from './saved-property.routes';
import ownerRoutes from './owner.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import inspectionRoutes from './inspection.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/properties', propertyRoutes);
router.use('/rent', propertyRoutes);
router.use('/buy', propertyRoutes);
router.use('/shortlet', propertyRoutes);
router.use('/saved-properties', savedPropertyRoutes);
router.use('/owner', ownerRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/inspections', inspectionRoutes);

export default router;
