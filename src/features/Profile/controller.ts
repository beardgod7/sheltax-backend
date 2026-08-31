import { Request, Response } from 'express';
import {
  createProfile,
  createBrokerProfile,
  createOwnerProfile,
  createSeekerPreference,
  findProfileByUserId,
  findBrokerProfileByUserId,
  findOwnerProfileByUserId,
  findProfileById,
  findBrokerProfileById,
  findOwnerProfileById,
  updateProfile,
  updateBrokerProfile,
  updateOwnerProfile,
  updateSeekerPreference,
  deleteProfile,
  getAllProfiles,
  getAllBrokerProfiles,
  getAllOwnerProfiles,
  updateVerificationStatus,
  updateBrokerVerificationStatus,
  updateOwnerVerificationStatus,
  checkProfileCompletion,
  checkBrokerProfileCompletion,
  checkOwnerProfileCompletion,
} from './repository';
import { findUserById } from '../Authentication/repository';
import { User } from '../Authentication/model';
import cloudinary from '../../config/cloudinary';
import { getPagination, paginatedData } from '../../utils/pagination';
import {
  createProfileSchema,
  updateProfileSchema,
  createBrokerProfileSchema,
  updateBrokerProfileSchema,
  createOwnerProfileSchema,
  updateOwnerProfileSchema,
  createSeekerPreferenceSchema,
  updateSeekerPreferenceSchema,
  verificationDocumentsSchema,
} from './schema';
import { ReviewDecision } from '../Listing/model';
import { UserVerification, VerificationDocument } from '../Verification/model';

async function uploadToCloudinary(fileBuffer: Buffer, folder: string, resourceType = 'image'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType as any },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

