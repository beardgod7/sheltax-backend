import { Router } from 'express';
import { agentController } from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

const router = Router();

// Licence submission (Agent)
router.post(
  '/licence',
  authenticate,
  authorize(['broker', 'admin', 'super_admin']),
  (req, res) => agentController.submitLicence(req, res)
);

// Authorizations (Owner / Agent)
router.post(
  '/authorizations',
  authenticate,
  authorize(['owner', 'admin', 'super_admin']),
  (req, res) => agentController.createAuthorization(req, res)
);

router.patch(
  '/authorizations/:id/status',
  authenticate,
  authorize(['owner', 'broker', 'admin', 'super_admin']),
  (req, res) => agentController.updateAuthorizationStatus(req, res)
);

router.get(
  '/authorizations',
  authenticate,
  authorize(['owner', 'broker', 'admin', 'super_admin']),
  (req, res) => agentController.getAuthorizations(req, res)
);

// Commission ledger (Agent)
router.get(
  '/commissions',
  authenticate,
  authorize(['broker', 'admin', 'super_admin']),
  (req, res) => agentController.getCommissions(req, res)
);

// Ratings & Reviews
router.post(
  '/ratings',
  authenticate,
  authorize(['seeker', 'admin', 'super_admin']),
  (req, res) => agentController.submitRating(req, res)
);

router.get(
  '/directory',
  (req, res) => agentController.searchAgents(req, res)
);

router.get(
  '/search',
  (req, res) => agentController.searchAgents(req, res)
);

router.get(
  '/public/:id',
  (req, res) => agentController.getAgentPublicProfile(req, res)
);

export default router;
