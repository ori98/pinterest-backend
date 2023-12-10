const {Sequelize} = require('sequelize');
let sequelize

sequelize = new Sequelize('pinterest_db', 'root', '', {
    host: "localhost",
    port: 3306,
    dialect: 'mysql',
    dialectOptions: {
        autoJsonMap: false,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
})

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        sequelize.sync({alter: true}).then(() => {
            console.log("Tables Created if not exists!")
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;