import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import sequelize from '../../config/dbconfig';
import { Listing, ReviewDecision, Notification } from './model';
import { User } from '../Authentication/model';
import { getPagination, paginatedData } from '../../utils/pagination';
import reviewRepository from '../PropertyReview/repository';

export const MATERIAL_FIELDS = new Set([
  'title', 'description', 'intent', 'propertyType', 'price', 'currency',
  'location', 'address', 'city', 'state', 'bedrooms', 'bathrooms',
  'sittingRooms', 'tags', 'images',
]);

function userIdFrom(req: Request): string {
  const user = (req as any).user;
  return user?.sub || user?.id || user?.userId;
}

function publicListingWhere(query: Record<string, any>): any {
  const where: any = { approvalStatus: 'APPROVED' };
  if (String(query.includeSold) !== 'true') {
    where.availabilityStatus = { [Op.ne]: 'SOLD' };
  }
  if (query.intent) where.intent = String(query.intent).toUpperCase();
  if (query.propertyType && query.propertyType !== 'any') where.propertyType = query.propertyType;
  if (query.state) where.state = { [Op.iLike]: `%${query.state}%` };
  if (query.city) where.city = { [Op.iLike]: `%${query.city}%` };
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = Number(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = Number(query.maxPrice);
  }
  const q = query.q || query.query || query.search;
  if (q) {
    const term = `%${q}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
      { location: { [Op.iLike]: term } },
      { city: { [Op.iLike]: term } },
      { state: { [Op.iLike]: term } },
    ];
  }
  if (query.isFeatured !== undefined) where.isFeatured = String(query.isFeatured) === 'true';
  if (query.isPopular !== undefined) where.isPopular = String(query.isPopular) === 'true';
  return where;
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const pagination = getPagination(req.query);
    const { count, rows } = await Listing.findAndCountAll({
      where: publicListingWhere(req.query),
      include: [{ model: User, as: 'owner', attributes: ['id', 'firstName', 'surname', 'email', 'role', 'profilePicture'] }],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
    const summaries = await reviewRepository.summariesFor(rows.map((row: any) => row.id));
    const properties = rows.map((row: any) => ({
      ...row.get({ plain: true }),
      reviewSummary: summaries[row.id],
    }));
    res.json({
      success: true,
      message: 'Listings retrieved successfully',
      data: paginatedData('properties', properties, count, pagination),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch listings', error: error.message });
  }
}

export async function locations(req: Request, res: Response): Promise<void> {
  try {
    const rows = await Listing.findAll({
      where: { approvalStatus: 'APPROVED', availabilityStatus: { [Op.ne]: 'SOLD' } },
      attributes: ['state', 'city'],
      raw: true,
    });
    const locationsByState: Record<string, string[]> = {};
    for (const row of rows as any[]) {
      if (!row.state) continue;
      if (!locationsByState[row.state]) locationsByState[row.state] = [];
      if (row.city && !locationsByState[row.state].includes(row.city)) {
        locationsByState[row.state].push(row.city);
      }
    }
    res.json({
      success: true,
      data: { states: Object.keys(locationsByState).sort(), locationsByState },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch listing locations', error: error.message });
  }
}

export async function stats(req: Request, res: Response): Promise<void> {
  try {
    const where = { approvalStatus: 'APPROVED', availabilityStatus: { [Op.ne]: 'SOLD' } };
    const count = sequelize.fn('COUNT', sequelize.col('id'));

    const [byIntent, byCity, byState] = await Promise.all([
      Listing.findAll({
        where,
        attributes: ['intent', [count, 'count']],
        group: ['intent'],
        raw: true,
      }),
      Listing.findAll({
        where,
        attributes: ['state', 'city', [count, 'count']],
        group: ['state', 'city'],
        order: [[count, 'DESC']],
        limit: 8,
        raw: true,
      }),
      Listing.findAll({ where, attributes: ['state'], group: ['state'], raw: true }),
    ]);

    const totals: Record<string, number> = { all: 0, RENT: 0, BUY: 0, SHORTLET: 0, SWAP: 0 };
    for (const row of byIntent as any[]) {
      const n = Number(row.count) || 0;
      totals.all += n;
      if (row.intent in totals) totals[row.intent] = n;
    }

    const cities = (byCity as any[])
      .filter((row) => row.city && row.state)
      .map((row) => ({ city: row.city, state: row.state, count: Number(row.count) || 0 }));

    res.json({
      success: true,
      data: {
        totals,
        cities,
        stateCount: (byState as any[]).filter((row) => row.state).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch listing stats', error: error.message });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    let viewerId: string | null = null;
    const header = req.headers.authorization;
    if (header) {
      try {
        const decoded: any = jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
        viewerId = decoded.sub;
      } catch {}
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const listing: any = await Listing.findByPk(id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'firstName', 'surname', 'email', 'role', 'profilePicture'] }],
    });
    if (!listing || (listing.approvalStatus !== 'APPROVED' && listing.ownerId !== viewerId)) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    const reviewSummary = await reviewRepository.summaryFor(listing.id);
    res.json({
      success: true,
      data: { ...listing.get({ plain: true }), reviewSummary },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch listing', error: error.message });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const ownerId = userIdFrom(req);
    const owner = await User.findByPk(ownerId);
    if (!owner || !['owner', 'broker'].includes(owner.role)) {
      res.status(403).json({ success: false, message: 'Only Owners and Brokers can create listings.' });
      return;
    }
    if (owner.kycStatus !== 'APPROVED') {
      res.status(403).json({
        success: false,
        code: 'KYC_REQUIRED',
        kycStatus: owner.kycStatus || 'UNSUBMITTED',
        message: 'Approved Strong KYC is required before submitting a listing.',
      });
      return;
    }
    const required = ['title', 'description', 'intent', 'propertyType', 'price', 'location', 'city', 'state'];
    const missing = required.filter((key) => req.body[key] === undefined || req.body[key] === '');
    if (missing.length) {
      res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
      return;
    }
    if (!Array.isArray(req.body.images) || req.body.images.length < 8) {
      res.status(400).json({ success: false, message: 'At least 8 property photos are required.' });
      return;
    }
    const listing = await sequelize.transaction(async (transaction) => {
      const created = await Listing.create({
        ...req.body,
        intent: String(req.body.intent).toUpperCase(),
        ownerId,
        approvalStatus: 'PENDING',
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        submittedAt: new Date(),
      }, { transaction });
      await ReviewDecision.create({
        subjectType: 'LISTING',
        subjectId: (created as any).id,
        outcome: 'SUBMITTED',
        submittedBy: ownerId,
      }, { transaction });
      return created;
    });
    res.status(201).json({ success: true, message: 'Listing submitted for admin review.', data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create listing', error: error.message });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const ownerId = userIdFrom(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const listing: any = await Listing.findOne({ where: { id, ownerId } });
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    const safe = { ...req.body };
    delete safe.ownerId;
    delete safe.approvalStatus;
    delete safe.rejectionReason;
    delete safe.reviewedAt;
    delete safe.reviewedBy;
    delete safe.availabilityStatus;
    const material = Object.keys(safe).some((key) => MATERIAL_FIELDS.has(key));

    await sequelize.transaction(async (transaction) => {
      if (material) {
        safe.approvalStatus = 'PENDING';
        safe.rejectionReason = null;
        safe.reviewedAt = null;
        safe.reviewedBy = null;
        safe.submittedAt = new Date();
      }
      await listing.update(safe, { transaction });
      if (material) {
        const lastCycle = await ReviewDecision.max('cycle', {
          where: { subjectType: 'LISTING', subjectId: listing.id },
          transaction,
        });
        await ReviewDecision.create({
          subjectType: 'LISTING',
          subjectId: listing.id,
          cycle: Number(lastCycle || 0) + 1,
          outcome: 'RETURNED_TO_PENDING',
          submittedBy: ownerId,
        }, { transaction });
        await Notification.create({
          userId: ownerId,
          title: 'Listing returned to review',
          message: `"${listing.title}" was materially edited and is pending admin approval again.`,
          type: 'LISTING_RETURNED_TO_PENDING',
          link: '/owner/listings',
          metadata: { listingId: listing.id },
        }, { transaction });
      }
    });
    res.json({
      success: true,
      message: material ? 'Listing updated and returned to pending review.' : 'Listing updated.',
      data: listing,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update listing', error: error.message });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const count = await Listing.destroy({ where: { id: req.params.id, ownerId: userIdFrom(req) } });
    if (!count) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }
    res.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete listing', error: error.message });
  }
}

export default { list, locations, stats, getOne, create, update, remove, MATERIAL_FIELDS };
