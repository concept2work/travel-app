// Dotenv is used to read values from the .env file
const dotenv = require('dotenv');

// Express is used to run server and routes.
const express = require('express');

// Cors is used for cross origin allowance.
const cors = require('cors');

// The i18n-iso-countries module retrieves language codes and their respective names.
const countries = require('i18n-iso-countries');

// An instance of app is started.
const app = express();

const fs = require('fs');

const path = require('path');

/*
  Middleware to process timeouts
*/
const timeout = require('connect-timeout');

const queryService = require('./js/queryServices.js');

// Library that allows the use of environment variables
dotenv.config();

/*
  Static resources from node_modules are referenced to make them available
  for index.html and app.js
*/

/*
  open-weather-icons provide a font that refer to the icon ID that is provided by the
  Open Weather API. This way the matching icon can be easily displayed.
*/
app.use('/open-weather-icons', express.static(`${__dirname}/node_modules/open-weather-icons/dist/`));

/*
  Creating dist folder if it does not exist yet.
*/
const distPath = path.join(`${process.cwd()}`, '/dist');
// If the folder does not exist yet, it gets created.
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

/*
  Creating a cache folder for downloads from Pixabay.
*/
const dirPath = path.join(`${process.cwd()}/dist`, '/cache');
// If the folder does not exist yet, it gets created.
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

/*
  Setting a timeout of 120 seconds (server standard time) for feedback
  purposes in specific routes.
*/
const serverTimeOut = '120s';

/*
  Empty JS objects act as endpoints for the routes regarding request and response data
  to/from the server.
*/
const requestData = {};
const responseData = {};

/* An empty JS object acts as endpoint for the routes regarding the user and weather data */
let projectData = {};
const locationInfo = {};

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(timeout(serverTimeOut));

// In production mode the home page is set to the index file in the dist folder.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

/*
  Depending on whether development or production is used, the port varies.
  The specific value is read from the environment file.
*/
const getPort = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PORT_PROD;
  }
  if (process.env.NODE_ENV === 'development') {
    return process.env.PORT_DEV_BACKEND;
  }
  return null;
};

// The port can vary and is retrieved with the getPort() function.
app.listen(getPort(), () => {
  console.log(`server is running on localhost:${getPort()}`);
});

// The server routes are defined.

// In development mode the server redirects to to the frontend.
app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.redirect(301, `http://localhost:${process.env.PORT_DEV_FRONTEND}`);
  }
  next();
});

/*
  When weather information is received on the postWeather route
  the projectData object is updated with that information.
*/
const processUserInput = async (req, res) => {
  console.log(`daysUntilTrip: ${req.body.daysUntilTrip}`);
  // Date from date picker is formatted
  const dateFormatted = new Date(req.body.date).toISOString().slice(0, -14);
  projectData = {
    city: req.body.city,
    countryCode: req.body.countryCode,
    date: dateFormatted,
    preferredLanguage: req.body.preferredLanguage,
    daysUntilTrip: req.body.daysUntilTrip,
  };
  await queryService.getGeoData(
    projectData.city, projectData.countryCode, projectData.date, projectData.daysUntilTrip,
  )
    .catch()
    .then((response) => queryService.queryWeatherbit(response))
    .catch()
    .then((response) => queryService.queryDbPedia(response))
    .catch()
    .then((response) => queryService.queryPixabay(response))
    .catch()
    .then((response) => queryService.downloadFile(response))
    .catch()
    .then((response) => res.send(response))
    .catch((error) => {
      console.error('the following error occured: ', error.message);
      if (error.message === "Cannot read property 'daysUntilTrip' of null") {
        return res.send({
          error: 'City was not found.',
        });
      } return res.send({
        error: 'There was an internal server error.',
      });
    });
};
app.post('/api/postUserSelection', processUserInput);

// The getCountries exposes an object consisting of country codes and their respective names.
const getCountries = (req, res) => {
  res.send(countries.getNames('en', { select: 'official' }));
};
app.get('/api/getCountries', getCountries);

const homePageImage = async (req, res) => {
  const image = {
    topic: 'city travel',
  };
  queryService.queryPixabay(image)
    .then((response) => queryService.downloadFile(response))
    .then((response) => res.send(response));
};
app.get('/api/getHomePageImage', homePageImage);

// Error handling
app.use((err, req, res, next) => {
  if (res.status(504)) {
    /*
      Workaround to reset timeout adapted from Marcos Casagrande and Arup Rakshit
      (https://stackoverflow.com/questions/55364401/express-js-connect-timeout-vs-server-timeout)
    */
    req.socket.removeAllListeners('timeout');
    // Sending a timeout specific error message to the client
    res.send({
      error: 'There was a server time out. Please try again later.',
    });
  }
  next();
});
