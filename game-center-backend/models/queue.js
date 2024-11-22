const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Queue = sequelize.define(
      'Queue',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        customer_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        game_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        pc_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        membership_level: DataTypes.STRING,
        created_at: {
          type: DataTypes.DATE, // Alternatively, use Sequelize's createdAt timestamp
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        status: DataTypes.STRING,
      },
      {
        tableName: 'queue', // Explicit table name
        timestamps: true, // Disable Sequelize's auto timestamps if custom timestamps are not required
        freezeTableName: true, // Prevents Sequelize from pluralizing the table name
        underscored: true,
      }
    );
  
    Queue.associate = (models) => {
      Queue.belongsTo(models.Game, { foreignKey: 'game_id' });
      Queue.belongsTo(models.PC, { foreignKey: 'pc_id' });
      Queue.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    };
  
    return Queue;
  };
  