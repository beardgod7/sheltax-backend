import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const table = await queryInterface.describeTable('properties');
    if (!table.deletedAt) {
      await queryInterface.addColumn('properties', 'deletedAt', { type: DataTypes.DATE, allowNull: true }, { transaction });
    }

    await queryInterface.createTable(
      'property_reviews',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        propertyId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'properties', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        seekerId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'User', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        rating: {
          type: DataTypes.SMALLINT,
          allowNull: false,
        },
        body: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        inspectionId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'inspections', key: 'id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        publishedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        editedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.addIndex('property_reviews', ['propertyId', 'seekerId'], {
      unique: true,
      name: 'property_reviews_one_per_seeker_idx',
      transaction,
    });
    await queryInterface.addIndex('property_reviews', ['propertyId', 'publishedAt'], {
      name: 'property_reviews_listing_recent_idx',
      transaction,
    });
    await queryInterface.addIndex('property_reviews', ['seekerId', 'publishedAt'], {
      name: 'property_reviews_seeker_idx',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
