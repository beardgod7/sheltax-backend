import express from 'express';
import propertyRequestController from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

const router = express.Router();

router.use(authenticate);

router.get(
  '/search',
  authorize(['broker', 'owner']),
  (req, res) => propertyRequestController.searchPropertyRequests(req, res)
);

router.get('/:id', (req, res) => propertyRequestController.getPropertyRequest(req, res));

router.post(
  '/',
  authorize(['seeker']),
  (req, res) => propertyRequestController.createPropertyRequest(req, res)
);

router.get(
  '/my/requests',
  authorize(['seeker']),
  (req, res) => propertyRequestController.getMyRequests(req, res)
);

router.put(
  '/:id',
  authorize(['seeker']),
  (req, res) => propertyRequestController.updatePropertyRequest(req, res)
);

router.delete(
  '/:id',
  authorize(['seeker']),
  (req, res) => propertyRequestController.deletePropertyRequest(req, res)
);

router.post(
  '/:id/responses',
  authorize(['broker', 'owner']),
  (req, res) => propertyRequestController.createResponse(req, res)
);

router.get(
  '/:id/responses',
  authorize(['seeker']),
  (req, res) => propertyRequestController.getRequestResponses(req, res)
);

router.get(
  '/my/responses',
  authorize(['broker', 'owner']),
  (req, res) => propertyRequestController.getMyResponses(req, res)
);

router.get(
  '/responses/:responseId',
  (req, res) => propertyRequestController.getResponse(req, res)
);

router.put(
  '/responses/:responseId/status',
  authorize(['seeker']),
  (req, res) => propertyRequestController.updateResponseStatus(req, res)
);

export default router;
