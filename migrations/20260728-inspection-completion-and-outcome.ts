import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const table = await queryInterface.describeTable('inspections');

    if (!table.outcome) {
      await queryInterface.addColumn(
        'inspections',
        'outcome',
        { type: DataTypes.ENUM('INTERESTED', 'NOT_INTERESTED', 'NO_SHOW'), allowNull: true },
        { transaction }
      );
    }

    if (!table.completedAt) {
      await queryInterface.addColumn('inspections', 'completedAt', { type: DataTypes.DATE, allowNull: true }, { transaction });
    }

    if (!table.outcomeAt) {
      await queryInterface.addColumn('inspections', 'outcomeAt', { type: DataTypes.DATE, allowNull: true }, { transaction });
    }

    await queryInterface.addIndex('inspections', ['propertyId', 'outcome'], {
      name: 'inspections_outcome_idx',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
