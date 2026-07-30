import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const tableName = (await queryInterface.showAllTables()).includes('User1') ? 'User1' : 'User';
    const table = await queryInterface.describeTable(tableName);

    if (!table.username) {
      await queryInterface.addColumn(tableName, 'username', { type: DataTypes.STRING(255), allowNull: true }, { transaction });
    }
    if (!table.googleId) {
      await queryInterface.addColumn(tableName, 'googleId', { type: DataTypes.STRING(255), allowNull: true, unique: true }, { transaction });
    }
    if (!table.profilePicture) {
      await queryInterface.addColumn(tableName, 'profilePicture', { type: DataTypes.STRING(500), allowNull: true }, { transaction });
    }
    if (!table.signup_channel) {
      await queryInterface.addColumn(
        tableName,
        'signup_channel',
        { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'manual' },
        { transaction }
      );
    }

    await queryInterface.changeColumn(
      tableName,
      'password',
      { type: DataTypes.STRING, allowNull: true },
      { transaction }
    );

    await queryInterface.addIndex(tableName, ['googleId'], {
      name: 'idx_user1_google_id',
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
