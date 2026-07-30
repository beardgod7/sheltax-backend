import { Request, Response } from 'express';
import paymentRepository from './repository';
import { getPagination, paginatedData } from '../../utils/pagination';

function userIdFrom(req: Request): string {
  const user = (req as any).user;
  return user?.sub || user?.id || user?.userId;
}

function normaliseStatus(status?: any): string | undefined {
  if (!status) return undefined;
  const value = String(status).toUpperCase();
  return value === 'ALL' ? 'ALL' : value;
}

function errorResponse(res: Response, error: any, fallback: string) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallback,
    ...(error.code ? { code: error.code } : {}),
  });
}

export class PaymentController {
  async initiateCheckout(req: Request, res: Response): Promise<void> {
    try {
      const buyerId = userIdFrom(req);
      const { listingId } = req.body;

      if (!listingId) {
        res.status(400).json({ success: false, message: 'listingId is required.' });
        return;
      }

      const payment = await paymentRepository.initiateCheckout(buyerId, listingId);

      res.status(201).json({
        success: true,
        message: 'Checkout opened.',
        data: payment,
      });
    } catch (error: any) {
      console.error('Initiate Checkout Error:', error);
      errorResponse(res, error, 'Failed to open checkout.');
    }
  }

  async settleCheckout(req: Request, res: Response): Promise<void> {
    try {
      const buyerId = userIdFrom(req);
      const reference = Array.isArray(req.params.reference) ? req.params.reference[0] : req.params.reference;
      const { outcome, reason } = req.body;

      if (!outcome) {
        res.status(400).json({
          success: false,
          message: 'Outcome is required (SUCCESS or FAILURE).',
        });
        return;
      }

      const payment: any = await paymentRepository.settleCheckout(
        reference,
        buyerId,
        String(outcome).toUpperCase(),
        reason
      );

      res.status(200).json({
        success: true,
        message:
          payment.status === 'SUCCESSFUL'
            ? 'Payment successful. The property is now marked as taken.'
            : 'Payment failed. The property is still available.',
        data: payment,
      });
    } catch (error: any) {
      console.error('Settle Checkout Error:', error);
      errorResponse(res, error, 'Failed to settle checkout.');
    }
  }

  async getMyPayments(req: Request, res: Response): Promise<void> {
    try {
      const buyerId = userIdFrom(req);
      const pagination = getPagination(req.query);
      const status = normaliseStatus(req.query.status);

      const [{ count, rows }, summary] = await Promise.all([
        paymentRepository.getBuyerPayments(buyerId, pagination, status),
        paymentRepository.getSalesSummary({ buyerId }),
      ]);

      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: { ...paginatedData('payments', rows, count, pagination), summary },
      });
    } catch (error: any) {
      console.error('Get My Payments Error:', error);
      errorResponse(res, error, 'Failed to fetch payments.');
    }
  }

  async getMySales(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = userIdFrom(req);
      const pagination = getPagination(req.query);
      const status = normaliseStatus(req.query.status) || 'SUCCESSFUL';

      const [{ count, rows }, summary] = await Promise.all([
        paymentRepository.getSellerSales(sellerId, pagination, status),
        paymentRepository.getSalesSummary({ sellerId }),
      ]);

      res.status(200).json({
        success: true,
        message: 'Sales retrieved successfully',
        data: { ...paginatedData('sales', rows, count, pagination), summary },
      });
    } catch (error: any) {
      console.error('Get My Sales Error:', error);
      errorResponse(res, error, 'Failed to fetch sales.');
    }
  }

  async getPurchaseState(req: Request, res: Response): Promise<void> {
    try {
      const listingId = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
      const state = await paymentRepository.getListingPurchaseState(
        listingId,
        userIdFrom(req)
      );
      res.status(200).json({ success: true, data: state });
    } catch (error: any) {
      console.error('Get Purchase State Error:', error);
      errorResponse(res, error, 'Failed to resolve purchase state.');
    }
  }
}

export default new PaymentController();
