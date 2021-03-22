const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

//Configure the  environment variables
dotenv.config({ path: './config/config.env' });
//connect database
connectDB();

//import the routes
// rest to route to the bootcamps  post in express
const bootcamps = require('./routes/bootcamps');
//Route to the Courses  link
const courses = require('./routes/courses');
// route to require authorization page
const auth = require('./routes/auth');
//importing routes
const users = require('./routes/users');
const reviews = require('./routes/reviews');
//Instantiating the app Express
const app = express();
built in middleware
//tell express to interpret incoming request as json
app.use(express.json());
//places all cookies in the request  information  
app.use(cookieParser());
//configure development environment 
//conditional if node is in the development environment, log the request activity
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Upload file from server.js in order to run and 
app.use(fileupload());
//Check for viruses
app.use(mongoSanitize());
//helps protect apps from viruses in the browser 
app.use(helmet());
// provides http headers to  provide virus protection 
//helps to protect xss attacks 
app.use(xss());
// limits the number of request made/ms
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);
// http parameter pollution attacks 
app.use(hpp());
//enable cross origin  resource sharing 
app.use(cors());
//serves static files in public directory 
app.use(express.static(path.join(__dirname, 'public')));
// adding routs to express app.
app.use('/api/v1/bootcamps', bootcamps);
// go to route and launch bootcamp.js and  query the database schema 
app.use('/api/v1/courses', courses);
//
app.use('/api/v1/auth', auth);
//
app.use('/api/v1/users', users);
//
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
