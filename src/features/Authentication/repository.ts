import { User, Token } from './model';
import { Op } from 'sequelize';

export async function createUser(data: any) {
  try {
    const user = await User.create(data);
    return user;
  } catch (error: any) {
    console.error('Full Error Object:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    const result = await User.update(updates, {
      where: { id: userId },
      returning: true,
    });
    return result[1]?.[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  return await User.findOne({
    where: {
      email: { [Op.iLike]: email },
    },
  });
}

export async function findUserById(userId: string) {
  return await User.findByPk(userId);
}

export async function saveVerificationCode(userId: string, code: string) {
  return await Token.create({
    userId,
    token: code,
    token_type: 'verify_account',
    expiresIn: new Date(Date.now() + 3600000),
  });
}

export async function storeRefreshToken(userId: string, token: string) {
  return await Token.create({
    userId,
    token,
    token_type: 'refresh_token',
    expiresIn: new Date(Date.now() + 24 * 3600000),
  });
}

export async function findRefreshToken(token: string) {
  return await Token.findOne({
    where: { token, token_type: 'refresh_token' },
  });
}

export async function getAllUsersWithProfiles(pagination: any) {
  return await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset,
  });
}

export async function findOrCreateGoogleUser(userData: any) {
  let user = await User.findOne({
    where: {
      email: { [Op.iLike]: userData.email },
    },
  });

  let isNewUser = false;

  if (user) {
    if (!user.googleId && userData.googleId) {
      user.googleId = userData.googleId;
      user.profilePicture = userData.profilePicture;
      user.signup_channel = 'google';
      await user.save();
    }
  } else {
    user = await User.create({
      email: userData.email,
      username: userData.username,
      googleId: userData.googleId,
      profilePicture: userData.profilePicture,
      signup_channel: userData.signup_channel,
      verified: userData.verified,
      role: 'seeker',
    });
    isNewUser = true;
  }

  (user as any).isNewUser = isNewUser;
  return user;
}

export async function findOrCreateTwitterUser(userData: any) {
  let user = await User.findOne({
    where: {
      twitterId: userData.twitterId,
    },
  });

  let isNewUser = false;

  if (!user && userData.email) {
    user = await User.findOne({
      where: {
        email: { [Op.iLike]: userData.email },
      },
    });

    if (user) {
      user.twitterId = userData.twitterId;
      user.profilePicture = userData.profilePicture || user.profilePicture;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      email: userData.email,
      username: userData.username,
      twitterId: userData.twitterId,
      profilePicture: userData.profilePicture,
      signup_channel: 'twitter',
      verified: true,
      role: 'seeker',
    });
    isNewUser = true;
  }

  (user as any).isNewUser = isNewUser;
  return user;
}

export async function findOrCreateFacebookUser(userData: any) {
  let user = await User.findOne({
    where: {
      facebookId: userData.facebookId,
    },
  });

  let isNewUser = false;

  if (!user && userData.email) {
    user = await User.findOne({
      where: {
        email: { [Op.iLike]: userData.email },
      },
    });

    if (user) {
      user.facebookId = userData.facebookId;
      user.profilePicture = userData.profilePicture || user.profilePicture;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      email: userData.email,
      username: userData.username,
      facebookId: userData.facebookId,
      profilePicture: userData.profilePicture,
      signup_channel: 'facebook',
      verified: true,
      role: 'seeker',
    });
    isNewUser = true;
  }

  (user as any).isNewUser = isNewUser;
  return user;
}
