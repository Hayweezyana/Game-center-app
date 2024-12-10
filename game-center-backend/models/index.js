const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};
db.Op = Sequelize.Op; // Make Sequelize.Op available throughout the app


// Import the Sequelize instance from `config/db.js`
const sequelize = require('../config/db');

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  console.log('Loaded models:', Object.keys(db));
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;




