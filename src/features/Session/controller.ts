import { Request, Response } from 'express';
import { Session } from './model';
import { Op } from 'sequelize';

export async function getUserSessionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.sub || reqUser?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const sessions = await Session.findAll({
      where: {
        userId,
        revokedAt: null,
      },
      attributes: ['id', 'deviceInfo', 'ipAddress', 'lastActiveAt', 'createdAt'],
      order: [['lastActiveAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

export async function revokeSessionHandler(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.sub || reqUser?.id;
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required.' });
      return;
    }

    const session: any = await Session.findByPk(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const isOwner = session.userId === userId;
    const isAdmin = ['admin', 'super_admin'].includes(reqUser?.role);
    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'Forbidden: Cannot revoke another user session.' });
      return;
    }

    session.revokedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully.',
    });
  } catch (error: any) {
    console.error('Error revoking session:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

export async function revokeAllSessionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.sub || reqUser?.id;
    const { exceptSessionId } = req.body || {};

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const whereCondition: any = {
      userId,
      revokedAt: null,
    };

    if (exceptSessionId) {
      whereCondition.id = { [Op.ne]: exceptSessionId };
    }

    await Session.update(
      { revokedAt: new Date() },
      { where: whereCondition }
    );

    res.status(200).json({
      success: true,
      message: 'All other sessions revoked successfully.',
    });
  } catch (error: any) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}
