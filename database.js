const Sequelize = require('sequelize');

const connectionUrl = 'postgres://study:study@localhost:5432/study';// sayup pa ni
const database = new Sequelize(connectionUrl);

module.exports = database;