export async function createSeekerProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const validatedData = await createProfileSchema.validateAsync(req.body);

    const existingProfile = await findProfileByUserId(userId);
    if (existingProfile) {
      res.status(409).json({ message: 'Profile already exists for this user' });
      return;
    }

    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    res.status(201).json({
      message: 'Seeker profile created successfully',
      profile: newProfile,
    });
  } catch (error: any) {
    console.error('Error creating seeker profile:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function createBrokerProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const validatedData = await createBrokerProfileSchema.validateAsync(req.body);

    const existingProfile = await findBrokerProfileByUserId(userId);
    if (existingProfile) {
      res.status(409).json({ message: 'Broker profile already exists for this user' });
      return;
    }

    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkBrokerProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createBrokerProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    res.status(201).json({
      message: 'Broker profile created successfully',
      profile: newProfile,
    });
  } catch (error: any) {
    console.error('Error creating broker profile:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function createOwnerProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const validatedData = await createOwnerProfileSchema.validateAsync(req.body);

    const existingProfile = await findOwnerProfileByUserId(userId);
    if (existingProfile) {
      res.status(409).json({ message: 'Owner profile already exists for this user' });
      return;
    }

    const user = await findUserById(userId);
    const emailAddress = user.email;

    const isComplete = checkOwnerProfileCompletion({
      ...validatedData,
      emailAddress,
    });
    const newProfile = await createOwnerProfile(
      { ...validatedData, emailAddress, isComplete },
      userId
    );

    res.status(201).json({
      message: 'Owner profile created successfully',
      profile: newProfile,
    });
  } catch (error: any) {
    console.error('Error creating owner profile:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((d: any) => d.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function verifyOwnerIdentity(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;

    const existingProfile = await findOwnerProfileByUserId(userId);
    if (!existingProfile) {
      res.status(404).json({
        message: 'Owner profile not found. Please complete Step 2 first.',
      });
      return;
    }

    const files = (req as any).files;
    if (!files || (!files.profilePicture && !files.governmentId && !files.ninCacDocument)) {
      res.status(400).json({
        message: 'At least one verification document is required (profilePicture, governmentId, or ninCacDocument).',
      });
      return;
    }

    const updateData: any = {};

    if (files.profilePicture && files.profilePicture[0]) {
      updateData.profilePicture = await uploadToCloudinary(
        files.profilePicture[0].buffer,
        'owner-verification/profile-pictures'
      );
    }

    if (files.governmentId && files.governmentId[0]) {
      updateData.governmentId = await uploadToCloudinary(
        files.governmentId[0].buffer,
        'owner-verification/government-ids'
      );
    }

    if (files.ninCacDocument && files.ninCacDocument[0]) {
      updateData.ninCacDocument = await uploadToCloudinary(
        files.ninCacDocument[0].buffer,
        'owner-verification/nin-cac-documents'
      );
    }

    updateData.verificationDocuments = {
      profilePicture: updateData.profilePicture || (existingProfile as any).profilePicture,
      governmentId: updateData.governmentId || (existingProfile as any).governmentId,
      ninCacDocument: updateData.ninCacDocument || (existingProfile as any).ninCacDocument,
      submittedAt: new Date().toISOString(),
    };

    const updatedProfile = await updateOwnerProfile(userId, updateData);

    res.status(200).json({
      message: 'Owner identity verification documents uploaded successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in owner identity verification:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function verifyBrokerIdentity(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;

    const existingProfile = await findBrokerProfileByUserId(userId);
    if (!existingProfile) {
      res.status(404).json({
        message: 'Broker profile not found. Please complete Step 2 first.',
      });
      return;
    }

    const files = (req as any).files;
    if (!files || (!files.profilePicture && !files.governmentId && !files.ninCacDocument)) {
      res.status(400).json({
        message: 'At least one verification document is required (profilePicture, governmentId, or ninCacDocument).',
      });
      return;
    }

    const updateData: any = {};

    if (files.profilePicture && files.profilePicture[0]) {
      updateData.profilePicture = await uploadToCloudinary(
        files.profilePicture[0].buffer,
        'broker-verification/profile-pictures'
      );
    }

    if (files.governmentId && files.governmentId[0]) {
      updateData.governmentId = await uploadToCloudinary(
        files.governmentId[0].buffer,
        'broker-verification/government-ids'
      );
    }

    if (files.ninCacDocument && files.ninCacDocument[0]) {
      updateData.ninCacDocument = await uploadToCloudinary(
        files.ninCacDocument[0].buffer,
        'broker-verification/nin-cac-documents'
      );
    }

    updateData.verificationDocuments = {
      profilePicture: updateData.profilePicture || (existingProfile as any).profilePicture,
      governmentId: updateData.governmentId || (existingProfile as any).governmentId,
      ninCacDocument: updateData.ninCacDocument || (existingProfile as any).ninCacDocument,
      submittedAt: new Date().toISOString(),
    };

    const updatedProfile = await updateBrokerProfile(userId, updateData);

    res.status(200).json({
      message: 'Broker identity verification documents uploaded successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in broker identity verification:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function createSeekerPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const validatedData = await createSeekerPreferenceSchema.validateAsync(req.body);

    const profile: any = await findProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({
        message: 'Seeker profile not found. Please create a profile first.',
      });
      return;
    }

    const preferences = await createSeekerPreference(validatedData, profile.id);

    res.status(201).json({
      message: 'Seeker preferences created successfully',
      preferences,
    });
  } catch (error: any) {
    console.error('Error creating seeker preferences:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateSeekerPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.sub;
    const validatedData = await updateSeekerPreferenceSchema.validateAsync(req.body);

    const profile: any = await findProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ message: 'Seeker profile not found' });
      return;
    }

    const updatedPreferences = await updateSeekerPreference(profile.id, validatedData);

    res.status(200).json({
      message: 'Seeker preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error: any) {
    console.error('Error updating seeker preferences:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.id || reqUser?.sub || reqUser?.userId;
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let profile: any = null;

    switch (user.role) {
      case 'seeker':
        profile = await findProfileByUserId(user.id);
        break;
      case 'broker':
        profile = await findBrokerProfileByUserId(user.id);
        break;
      case 'owner':
        profile = await findOwnerProfileByUserId(user.id);
        break;
      case 'admin':
      case 'super_admin':
        res.status(200).json({
          message: 'Profile retrieved successfully',
          profile: null,
          hasProfile: false,
          user,
        });
        return;
      default:
        break;
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile: profile || null,
      hasProfile: !!profile,
      user,
    });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export function sanitizeProfile(profile: any, requesterId?: string, requesterRole?: string): any {
  if (!profile) return null;
  const p = typeof profile.toJSON === 'function' ? profile.toJSON() : { ...profile };

  const isOwner = requesterId && (p.userId === requesterId || p.id === requesterId);
  const isAdmin = requesterRole && ['admin', 'super_admin'].includes(requesterRole);

  if (isOwner || isAdmin) {
    return p;
  }

  delete p.governmentId;
  delete p.ninCacDocument;
  delete p.verificationDocuments;
  delete p.creditScore;
  delete p.monthlyIncome;
  delete p.annualIncome;

  return p;
}

export async function getProfileById(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { type } = req.query;

    if (!type || !['seeker', 'broker', 'owner'].includes(type as string)) {
      res.status(400).json({
        message: 'Valid type parameter is required (seeker, broker, or owner)',
      });
      return;
    }

    let profile: any = null;

    switch (type) {
      case 'seeker':
        profile = await findProfileById(id as string);
        break;
      case 'broker':
        profile = await findBrokerProfileById(id as string);
        break;
      case 'owner':
        profile = await findOwnerProfileById(id as string);
        break;
    }

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const reqUser = (req as any).user;
    const requesterId = reqUser?.sub || reqUser?.id;
    const requesterRole = reqUser?.role;
    const sanitized = sanitizeProfile(profile, requesterId, requesterRole);

    res.status(200).json({ message: 'Profile retrieved successfully', profile: sanitized });
  } catch (error: any) {
    console.error('Error getting profile by ID:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser.sub;
    const userRole = reqUser.role;

    let validatedData: any, existingProfile: any, updatedProfile: any;

    switch (userRole) {
      case 'seeker':
        validatedData = await updateProfileSchema.validateAsync(req.body);
        existingProfile = await findProfileByUserId(userId);
        if (!existingProfile) {
          res.status(404).json({ message: 'Seeker profile not found' });
          return;
        }
        const mergedSeekerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const seekerIsComplete = checkProfileCompletion(mergedSeekerData);
        updatedProfile = await updateProfile(userId, {
          ...validatedData,
          isComplete: seekerIsComplete,
        });
        break;

      case 'broker':
        validatedData = await updateBrokerProfileSchema.validateAsync(req.body);
        existingProfile = await findBrokerProfileByUserId(userId);
        if (!existingProfile) {
          res.status(404).json({ message: 'Broker profile not found' });
          return;
        }
        const mergedBrokerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const brokerIsComplete = checkBrokerProfileCompletion(mergedBrokerData);
        updatedProfile = await updateBrokerProfile(userId, {
          ...validatedData,
          isComplete: brokerIsComplete,
        });
        break;

      case 'owner':
        validatedData = await updateOwnerProfileSchema.validateAsync(req.body);
        existingProfile = await findOwnerProfileByUserId(userId);
        if (!existingProfile) {
          res.status(404).json({ message: 'Owner profile not found' });
          return;
        }
        const mergedOwnerData = {
          ...existingProfile.toJSON(),
          ...validatedData,
        };
        const ownerIsComplete = checkOwnerProfileCompletion(mergedOwnerData);
        updatedProfile = await updateOwnerProfile(userId, {
          ...validatedData,
          isComplete: ownerIsComplete,
        });
        break;

      default:
        res.status(400).json({ message: 'Invalid user role' });
        return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function uploadProfilePicture(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser.sub;
    const userRole = reqUser.role;

    if (!req.file) {
      res.status(400).json({ message: 'No profile picture uploaded' });
      return;
    }

    const profilePictureUrl = await uploadToCloudinary(
      req.file.buffer,
      'profile-pictures'
    );

    let updatedProfile: any;
    switch (userRole) {
      case 'seeker':
        updatedProfile = await updateProfile(userId, { profilePicture: profilePictureUrl });
        break;
      case 'broker':
        updatedProfile = await updateBrokerProfile(userId, { profilePicture: profilePictureUrl });
        break;
      case 'owner':
        updatedProfile = await updateOwnerProfile(userId, { profilePicture: profilePictureUrl });
        break;
      default:
        res.status(400).json({ message: 'Invalid user role' });
        return;
    }

    if (!updatedProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
    });
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function getAllUserProfiles(req: Request, res: Response): Promise<void> {
  try {
    const { state, role, isVerified, gender } = req.query as any;

    const filters: any = {};
    if (state) filters.state = state;
    if (role) filters.role = role;
    if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
    if (gender) filters.gender = gender;

    const pagination = getPagination(req.query);
    const { count, rows: profiles } = await getAllProfiles(filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Profiles retrieved successfully',
      data: paginatedData('profiles', profiles, count, pagination),
    });
  } catch (error: any) {
    console.error('Error getting all profiles:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function getProfilesByUserRole(req: Request, res: Response): Promise<void> {
  try {
    const role = (Array.isArray(req.params.role) ? req.params.role[0] : req.params.role) as string;
    const { state, isVerified, isActive, minRating, budgetMin, budgetMax } = req.query as any;

    if (!['broker', 'owner', 'seeker'].includes(role)) {
      res.status(400).json({ message: "Invalid role. Must be 'broker', 'owner', or 'seeker'" });
      return;
    }

    const filters: any = {};
    if (state) filters.state = state;
    if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (minRating) filters.minRating = parseFloat(minRating);
    if (budgetMin) filters.budgetMin = parseFloat(budgetMin);
    if (budgetMax) filters.budgetMax = parseFloat(budgetMax);

    const pagination = getPagination(req.query);
    let result: any;
    switch (role) {
      case 'seeker':
        result = await getAllProfiles(filters, pagination);
        break;
      case 'broker':
        result = await getAllBrokerProfiles(filters, pagination);
        break;
      case 'owner':
        result = await getAllOwnerProfiles(filters, pagination);
        break;
    }

    const reqUser = (req as any).user;
    const requesterId = reqUser?.sub || reqUser?.id;
    const requesterRole = reqUser?.role;
    const sanitizedRows = (result.rows || []).map((row: any) =>
      sanitizeProfile(row, requesterId, requesterRole)
    );

    res.status(200).json({
      success: true,
      message: `${role} profiles retrieved successfully`,
      data: paginatedData('profiles', sanitizedRows, result.count, pagination),
    });
  } catch (error: any) {
    console.error('Error getting profiles by role:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function deleteUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser.sub;
    const userRole = reqUser.role;

    const deleted = await deleteProfile(userId, userRole);
    if (!deleted) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateProfileVerification(req: Request, res: Response): Promise<void> {
  try {
    const userId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId) as string;
    const { isVerified, role } = req.body;

    if (typeof isVerified !== 'boolean') {
      res.status(400).json({ message: 'isVerified must be a boolean value' });
      return;
    }

    if (!role || !['broker', 'owner', 'seeker'].includes(role)) {
      res.status(400).json({ message: 'Valid role is required (broker, owner, or seeker)' });
      return;
    }

    let updatedProfile: any;
    switch (role) {
      case 'seeker':
        updatedProfile = await updateVerificationStatus(userId, isVerified);
        break;
      case 'broker':
        updatedProfile = await updateBrokerVerificationStatus(userId, isVerified);
        break;
      case 'owner':
        updatedProfile = await updateOwnerVerificationStatus(userId, isVerified);
        break;
    }

    if (!updatedProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json({
      message: `Profile ${isVerified ? 'verified' : 'unverified'} successfully`,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function uploadVerificationDocuments(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser.sub;
    const userRole = reqUser.role;
    const validatedData = await verificationDocumentsSchema.validateAsync(req.body);

    let updatedProfile: any;
    switch (userRole) {
      case 'seeker':
        updatedProfile = await updateProfile(userId, { verificationDocuments: validatedData.documents });
        break;
      case 'broker':
        updatedProfile = await updateBrokerProfile(userId, { verificationDocuments: validatedData.documents });
        break;
      case 'owner':
        updatedProfile = await updateOwnerProfile(userId, { verificationDocuments: validatedData.documents });
        break;
      default:
        res.status(400).json({ message: 'Invalid user role' });
        return;
    }

    if (!updatedProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Verification documents uploaded successfully',
      documents: validatedData.documents,
    });
  } catch (error: any) {
    console.error('Error uploading verification documents:', error);
    if (error.isJoi) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((detail: any) => detail.message),
      });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function submitKyc(req: Request, res: Response): Promise<void> {
  try {
    const reqUser = (req as any).user;
    const userId = reqUser?.id || reqUser?.sub || reqUser?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    let {
      profilePictureUrl,
      governmentIdUrl,
      governmentIdType,
      ninNumber,
      ninDocumentUrl,
      cacDocumentUrl,
      businessRegistrationNumber,
    } = req.body || {};
    const missing: string[] = [];
    if (!profilePictureUrl) missing.push('profilePictureUrl');
    if (!governmentIdUrl) missing.push('governmentIdUrl');
    if (!ninNumber || !/^\d{11}$/.test(String(ninNumber).trim())) missing.push('valid 11-digit ninNumber');
    if (!ninDocumentUrl) missing.push('ninDocumentUrl');
    if (missing.length) {
      res.status(400).json({
        success: false,
        message: `Missing or invalid Strong KYC fields: ${missing.join(', ')}`,
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    if (!['owner', 'broker'].includes(user.role)) {
      res.status(403).json({ success: false, message: 'Strong KYC is only available to Owners and Brokers.' });
      return;
    }
    if (user.kycStatus === 'APPROVED') {
      res.status(409).json({ success: false, message: 'Strong KYC is already approved.' });
      return;
    }

    const uploadIfBase64 = async (fileData: string, folder = 'shelta-x/kyc') => {
      if (!fileData) return fileData;
      if (
        fileData.startsWith('data:image/') ||
        fileData.startsWith('data:application/')
      ) {
        try {
          const result = await cloudinary.uploader.upload(fileData, {
            folder,
            resource_type: 'auto',
          });
          return result.secure_url;
        } catch (err: any) {
          console.error('Cloudinary upload failed in submitKyc:', err.message);
        }
      }
      return fileData;
    };

    profilePictureUrl = await uploadIfBase64(profilePictureUrl, 'shelta-x/kyc/avatars');
    governmentIdUrl = await uploadIfBase64(governmentIdUrl, 'shelta-x/kyc/government-ids');
    ninDocumentUrl = await uploadIfBase64(ninDocumentUrl, 'shelta-x/kyc/nin');
    cacDocumentUrl = await uploadIfBase64(cacDocumentUrl, 'shelta-x/kyc/cac');

    if (profilePictureUrl) user.profilePicture = profilePictureUrl;
    if (governmentIdUrl) user.governmentId = governmentIdUrl;
    if (ninNumber) user.ninVerification = ninNumber;
    if (businessRegistrationNumber) user.businessRegistrationNumber = businessRegistrationNumber;
    if (ninDocumentUrl || cacDocumentUrl) {
      user.ninCacDocument = ninDocumentUrl || cacDocumentUrl;
    }
    user.kycStatus = 'PENDING';
    user.kycRejectionReason = null;
    await user.save();

    const currentCycle = Number((await ReviewDecision.max('cycle', {
      where: { subjectType: 'KYC', subjectId: user.id },
    })) || 0) + 1;

    await ReviewDecision.create({
      subjectType: 'KYC',
      subjectId: user.id,
      cycle: currentCycle,
      outcome: 'SUBMITTED',
      submittedBy: user.id,
    });

    const [identityVerification] = await UserVerification.findOrCreate({
      where: { userId: user.id, verificationType: 'IDENTITY' },
      defaults: { status: 'PENDING', submittedAt: new Date(), cycle: currentCycle },
    });
    await identityVerification.update({ status: 'PENDING', submittedAt: new Date(), rejectionReason: null, cycle: currentCycle });

    const [ninVerification] = await UserVerification.findOrCreate({
      where: { userId: user.id, verificationType: 'NIN' },
      defaults: { status: 'PENDING', submittedAt: new Date(), cycle: currentCycle },
    });
    await ninVerification.update({ status: 'PENDING', submittedAt: new Date(), rejectionReason: null, cycle: currentCycle });

    const idVer = identityVerification as any;
    const ninVer = ninVerification as any;

    if (profilePictureUrl) {
      await VerificationDocument.create({
        userId: user.id,
        verificationId: idVer.id,
        documentType: 'PROFILE_PICTURE',
        fileUrl: profilePictureUrl,
        isPrivate: false,
        status: 'PENDING',
      });
    }

    if (governmentIdUrl) {
      await VerificationDocument.create({
        userId: user.id,
        verificationId: idVer.id,
        documentType: 'GOVERNMENT_ID',
        fileUrl: governmentIdUrl,
        isPrivate: true,
        status: 'PENDING',
      });
    }

    if (ninDocumentUrl) {
      await VerificationDocument.create({
        userId: user.id,
        verificationId: ninVer.id,
        documentType: 'NIN_SLIP',
        fileUrl: ninDocumentUrl,
        isPrivate: true,
        status: 'PENDING',
      });
    }

    if (cacDocumentUrl) {
      const [cacVerification] = await UserVerification.findOrCreate({
        where: { userId: user.id, verificationType: 'CAC' },
        defaults: { status: 'PENDING', submittedAt: new Date(), cycle: currentCycle },
      });
      await cacVerification.update({ status: 'PENDING', submittedAt: new Date(), rejectionReason: null, cycle: currentCycle });
      const cacVer = cacVerification as any;

      await VerificationDocument.create({
        userId: user.id,
        verificationId: cacVer.id,
        documentType: 'CAC_CERTIFICATE',
        fileUrl: cacDocumentUrl,
        isPrivate: true,
        status: 'PENDING',
      });
    }

    if (user.role === 'owner') {
      const ownerProfile: any = await findOwnerProfileByUserId(userId);
      if (ownerProfile) {
        if (profilePictureUrl) ownerProfile.profilePicture = profilePictureUrl;
        if (governmentIdUrl) ownerProfile.governmentId = governmentIdUrl;
        if (governmentIdType) ownerProfile.governmentIdType = governmentIdType;
        if (ninNumber) ownerProfile.ninCacNumber = ninNumber;
        if (businessRegistrationNumber) ownerProfile.businessRegistrationNumber = businessRegistrationNumber;
        await ownerProfile.save();
      }
    } else if (user.role === 'broker') {
      const brokerProfile: any = await findBrokerProfileByUserId(userId);
      if (brokerProfile) {
        if (profilePictureUrl) brokerProfile.profilePicture = profilePictureUrl;
        if (governmentIdUrl) brokerProfile.governmentId = governmentIdUrl;
        if (governmentIdType) brokerProfile.governmentIdType = governmentIdType;
        if (ninNumber) brokerProfile.ninCacNumber = ninNumber;
        if (businessRegistrationNumber) brokerProfile.businessRegistrationNumber = businessRegistrationNumber;
        await brokerProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'KYC documents submitted successfully and sent for admin review.',
      kycStatus: 'PENDING',
      urls: {
        profilePictureUrl,
        governmentIdUrl,
        ninDocumentUrl,
        cacDocumentUrl,
      },
    });
  } catch (error: any) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}
