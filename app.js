require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
require('./passport');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
db.once('open', (err) => {
  err ? console.log(err) : console.log('connected');
});

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

var app = express();

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.listen(4000 || process.env.PORT, () => {
  console.log('listening on PORT 4000');
});

module.exports = app;
