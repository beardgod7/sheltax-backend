import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const tableName = (await queryInterface.showAllTables()).includes('User1') ? 'User1' : 'User';
    const table = await queryInterface.describeTable(tableName);

    if (!table.twitterId) {
      await queryInterface.addColumn(tableName, 'twitterId', { type: DataTypes.STRING(255), allowNull: true, unique: true }, { transaction });
    }
    if (!table.facebookId) {
      await queryInterface.addColumn(tableName, 'facebookId', { type: DataTypes.STRING(255), allowNull: true, unique: true }, { transaction });
    }

    await queryInterface.addIndex(tableName, ['twitterId'], {
      name: 'idx_user1_twitter_id',
      transaction,
    });
    await queryInterface.addIndex(tableName, ['facebookId'], {
      name: 'idx_user1_facebook_id',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
