import { Request, Response } from 'express';
import { UserVerification, VerificationDocument, PropertyOwnershipRecord, PropertyVerification } from './model';
import { Listing } from '../Listing/model';
import { logAuditAction } from '../Audit/service';

export async function getUserVerificationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.sub || reqUser?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const verifications = await UserVerification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const documents = await VerificationDocument.findAll({
      where: { userId },
      attributes: ['id', 'documentType', 'isPrivate', 'status', 'createdAt'],
    });

    res.status(200).json({
      success: true,
      data: {
        verifications,
        documents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

export async function getDocumentSignedUrl(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const requesterId = reqUser?.sub || reqUser?.id;
    const requesterRole = reqUser?.role;
    const documentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!documentId) {
      res.status(400).json({ success: false, message: 'Document ID is required.' });
      return;
    }

    const doc: any = await VerificationDocument.findByPk(documentId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }

    const isOwner = doc.userId === requesterId;
    const isAdmin = ['admin', 'super_admin'].includes(requesterRole);

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this document.',
      });
      return;
    }

    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

    await logAuditAction({
      actorId: requesterId,
      action: 'DOCUMENT_ACCESSED',
      resourceType: 'VERIFICATION_DOCUMENT',
      resourceId: doc.id,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      changes: { documentType: doc.documentType, ownerId: doc.userId },
    });

    res.status(200).json({
      success: true,
      data: {
        documentId: doc.id,
        documentType: doc.documentType,
        signedUrl: doc.fileUrl,
        expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error generating document URL:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}

export async function submitPropertyOwnership(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.sub || reqUser?.id;
    const { propertyId, ownershipType, documentUrl } = req.body;

    if (!propertyId || !ownershipType || !documentUrl) {
      res.status(400).json({
        success: false,
        message: 'propertyId, ownershipType, and documentUrl are required.',
      });
      return;
    }

    const listing: any = await Listing.findByPk(propertyId);
    if (!listing) {
      res.status(404).json({ success: false, message: 'Property listing not found.' });
      return;
    }

    if (listing.ownerId !== userId && !['admin', 'super_admin'].includes(reqUser.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not own this property listing.' });
      return;
    }

    const record = await PropertyOwnershipRecord.create({
      propertyId,
      ownerId: userId,
      ownershipType,
      documentUrl,
      verificationStatus: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Property ownership record submitted successfully for verification.',
      data: record,
    });
  } catch (error: any) {
    console.error('Error submitting property ownership:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}
