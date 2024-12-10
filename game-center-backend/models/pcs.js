// models/pcs.js
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const PC = sequelize.define(
      'PC',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        status: {
          type: DataTypes.STRING, // Use BOOLEAN if you only need true/false for 'busy'/'free'
          allowNull: false,
          defaultValue: 'available', // Default status if desired
        },
      },
      {
        tableName: 'pcs', // Explicitly set table name if different from model name
        timestamps: false, // Set to true if createdAt/updatedAt are needed
        freezeTableName: true, // Ensures 'pcs' remains as table name
      }
    );

    PC.associate = (models) => {
    PC.hasMany(models.Queue, { foreignKey: 'id', as: 'queues' });
    };

    return PC;
  };
  
  
