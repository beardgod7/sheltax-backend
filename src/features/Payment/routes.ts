import express from 'express';
import paymentController from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

const router = express.Router();

router.use(authenticate);

router.post('/initiate', authorize(['seeker']), (req, res) => paymentController.initiateCheckout(req, res));
router.post('/:reference/settle', authorize(['seeker']), (req, res) => paymentController.settleCheckout(req, res));
router.get('/my', (req, res) => paymentController.getMyPayments(req, res));
router.get('/sales', authorize(['owner', 'broker']), (req, res) => paymentController.getMySales(req, res));
router.get('/listing/:listingId/state', (req, res) => paymentController.getPurchaseState(req, res));

export default router;
