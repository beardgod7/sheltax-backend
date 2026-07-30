import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const table = await queryInterface.describeTable('properties');
    if (!table.availabilityStatus) {
      await queryInterface.addColumn(
        'properties',
        'availabilityStatus',
        {
          type: DataTypes.ENUM('AVAILABLE', 'RESERVED', 'SOLD'),
          allowNull: false,
          defaultValue: 'AVAILABLE',
        },
        { transaction }
      );
    }

    await queryInterface.addIndex('properties', ['availabilityStatus', 'approvalStatus'], {
      name: 'properties_availability_idx',
      transaction,
    });

    await queryInterface.createTable(
      'payments',
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        listingId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'properties', key: 'id' },
          onDelete: 'CASCADE',
        },
        buyerId: { type: DataTypes.UUID, allowNull: false },
        sellerId: { type: DataTypes.UUID, allowNull: false },
        inspectionId: { type: DataTypes.UUID, allowNull: true },
        amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        platformFee: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
        totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'NGN' },
        provider: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'MOCK' },
        reference: { type: DataTypes.STRING(64), allowNull: false, unique: true },
        status: {
          type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        failureReason: { type: DataTypes.TEXT, allowNull: true },
        paidAt: { type: DataTypes.DATE, allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { transaction }
    );

    await queryInterface.addIndex('payments', ['buyerId', 'createdAt'], {
      name: 'payments_buyer_idx',
      transaction,
    });
    await queryInterface.addIndex('payments', ['listingId', 'status'], {
      name: 'payments_listing_idx',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
