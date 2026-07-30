import express from 'express';
import controller from './controller';
import { authenticate } from '../../middleware/authentication';
import { authorize } from '../../middleware/rolemiddleware';

export const propertyScoped = express.Router({ mergeParams: true });

propertyScoped.get('/', (req, res) => controller.listReviews(req, res));
propertyScoped.get('/summary', (req, res) => controller.summary(req, res));
propertyScoped.get('/eligibility', authenticate, (req, res) => controller.eligibility(req, res));
propertyScoped.post('/', authenticate, authorize(['seeker']), (req, res) => controller.submitReview(req, res));
propertyScoped.patch('/mine', authenticate, authorize(['seeker']), (req, res) => controller.reviseReview(req, res));

export const seekerScoped = express.Router();

seekerScoped.use(authenticate);
seekerScoped.get('/mine', (req, res) => controller.myReviews(req, res));
seekerScoped.get('/pending', (req, res) => controller.pendingReviews(req, res));

export default { propertyScoped, seekerScoped };
