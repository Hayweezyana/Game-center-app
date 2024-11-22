module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
      customer_id: { type: DataTypes.STRING, primaryKey: true },
      name: DataTypes.STRING,
      membership_level: DataTypes.STRING,
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: DataTypes.STRING,
      payment_date: DataTypes.STRING,
    }, {
      tableName: 'customers',
      timestamps: false // Disable `createdAt` and `updatedAt`

    });
    
  
    Customer.associate = (models) => {
      Customer.hasMany(models.Queue, {
        tableName: 'customers',
        foreignKey: 'customer_id',
        as: 'queues',  // Use a descriptive alias
        onDelete: 'CASCADE',
      });
    };
  
    return Customer;
  };
  