const Sequelize = require( 'sequelize' );
const database = require( './database' );

const User = database.define( 'users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    avatar: {
        type: Sequelize.STRING,

    }
}, {
    timestamps: true
});


const File = database.define( 'files', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    f_name: {
        type: Sequelize.STRING,
    },
    course: {
        type: Sequelize.STRING,
    }, 
    course_num: {
        type: Sequelize.STRING,
    },
    user_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    description: {
        type: Sequelize.STRING
    }
}, {
    timestamps: true
});


const Comment = database.define( 'comments', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING,
    },
    file_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
            model: 'files',
            key: 'id'
        }
    },
    name: {
        type: Sequelize.STRING
    }
}, {
    timestamps: true
});


File.belongsTo( User, { foreignKey: 'user_id' } );
Comment.belongsTo( File, { foreignKey: 'file_id' } );

database.sync();

module.exports.File = File;
module.exports.Comment = Comment;
module.exports.User = User;
