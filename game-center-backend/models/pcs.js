// models/pcs.js
module.exports = (sequelize, DataTypes) => {
    const PC = sequelize.define(
      'PC',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING, // Use BOOLEAN if you only need true/false for 'busy'/'free'
          allowNull: false,
          defaultValue: 'free', // Default status if desired
        },
      },
      {
        tableName: 'pcs', // Explicitly set table name if different from model name
        timestamps: false, // Set to true if createdAt/updatedAt are needed
        freezeTableName: true, // Ensures 'pcs' remains as table name
      }
    );
  
    return PC;
  };
  