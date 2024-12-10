const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Queue = sequelize.define(
    'Queue',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pc_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      countdown: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remaining_time: {
        type: DataTypes.INTEGER, // Time in seconds
        allowNull: true,
      },
      membership_level: {
        type: DataTypes.STRING,
        defaultValue: 'BRONZE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'waiting',
      },
    },
    {
      tableName: 'queue',
      timestamps: false,
      underscored: true,
    }
  );

  Queue.associate = (models) => {
    Queue.belongsTo(models.Game, { foreignKey: 'id', as: 'game' });
    Queue.belongsTo(models.PC, { foreignKey: 'id', as: 'pc' });
    Queue.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
  };

  return Queue;
};
