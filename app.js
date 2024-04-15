const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandeler = require('./controllers/errorController');
const bodyParser = require('body-parser');
const session = require('express-session');

// Routers

// App
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files
app.use(helmet()); // set security HTTP headers
app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(
  hpp({
    whitelist: [],
  })
); // Prevent parameter pollution
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); //Limit requests from same API,  Because of DOS and Brute Force Attacks

// Routes

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandeler);

module.exports = app;
