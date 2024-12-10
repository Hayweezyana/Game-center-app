module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      title: {
          type: DataTypes.STRING,
          allowNull: false
      },
      url: {
          type: DataTypes.STRING,
          allowNull: false
      },
      price: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      time_slot:{
        type: DataTypes.INTEGER,
        allowNull: false
      },
      
  }, {
    tableName: 'games',
      timestamps: false // Disable `createdAt` and `updatedAt`
      
  });

    Game.associate = (models) => {
        // One-to-Many: Game can have multiple Queue entries
        Game.hasMany(models.Queue, {
          foreignKey: 'game_id',
          onDelete: 'CASCADE',
        });
    
        // Many-to-Many: Game can be assigned to multiple PCs
        Game.belongsToMany(models.PC, {
          through: 'GamePCMapping', // This is the join table
          foreignKey: 'game_id',
          otherKey: 'pc_id',
          
        });
      };

    return Game;
  };
  