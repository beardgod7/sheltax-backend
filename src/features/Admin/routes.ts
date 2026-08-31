import express from 'express';
import adminController from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin', 'super_admin']));

router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/properties', (req, res) => adminController.getProperties(req, res));
router.patch('/properties/:id/status', (req, res) => adminController.updatePropertyStatus(req, res));
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUserById(req, res));
router.get('/kyc', (req, res) => adminController.getKycSubmissions(req, res));
router.get('/sales', (req, res) => adminController.getSales(req, res));
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));
router.get('/sessions', (req, res) => adminController.getAllSessions(req, res));
router.get('/agent-licences', (req, res) => adminController.getAgentLicences(req, res));
router.patch('/agent-licences/:id/verify', (req, res) => adminController.verifyAgentLicence(req, res));
router.get('/agent-authorizations', (req, res) => adminController.getAgentAuthorizations(req, res));
router.get('/commissions', (req, res) => adminController.getAllCommissions(req, res));
router.patch('/users/:id/verify', (req, res) => adminController.updateUserVerification(req, res));
router.patch('/users/:userId/verify', (req, res) => adminController.updateUserVerification(req, res));

export default router;
