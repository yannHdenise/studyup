const Sequelize = require( 'sequelize' );

// connect to local database
const connectionUrl = 'postgres://study:study@localhost:5432/study'; 
const database = new Sequelize( connectionUrl );

module.exports = database;

