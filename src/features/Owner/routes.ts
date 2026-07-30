import express from 'express';
import { authenticate } from '../../middleware/authentication';
import ownerController from './controller';
import { authorize } from '../../middleware/rolemiddleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['owner', 'broker']));

router.get('/dashboard', (req, res) => ownerController.getDashboard(req, res));
router.get('/properties', (req, res) => ownerController.getProperties(req, res));

export default router;
