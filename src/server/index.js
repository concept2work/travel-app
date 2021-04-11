// Dotenv is used to read values from the .env file.
const dotenv = require('dotenv');

// Express is used to run server and routes.
const express = require('express');

// Cors is used for cross origin allowance.
const cors = require('cors');

// The i18n-iso-countries module retrieves language codes and their respective names.
const countries = require('i18n-iso-countries');

// An instance of app is started.
const app = express();

// File system specific modules.
const fs = require('fs');
const path = require('path');

// Middleware to process timeouts
const timeout = require('connect-timeout');

// Module to query the APIs.
const queryService = require('./js/queryServices.js');

// Library that allows the use of environment variables.
dotenv.config();

// Creating dist folder if it does not exist yet.
const distPath = path.join(`${process.cwd()}`, '/dist');
// If the folder does not exist yet, it gets created.
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// Creating a cache folder for downloads from Pixabay.
const cachePath = path.join(`${process.cwd()}/dist`, '/cache');
// If the folder does not exist yet, it gets created.
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath);
}

// A fallback home page image is copied to the dist path
fs.copyFile(path.join(`${process.cwd()}`, '/src/client/media/img/smart-vagabond-background-default.jpg'), `${cachePath}/smart-vagabond-background-default.jpg`, (err) => {
  if (err) throw err;
});

/*
  Setting a timeout of 30 seconds for feedback
  purposes.
*/
const serverTimeOut = '30s';

// An empty JS object acts as endpoint for the routes.
let projectData = {};

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

// In development mode the server redirects to to the frontend.
app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.redirect(301, `http://localhost:${process.env.PORT_DEV_FRONTEND}`);
  }
  next();
});

// The user input is processed and the APIs are queried.
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
    process.env.GEONAMES_USER,
    projectData.city,
    projectData.countryCode,
    projectData.date,
    projectData.daysUntilTrip,
  )
    .catch()
    .then((response) => queryService.queryWeatherbit(process.env.WEATHERBIT_API_KEY, response))
    .catch()
    .then((response) => queryService.queryDbPedia(response))
    .catch()
    .then((response) => queryService.queryPixabay(process.env.PIXABAY_API_KEY, response))
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

// getCountries exposes an object consisting of country codes and their respective names.
const getCountries = (req, res) => {
  res.send(countries.getNames('en', { select: 'official' }));
};
app.get('/api/getCountries', getCountries);

/*
  Route to query Pixabay for a random image which is used on the
  home page if no city is queried yet.
*/
const homePageImage = async (req, res) => {
  const image = {
    topic: 'city travel',
  };
  queryService.queryPixabay(process.env.PIXABAY_API_KEY, image)
    .then(
      (response) => queryService.downloadFile(response),
    )
    .catch(
      (error) => {
        console.error('the following error occured: ', error.message);
      },
    )
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
