var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');

var app = express();

// ROUTES
const login = require('./routes/login');
const registerRouter = require('./routes/register');
const bookingRoute = require('./routes/routeSelection');
const seatLockRoute = require('./routes/seatLock');
const loggedInPage = require('./routes/loggedInUser');

// DB CONFIG
const DB_URL = require('./config/keys').MongoURI;

// CONNECT MONGODB
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log("MongoDB Error: ", err);
});

// MIDDLEWARE
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// ROUTES
app.use('/', login);
app.use('/register', registerRouter);
app.use('/booking', bookingRoute);
app.use('/seat-locks', seatLockRoute);

app.use('/user', loggedInPage);

module.exports = app;