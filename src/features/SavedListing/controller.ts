import { Request, Response } from 'express';
import { SavedListing } from './model';
import { Listing } from '../Listing/model';
import { getPagination, paginatedData } from '../../utils/pagination';

function userIdFrom(req: Request): string {
  const user = (req as any).user;
  return user?.sub || user?.id || user?.userId;
}

export async function toggle(req: Request, res: Response): Promise<void> {
  try {
    const userId = userIdFrom(req);
    const property = await Listing.findOne({
      where: { id: req.params.propertyId, approvalStatus: 'APPROVED' },
    });
    if (!property) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    const existing = await SavedListing.findOne({ where: { userId, propertyId: (property as any).id } });
    if (existing) {
      await existing.destroy();
      res.json({ success: true, data: { isSaved: false }, message: 'Listing removed from saved properties.' });
      return;
    }
    await SavedListing.create({ userId, propertyId: (property as any).id });
    res.json({ success: true, data: { isSaved: true }, message: 'Listing saved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update saved listing', error: error.message });
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const pagination = getPagination(req.query);
    const { count, rows: saved } = await SavedListing.findAndCountAll({
      where: { userId: userIdFrom(req) },
      include: [{ model: Listing, as: 'property', where: { approvalStatus: 'APPROVED' } }],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
    res.json({
      success: true,
      message: 'Saved listings retrieved successfully',
      data: paginatedData(
        'properties',
        saved.map((item: any) => item.property),
        count,
        pagination
      ),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch saved listings', error: error.message });
  }
}

export async function ids(req: Request, res: Response): Promise<void> {
  try {
    const saved = await SavedListing.findAll({
      where: { userId: userIdFrom(req) },
      attributes: ['propertyId'],
      raw: true,
    });
    res.json({ success: true, data: (saved as any[]).map((item) => item.propertyId) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch saved listing IDs', error: error.message });
  }
}

export default { toggle, list, ids };
