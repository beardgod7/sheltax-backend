import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const userTable = await queryInterface.describeTable('User');
    if (!userTable.kycStatus) {
      await queryInterface.addColumn(
        'User',
        'kycStatus',
        { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'UNSUBMITTED' },
        { transaction }
      );
    }
    if (!userTable.kycLevel) {
      await queryInterface.addColumn(
        'User',
        'kycLevel',
        { type: DataTypes.STRING(32), allowNull: true, defaultValue: 'BASIC' },
        { transaction }
      );
    }
    if (!userTable.kycRejectionReason) {
      await queryInterface.addColumn('User', 'kycRejectionReason', { type: DataTypes.TEXT, allowNull: true }, { transaction });
    }

    await queryInterface.sequelize.query(
      `UPDATE "User" SET verified = TRUE WHERE "kycStatus" IN ('PENDING', 'APPROVED', 'REJECTED') AND verified = FALSE;`,
      { transaction }
    );

    const propertiesTable = await queryInterface.describeTable('properties');
    if (!propertiesTable.address) {
      await queryInterface.addColumn('properties', 'address', { type: DataTypes.STRING(500), allowNull: true }, { transaction });
    }
    if (!propertiesTable.reviewedAt) {
      await queryInterface.addColumn('properties', 'reviewedAt', { type: DataTypes.DATE, allowNull: true }, { transaction });
    }
    if (!propertiesTable.reviewedBy) {
      await queryInterface.addColumn('properties', 'reviewedBy', { type: DataTypes.UUID, allowNull: true }, { transaction });
    }
    if (!propertiesTable.submittedAt) {
      await queryInterface.addColumn(
        'properties',
        'submittedAt',
        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        { transaction }
      );
    }

    await queryInterface.createTable(
      'review_decisions',
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        subjectType: { type: DataTypes.STRING(16), allowNull: false },
        subjectId: { type: DataTypes.UUID, allowNull: false },
        cycle: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        outcome: { type: DataTypes.STRING(32), allowNull: false },
        reason: { type: DataTypes.TEXT, allowNull: true },
        reviewerId: { type: DataTypes.UUID, allowNull: true },
        submittedBy: { type: DataTypes.UUID, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { transaction }
    );

    await queryInterface.addIndex('review_decisions', ['subjectType', 'subjectId', 'cycle'], {
      name: 'review_decisions_subject_idx',
      transaction,
    });

    await queryInterface.createTable(
      'notifications',
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        type: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'SYSTEM' },
        isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        link: { type: DataTypes.STRING(500), allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { transaction }
    );

    await queryInterface.addIndex('notifications', ['userId', 'createdAt'], {
      name: 'notifications_user_created_idx',
      transaction,
    });

    try {
      await queryInterface.removeConstraint('inspections', 'inspections_propertyId_fkey', { transaction });
    } catch {}

    await queryInterface.addConstraint('inspections', {
      fields: ['propertyId'],
      type: 'foreign key',
      name: 'inspections_propertyId_fkey',
      references: { table: 'properties', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
