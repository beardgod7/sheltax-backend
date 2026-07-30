import { Request, Response } from 'express';
import reviewRepository, { serializeReview } from './repository';
import { getPagination, paginatedData } from '../../utils/pagination';

const SORTS = ['RECENT', 'HIGHEST', 'LOWEST'];

function userIdFrom(req: Request): string {
  const user = (req as any).user;
  return user?.sub || user?.id || user?.userId;
}

function propertyIdFrom(req: Request): string {
  const id = req.params.propertyId || req.params.id;
  return Array.isArray(id) ? id[0] : id || '';
}

function failed(res: Response, error: any, fallback: string) {
  console.error(`${fallback}:`, error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallback,
    ...(error.code ? { code: error.code } : {}),
  });
}

export class PropertyReviewController {
  async listReviews(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = propertyIdFrom(req);
      await reviewRepository.findPublicListing(propertyId);

      const pagination = getPagination(req.query, { defaultLimit: 10 });
      const sort = SORTS.includes(String(req.query.sort || '').toUpperCase())
        ? String(req.query.sort).toUpperCase()
        : 'RECENT';

      const [{ count, rows }, summary] = await Promise.all([
        reviewRepository.listReviews(propertyId, pagination, sort),
        reviewRepository.summaryFor(propertyId),
      ]);

      res.status(200).json({
        success: true,
        message: 'Property reviews retrieved successfully',
        data: { ...paginatedData('reviews', rows, count, pagination), summary },
      });
    } catch (error: any) {
      failed(res, error, 'Failed to fetch property reviews');
    }
  }

  async summary(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = propertyIdFrom(req);
      await reviewRepository.findPublicListing(propertyId);
      const summary = await reviewRepository.summaryFor(propertyId);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      failed(res, error, 'Failed to fetch review summary');
    }
  }

  async eligibility(req: Request, res: Response): Promise<void> {
    try {
      const eligibility = await reviewRepository.getEligibility(
        propertyIdFrom(req),
        userIdFrom(req)
      );
      res.status(200).json({ success: true, data: eligibility });
    } catch (error: any) {
      failed(res, error, 'Failed to check review eligibility');
    }
  }

  async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const review = await reviewRepository.submitReview(
        propertyIdFrom(req),
        userIdFrom(req),
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Thanks — your review is now live on this property.',
        data: serializeReview(review),
      });
    } catch (error: any) {
      failed(res, error, 'Failed to publish review');
    }
  }

  async reviseReview(req: Request, res: Response): Promise<void> {
    try {
      const review = await reviewRepository.reviseReview(
        propertyIdFrom(req),
        userIdFrom(req),
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Your review has been updated.',
        data: serializeReview(review),
      });
    } catch (error: any) {
      failed(res, error, 'Failed to update review');
    }
  }

  async myReviews(req: Request, res: Response): Promise<void> {
    try {
      const pagination = getPagination(req.query, { defaultLimit: 10 });
      const { count, rows } = await reviewRepository.listSeekerReviews(
        userIdFrom(req),
        pagination
      );
      res.status(200).json({
        success: true,
        message: 'Your reviews retrieved successfully',
        data: paginatedData('reviews', rows, count, pagination),
      });
    } catch (error: any) {
      failed(res, error, 'Failed to fetch your reviews');
    }
  }

  async pendingReviews(req: Request, res: Response): Promise<void> {
    try {
      const pending = await reviewRepository.listPendingReviews(userIdFrom(req));
      res.status(200).json({
        success: true,
        message: 'Pending reviews retrieved successfully',
        data: { pending },
      });
    } catch (error: any) {
      failed(res, error, 'Failed to fetch pending reviews');
    }
  }
}

export default new PropertyReviewController();
