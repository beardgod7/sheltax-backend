import { Op, WhereOptions } from 'sequelize';
import { Property, User, SeekerProfile, OwnerProfile, BrokerProfile } from '../models';
import { PropertyApprovalStatus } from '../models/property.model';

export interface AdminPropertyQuery {
  status?: PropertyApprovalStatus | 'ALL';
  intent?: string;
  q?: string;
  limit?: string | number;
}

export interface AdminUserQuery {
  role?: string;
  q?: string;
  verifiedOnly?: string | boolean;
}

export class AdminService {
  public static async getStats() {
    const totalProperties = await Property.count();
    const pendingProperties = await Property.count({ where: { approvalStatus: 'PENDING' } });
    const approvedProperties = await Property.count({ where: { approvalStatus: 'APPROVED' } });
    const rejectedProperties = await Property.count({ where: { approvalStatus: 'REJECTED' } });

    const totalUsers = await User.count();
    const seekersCount = await User.count({ where: { role: 'seeker' } });
    const ownersCount = await User.count({ where: { role: 'owner' } });
    const brokersCount = await User.count({ where: { role: 'broker' } });
    const verifiedUsersCount = await User.count({ where: { isVerified: true } });

    const ownerProfilesWithKyc = await OwnerProfile.count({
      where: {
        [Op.or]: [
          { ninVerification: { [Op.ne]: null } },
          { governmentIdUrl: { [Op.ne]: null } },
          { ninCacDocumentUrl: { [Op.ne]: null } },
        ],
      },
    });

    const brokerProfilesWithKyc = await BrokerProfile.count({
      where: {
        [Op.or]: [
          { ninVerification: { [Op.ne]: null } },
          { governmentIdUrl: { [Op.ne]: null } },
          { ninCacDocumentUrl: { [Op.ne]: null } },
        ],
      },
    });

    return {
      properties: {
        total: totalProperties,
        pending: pendingProperties,
        approved: approvedProperties,
        rejected: rejectedProperties,
      },
      users: {
        total: totalUsers,
        seekers: seekersCount,
        owners: ownersCount,
        brokers: brokersCount,
        verified: verifiedUsersCount,
      },
      kyc: {
        pendingOwnerSubmissions: ownerProfilesWithKyc,
        pendingBrokerSubmissions: brokerProfilesWithKyc,
      },
    };
  }

  public static async getProperties(query: AdminPropertyQuery) {
    const whereClause: WhereOptions = {};

    if (query.status && query.status !== 'ALL') {
      whereClause.approvalStatus = query.status;
    }

    if (query.intent && query.intent !== 'ALL') {
      whereClause.intent = query.intent.toUpperCase();
    }

    if (query.q && query.q.trim().length > 0) {
      const searchTerm = `%${query.q.trim()}%`;
      whereClause[Op.or as unknown as keyof WhereOptions] = [
        { title: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
        { location: { [Op.iLike]: searchTerm } },
        { city: { [Op.iLike]: searchTerm } },
        { state: { [Op.iLike]: searchTerm } },
      ];
    }

    const limit = query.limit ? Math.min(Number(query.limit), 100) : undefined;

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'surname', 'email', 'phoneNumber', 'role', 'isVerified'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return properties;
  }

  public static async updatePropertyStatus(
    id: string,
    approvalStatus: PropertyApprovalStatus,
    rejectionReason?: string
  ) {
    const property = await Property.findByPk(id);
    if (!property) {
      return null;
    }

    property.approvalStatus = approvalStatus;
    if (approvalStatus === 'REJECTED') {
      property.rejectionReason = rejectionReason || 'Property details did not meet Shelta-X standards.';
    } else {
      property.rejectionReason = null;
    }

    await property.save();
    return property;
  }

  public static async getUsers(query: AdminUserQuery) {
    const whereClause: WhereOptions = {};

    if (query.role && query.role !== 'ALL') {
      whereClause.role = query.role.toLowerCase();
    }

    if (query.verifiedOnly === 'true' || query.verifiedOnly === true) {
      whereClause.isVerified = true;
    }

    if (query.q && query.q.trim().length > 0) {
      const searchTerm = `%${query.q.trim()}%`;
      whereClause[Op.or as unknown as keyof WhereOptions] = [
        { firstName: { [Op.iLike]: searchTerm } },
        { surname: { [Op.iLike]: searchTerm } },
        { email: { [Op.iLike]: searchTerm } },
        { phoneNumber: { [Op.iLike]: searchTerm } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password', 'otpHash', 'refreshToken'] },
      include: [
        { model: SeekerProfile, as: 'seekerProfile' },
        { model: OwnerProfile, as: 'ownerProfile' },
        { model: BrokerProfile, as: 'brokerProfile' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return users;
  }

  public static async updateUserVerification(userId: string, isVerified: boolean, rejectionReason?: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    user.isVerified = isVerified;
    user.kycStatus = isVerified ? 'APPROVED' : 'REJECTED';
    user.kycLevel = isVerified ? 'NIN_VERIFIED' : 'BASIC';
    await user.save();

    if (!isVerified && rejectionReason) {
      if (user.role === 'owner') {
        const profile = await OwnerProfile.findOne({ where: { userId } });
        if (profile) {
          profile.rejectionReason = rejectionReason;
          await profile.save();
        }
      } else if (user.role === 'broker') {
        const profile = await BrokerProfile.findOne({ where: { userId } });
        if (profile) {
          profile.rejectionReason = rejectionReason;
          await profile.save();
        }
      }
    }

    return user;
  }
}
