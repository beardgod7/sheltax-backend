import express, { Request, Response } from 'express';

import authRoutes from '../features/Authentication/routes';
import profileRoutes from '../features/Profile/routes';
import propertyRequestRoutes from '../features/PropertyRequest/routes';
import adminRoutes from '../features/Admin/routes';
import uploadRoutes from '../features/Upload/routes';
import ownerRoutes from '../features/Owner/routes';
import inspectionRoutes from '../features/Inspection/routes';
import listingRoutes from '../features/Listing/routes';
import notificationRoutes from '../features/Notification/routes';
import savedListingRoutes from '../features/SavedListing/routes';
import paymentRoutes from '../features/Payment/routes';
import { seekerScoped as reviewRoutes } from '../features/PropertyReview/routes';
import verificationRoutes from '../features/Verification/routes';
import sessionRoutes from '../features/Session/routes';
import agentRoutes from '../features/Agent/routes';

const router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Sheltax Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth/sessions', sessionRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/agent', agentRoutes);
router.use('/properties', listingRoutes);
router.use('/property-requests', propertyRequestRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/owner', ownerRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/saved-properties', savedListingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/verifications', verificationRoutes);
router.use('/documents', verificationRoutes);

router.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

export default router;
