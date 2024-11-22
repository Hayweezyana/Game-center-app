module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      payment_id: {
        type: DataTypes.INTEGER, // Should match the database type
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.STRING, // Should match the `customer_id` type in the `customers` table
        allowNull: false,
        references: {
          model: 'customers', // Referencing the `customers` table
          key: 'customer_id', // Referencing the `customer_id` column
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE, // Use `DATE` for date fields
        allowNull: false,
      },
    },
    {
      tableName: 'payments',
      timestamps: true, // Enable `createdAt` and `updatedAt` fields
    }
  );

  // Define associations
  Payment.associate = (models) => {
    Payment.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      onDelete: 'CASCADE',
    });
  };

  return Payment;
};
