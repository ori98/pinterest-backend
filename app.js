const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const {sequelize} = require('./models');
// const {Sequelize} = require('./config/MySequelize');
const apiErrorHandler = require('./errors/ApiError.handler');
// const fileUpload = require('express-fileupload');

const app = express();

// Routes
const indexRouter = require('./routes/index');

app.use(cors())
// app.use(fileUpload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(apiErrorHandler);

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        sequelize.sync({alter: false}).then(() => {
            console.log("Tables Created if not exists!")
        });
    }).catch(err => {
    console.error('Unable to connect to the database:', err);
});

app.listen(8000, () => {
    console.log("Server is running on port 8000")
})

module.exports = app;