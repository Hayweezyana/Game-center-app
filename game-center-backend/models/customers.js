module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
      customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
      name: DataTypes.STRING,
      membership_level: {type: DataTypes.STRING, defaultValue: 'BRONZE',},
      email: { type: DataTypes.STRING, allowNull: true, validate: {
        isEmail: true, // Validate email format
      },unique: true, },
      phone: {type: DataTypes.STRING, allowNull: false, unique: true, defaultValue: 'Unknown',},
      payment_date: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW,},
    }, {
      tableName: 'customers',
      timestamps: false // Disable `createdAt` and `updatedAt`

    });
    
  
    Customer.associate = (models) => {
      Customer.hasMany(models.Queue, {
    // Use a descriptive alias
        foreignKey: 'customer_id', as: 'queues',
        onDelete: 'CASCADE',
      });
    };
  
    return Customer;
  };
  