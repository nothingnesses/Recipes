var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const pgp = require('pg-promise')();
require('dotenv').config();
const db = pgp(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_URL}`);

const cors_options = {
	origin: [process.env.FRONTEND_URL]
};

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(cors_options));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
