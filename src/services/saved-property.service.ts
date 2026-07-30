import { SavedProperty, Property, User } from '../models';
import { CustomError } from '../middlewares/error.middleware';

export class SavedPropertyService {
  /**
   * Toggle save/favorite status for a property
   */
  static async toggleSaveProperty(userId: string, propertyId: string): Promise<{ isSaved: boolean }> {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      const err: CustomError = new Error('Property not found');
      err.statusCode = 404;
      throw err;
    }

    const existingSave = await SavedProperty.findOne({
      where: { userId, propertyId },
    });

    if (existingSave) {
      await existingSave.destroy();
      return { isSaved: false };
    } else {
      await SavedProperty.create({ userId, propertyId });
      return { isSaved: true };
    }
  }

  /**
   * Get all properties saved by a user
   */
  static async getSavedProperties(userId: string): Promise<Property[]> {
    const savedRecords = await SavedProperty.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'surname', 'email', 'role'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return savedRecords
      .map((record) => record.property)
      .filter((prop): prop is Property => prop !== null && prop !== undefined);
  }

  /**
   * Get list of saved property IDs for a user
   */
  static async getSavedPropertyIds(userId: string): Promise<string[]> {
    const savedRecords = await SavedProperty.findAll({
      where: { userId },
      attributes: ['propertyId'],
    });

    return savedRecords.map((r) => r.propertyId);
  }
}
