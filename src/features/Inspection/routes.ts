import express from 'express';
import inspectionController from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(['seeker']), (req, res) => inspectionController.createInspection(req, res));
router.get('/my-requests', (req, res) => inspectionController.getUserInspections(req, res));
router.patch('/:id/status', (req, res) => inspectionController.updateInspectionStatus(req, res));
router.patch('/:id/outcome', authorize(['seeker']), (req, res) => inspectionController.recordInspectionOutcome(req, res));

export default router;
