import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User } from '../Authentication/model';
import { BrokerProfile, OwnerProfile } from '../Profile/model';
import { UserVerification } from '../Verification/model';
import { PropertyAgentAuthorization, Commission, AgentRating } from './model';
import { MainProperty as Listing } from '../Owner/model';

interface AuthRequest extends Request {
  user?: any;
}

export class AgentController {
  // ── 1. Submit or Update Agent Licence ─────────────────────────────────────
  async submitLicence(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { licenceNumber, licenceIssuer, licenceExpiryDate, licenceDocumentUrl } = req.body;

      if (!licenceNumber || !licenceIssuer) {
        return res.status(400).json({
          success: false,
          message: 'licenceNumber and licenceIssuer are required',
        });
      }

      let brokerProfile = await BrokerProfile.findOne({ where: { userId } });
      if (!brokerProfile) {
        // Create if missing
        const user = await User.findByPk(userId);
        brokerProfile = await BrokerProfile.create({
          userId,
          emailAddress: user?.email || '',
        });
      }

      await brokerProfile.update({
        licenceNumber,
        licenceIssuer,
        licenceExpiryDate: licenceExpiryDate || null,
        licenceDocumentUrl: licenceDocumentUrl || null,
        licenceStatus: 'PENDING',
      });

      // Upsert UserVerification record for AGENT_LICENCE
      let verification = await UserVerification.findOne({
        where: { userId, verificationType: 'AGENT_LICENCE' },
      });

      if (!verification) {
        verification = await UserVerification.create({
          userId,
          verificationType: 'AGENT_LICENCE',
          status: 'PENDING',
          submittedAt: new Date(),
        });
      } else {
        await verification.update({
          status: 'PENDING',
          submittedAt: new Date(),
          rejectionReason: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Agent licence submitted successfully and pending admin review',
        data: {
          brokerProfile,
          verification,
        },
      });
    } catch (error: any) {
      console.error('Error submitting licence:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit licence details',
        error: error.message,
      });
    }
  }

  // ── 2. Owner Issues Agent Authorization ────────────────────────────────────
  async createAuthorization(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.id;
      const { agentId, propertyId, authorizedIntents, commissionRate, expiresAt } = req.body;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'agentId is required',
        });
      }

      // Check target agent exists and has broker role
      const agentUser = await User.findByPk(agentId);
      if (!agentUser || agentUser.role !== 'broker') {
        return res.status(404).json({
          success: false,
          message: 'Target user is not a registered agent/broker',
        });
      }

      // If propertyId specified, ensure owner owns property
      if (propertyId) {
        const property: any = await Listing.findByPk(propertyId as string);
        if (!property || property.userId !== ownerId) {
          return res.status(403).json({
            success: false,
            message: 'Property does not exist or does not belong to you',
          });
        }
      }

      const authorization = await PropertyAgentAuthorization.create({
        ownerId,
        agentId,
        propertyId: propertyId || null,
        status: 'ACTIVE', // Automatically active when owner issues it directly
        authorizedIntents: authorizedIntents || ['RENT', 'BUY', 'SHORTLET', 'SWAP'],
        commissionRate: commissionRate || 5.00,
        expiresAt: expiresAt || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Owner-Agent listing authorization issued successfully',
        data: authorization,
      });
    } catch (error: any) {
      console.error('Error creating authorization:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create agent authorization',
        error: error.message,
      });
    }
  }

  // ── 3. Update / Revoke Authorization Status ────────────────────────────────
  async updateAuthorizationStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { status } = req.body; // 'ACTIVE', 'REVOKED'

      if (!['ACTIVE', 'REVOKED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be ACTIVE or REVOKED',
        });
      }

      const authorization: any = await PropertyAgentAuthorization.findByPk(id);
      if (!authorization) {
        return res.status(404).json({
          success: false,
          message: 'Authorization record not found',
        });
      }

      if (authorization.ownerId !== userId && authorization.agentId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to modify this authorization',
        });
      }

      await authorization.update({ status });

      return res.status(200).json({
        success: true,
        message: `Authorization updated to ${status}`,
        data: authorization,
      });
    } catch (error: any) {
      console.error('Error updating authorization:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update authorization',
        error: error.message,
      });
    }
  }

  // ── 4. Get Agent Authorizations List ──────────────────────────────────────
  async getAuthorizations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;

      const whereClause: any = role === 'owner' ? { ownerId: userId } : { agentId: userId };

      const authorizations = await PropertyAgentAuthorization.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'agent', attributes: ['id', 'firstName', 'surname', 'email'] },
          { model: User, as: 'owner', attributes: ['id', 'firstName', 'surname', 'email'] },
          { model: Listing, as: 'property', attributes: ['id', 'title', 'location', 'price'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: authorizations,
      });
    } catch (error: any) {
      console.error('Error fetching authorizations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch authorizations',
        error: error.message,
      });
    }
  }

  // ── 5. Agent Commission Ledger ─────────────────────────────────────────────
  async getCommissions(req: AuthRequest, res: Response) {
    try {
      const agentId = req.user?.id;

      const commissions = await Commission.findAll({
        where: { agentId },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'firstName', 'surname', 'email'] },
          { model: Listing, as: 'property', attributes: ['id', 'title', 'location', 'price'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      const totalAccrued = commissions
        .filter((c: any) => c.status === 'ACCRUED')
        .reduce((sum: number, c: any) => sum + Number(c.amount), 0);

      const totalPaid = commissions
        .filter((c: any) => c.status === 'PAID')
        .reduce((sum: number, c: any) => sum + Number(c.amount), 0);

      return res.status(200).json({
        success: true,
        data: {
          summary: { totalAccrued, totalPaid },
          records: commissions,
        },
      });
    } catch (error: any) {
      console.error('Error fetching commissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch agent commissions',
        error: error.message,
      });
    }
  }

  // ── 6. Seeker Submits Agent Rating ────────────────────────────────────────
  async submitRating(req: AuthRequest, res: Response) {
    try {
      const seekerId = req.user?.id;
      const { agentId, rating, review, bookingId } = req.body;

      if (!agentId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'agentId and valid rating (1-5) are required',
        });
      }

      const agentUser = await User.findByPk(agentId);
      if (!agentUser) {
        return res.status(404).json({
          success: false,
          message: 'Agent user not found',
        });
      }

      const newRating = await AgentRating.create({
        agentId,
        seekerId,
        bookingId: bookingId || null,
        rating,
        review: review || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Agent rating submitted successfully',
        data: newRating,
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit agent rating',
        error: error.message,
      });
    }
  }

  // ── 7. Get Agent Public Profile & Ratings ─────────────────────────────────
  async getAgentPublicProfile(req: Request, res: Response) {
    try {
      const agentId = req.params.id as string;

      const user = await User.findByPk(agentId, {
        attributes: ['id', 'firstName', 'surname', 'email', 'phoneNumber', 'createdAt'],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found',
        });
      }

      const brokerProfile = await BrokerProfile.findOne({ where: { userId: agentId } });
      const ratings = await AgentRating.findAll({
        where: { agentId },
        include: [{ model: User, as: 'seeker', attributes: ['id', 'firstName', 'surname'] }],
        order: [['createdAt', 'DESC']],
      });

      const closedDealsCount = await Commission.count({
        where: { agentId, status: 'PAID' },
      });

      const activeAuthorizationsCount = await PropertyAgentAuthorization.count({
        where: { agentId, status: 'ACTIVE' },
      });

      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? Number((ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / totalRatings).toFixed(1))
          : 0;

      return res.status(200).json({
        success: true,
        data: {
          agent: user,
          profile: brokerProfile,
          metrics: {
            closedDeals: closedDealsCount,
            activeAuthorizations: activeAuthorizationsCount,
          },
          ratings: {
            average: averageRating,
            total: totalRatings,
            reviews: ratings,
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching agent public profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch agent profile',
        error: error.message,
      });
    }
  }

  // ── 8. Search / Directory of Agents ────────────────────────────────────────
  async searchAgents(req: Request, res: Response) {
    try {
      const { q } = req.query as { q?: string };
      const whereUser: any = { role: 'broker' };

      if (q && q.trim()) {
        const queryStr = `%${q.trim()}%`;
        whereUser[Op.or] = [
          { firstName: { [Op.iLike]: queryStr } },
          { surname: { [Op.iLike]: queryStr } },
          { email: { [Op.iLike]: queryStr } },
        ];
      }

      const agents = await User.findAll({
        where: whereUser,
        attributes: ['id', 'firstName', 'surname', 'email', 'createdAt'],
        include: [
          {
            model: BrokerProfile,
            as: 'brokerProfile',
            attributes: [
              'agencyCompanyName',
              'operatingLocations',
              'profilePicture',
              'licenceNumber',
              'licenceIssuer',
              'licenceStatus',
              'isVerified',
            ],
          },
        ],
        limit: 20,
      });

      return res.status(200).json({
        success: true,
        data: agents,
      });
    } catch (error: any) {
      console.error('Error searching agents:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search agents',
        error: error.message,
      });
    }
  }
}

export const agentController = new AgentController();
