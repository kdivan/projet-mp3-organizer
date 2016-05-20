var Sequelize = require('sequelize');

var sequelize = new Sequelize('esgi', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.');
    }, function (err) {
        console.log('Unable to connect to the database:', err);
    });

var Song = sequelize.define('song', {
    artist: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    year: {
        type: Sequelize.INTEGER(4),
    },
    album: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    file_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    file_path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    directory_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

sequelize
    .sync({ force: false })
    .then(function(message) {
        console.log('It worked!');
    }, function (err) {
        console.log('An error occurred while creating the table:', err);
    });

module.exports = {
    sequelize: sequelize,
    song : Song,
}