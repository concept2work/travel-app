// Express is used to run server and routes.
const express = require('express');

// Node fetch is required to query the external API via fetch()
const fetch = require('node-fetch');

// Modules required for image download
const path = require('path');
const fs = require('fs');
const request = require('request');

// The i18n-iso-countries module retrieves language codes and their respective names.
const countries = require('i18n-iso-countries');

// Module to send queries to SPARQL endpoints, used to query DBpedia
const { SparqlEndpointFetcher } = require('fetch-sparql-endpoint');

const WBK = require('wikibase-sdk');
const { data } = require('autoprefixer');

const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql',
});

let locationInfo = {
};

// Function for image download
// https://stackoverflow.com/questions/12740659/downloading-images-with-node-js
const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const logObject = (object = {}) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(object)) {
    console.log(`${key}: ${value}`);
  }
};

/*
  DBpedia is queried for additional information. DBpedia provides a SPARQL endpoint
  which is queried with the help of the fetch-sparql-endpoint library. As additional
  information the full abstract of a city's Wikipedia article is tried to retrieve.
*/
const queryDbPedia = async (queryType, longitude, latitude, city) => {
  /*
    Todo: explain distinction between query types.
    The article of a city is tried to retrieve via the latitude and longitude values
    that are provided by the Geonames API. The coordinates get adjusted since they do
    not match exactly the values in DBpedia. Therefore a range is set via various FILTER
    settings in the SPARQL query.
  */
  let queryLimit = '';
  let queryTypeSuffix = '';
  if (queryType === 'SELECT' || queryType === 'SELECT DISTINCT') {
    queryTypeSuffix = '?place ?abstract';
    queryLimit = 'LIMIT 1';
  }
  const cityDbResource = city.replace(/ /g, '_');
  const longLess = parseFloat(longitude) - 0.15;
  const longMore = parseFloat(longitude) + 0.15;
  const latLess = parseFloat(latitude) - 0.15;
  const latMore = parseFloat(latitude) + 0.15;
  const fetcher = new SparqlEndpointFetcher();
  const sparqlQuery = `PREFIX : <http://dbpedia.org/resource/>
  ${queryType} ${queryTypeSuffix}
  WHERE {
    VALUES ?cityType { schema:City wikidata:Q486972 } 
    ?place geo:lat ?lat.
    ?place geo:long ?long.
    ?place rdf:type ?cityType.
    ?place rdfs:label ?label.
    ?place dbo:abstract ?abstract.
    FILTER (?lat <= "${latMore}"^^xsd:float)
    FILTER (?lat >= "${latLess}"^^xsd:float)
    FILTER (?long <= "${longMore}"^^xsd:float)
    FILTER (?long >= "${longLess}"^^xsd:float)
    FILTER (lang(?abstract) = 'en' and lang(?label) = 'en')
    FILTER (?place = :${cityDbResource})
  } ${queryLimit}`;
  // console.log(`sparqlQuery: ${sparqlQuery}`);
  try {
    // The query's answer is parsed
    if (queryType === 'SELECT' || queryType === 'SELECT DISTINCT') {
      const answer = await fetcher.fetchBindings('https://dbpedia.org/sparql', sparqlQuery);
      return answer;
    }
    if (queryType === 'ASK') {
      const answer = await fetcher.fetchAsk('https://dbpedia.org/sparql', sparqlQuery);
      return answer;
    }
  } catch (error) {
    console.error('the following error occured: ', error.message);
  }
  return null;
};

// Function to query WikiData
const queryWikiData = async (input) => {
  const uri = wdk.searchEntities({
    search: input,
  });
  const res = await fetch(uri);
  console.log(`get Info from WikiData: ${uri}`);
  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      const wikiInfo = await res.json();
      // const parsedInfo = wdk.parse.wd.entities(wikiInfo);
      // console.log(parsedInfo);
      // return parsedInfo;
      console.log(wikiInfo.search);
    }
    /*
        In any other case an error message is displayed to the user.
        The error message is retrieved from the API to provide a meaningful
        error message to the user.
      */
    if (!res.ok) {
      const errorData = await res.json();
    }
  } catch (error) {
    console.error('the following error occured: ', error.message);
  }
  return null;
};

const queryPixabay = async (object = {}) => {
  const apiKey = process.env.PIXABAY_API_KEY;
  const uri = `https://pixabay.com/api/?key=${apiKey}&q=${object.city}+${object.countryName}&image_type=photo&orientation=horizontal`;
  const res = await fetch(encodeURI(uri));
  console.log(`get Info from Pixabay API: ${encodeURI(uri)}`);
  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      const response = await res.json();
      console.log(`Pixabay response: ${response.hits[0].largeImageURL}`);
      const pixabayImages = response.hits;

      /* Todo: explain why the download is carried out, referenced to the API docs. */
      // The download path is set.
      const dirPath = path.join(`${process.cwd()}/dist`, '/cache');
      console.log(dirPath);

      /*
        Getting the image with the most favorites. The solution to find the image in the
        response object is adapted from senocular
        (https://www.reddit.com/r/javascript/comments/7xhjg9/es6_find_the_maximum_number_of_an_array_of_objects/).
      */
      const selectImage = () => (pixabayImages.reduce(
        (max, image) => (max && max.favorites > image.favorites ? max : image), null,
      ));

      // const getFileName = () => {
      //   const { city } = object;
      //   const { tags } = response.hits[0];
      //   const fileName = `${city}-${tags}.jpg`.replace(/\s+/g, '-').toLowerCase();
      //   return fileName;
      // };
      // console.log(getFileName());

      /*
        The image is downloaded if it was not downloaded before. Therefore a check
        via the image id is carried out.
      */
      fs.access(`${dirPath}/${selectImage().id}.jpg`, fs.F_OK, (err) => {
        // Solution adapted from Flavio Copes
        // (https://flaviocopes.com/how-to-check-if-file-exists-node/)
        if (err) {
          download(selectImage().largeImageURL, `${dirPath}/${selectImage().id}.jpg`, () => {
            console.log(`download of Pixabay image ${selectImage().largeImageURL} with the id ${selectImage().id}`);
          });
        }
        // If the file already exists, nothing happens since the file is already in the folder.
      });
    }
    if (!res.ok) {
      // Todo: get an image of the country as fallback
      const errorData = await res.json();
      console.log(errorData);
      return errorData;
    }
  } catch (error) {
    // Todo: error handling
    console.error('the following error occured: ', error.message);
  }
  logObject(locationInfo);
  return null;
};

const queryWeatherbit = async (object = {}) => {
  const apiKey = process.env.WEATHERBIT_API_KEY;
  // A 16 day forecast for the location is requested
  const uri = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${object.latitude}&lon=${object.longitude}&key=${apiKey}`;
  const res = await fetch(encodeURI(uri));
  console.log(`get Info from Weatherbit API: ${uri}`);
  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      const response = await res.json();

      // The daily forecasts are iterated and appended to the dailyForecast object.
      const getDailyForecasts = () => {
        const dailyForecast = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const forecastInfo of response.data) {
          dailyForecast[`${forecastInfo.valid_date}`] = {
            date: forecastInfo.valid_date,
            temp: forecastInfo.temp,
            code: forecastInfo.weather.code,
            description: forecastInfo.weather.description,
          };
        }
        return dailyForecast;
      };

      // Adding the dailyForecast object to locationInfo
      const getExtensiveForecast = () => {
        Object.defineProperty(locationInfo, 'forecast', {
          writable: true,
          value: [],
        });
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(getDailyForecasts())) {
          locationInfo.forecast[key] = value;
        }
      };
      getExtensiveForecast();

      queryPixabay(locationInfo);

      // Iterating through dates: https://stackoverflow.com/questions/4345045/loop-through-a-date-range-with-javascript
      // console.log(locationInfo.forecast[locationInfo.date]);
      // console.log(locationInfo.forecast['2021-03-26']);
      // console.log(locationInfo.forecast);
    }
    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      return errorData;
    }
  } catch (error) {
    // Todo: error handling
    console.error('the following error occured: ', error.message);
  }
  return null;
};

/*
  Todo: autocomplete:
  https://stackoverflow.com/questions/17957390/how-to-use-jquery-autocomplete-with-node-js
  https://gabrieleromanato.name/nodejs-autocomplete-in-expressjs-with-jquery-ui
*/

/*
    The data for the client is accumulated. In the first step the latitude and longitude
    values from the submitted city are retrieved from the Geonames API.
  */
exports.getData = async (location, countryCode, date) => {
  // Geonames API options
  const userName = process.env.GEONAMES_USER;

  // The API call URI is composed.
  const uri = `http://api.geonames.org/search?name_equals=${location}&country=${countryCode}&username=${userName}&type=json`;
  // Spaces are replaced with dashes for the URI
  const res = await fetch(encodeURI(uri.replace(/\s+/g, '-')));
  console.log(`get Info from GeoNames API: ${uri}`);
  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      const response = await res.json();
      /*
        An array of different locations is returned. The first location is the
        most suitable and therefore the needed data retrieved.
      */
      locationInfo = {
        city: response.geonames[0].name,
        latitude: response.geonames[0].lat,
        longitude: response.geonames[0].lng,
        countryName: response.geonames[0].countryName,
        date,
      };
      /*
        DPpedia is queried for additional information. Via the latitude and longitude values
        the suiting article information is going to be queried. For this procedure two steps
        are neccessary. In the first step a ASK query is run that returns true or false for
        the query. Only if true is returned, the SELECT DISTINCT query is run that returns
        specific data.
      */
      queryDbPedia('ASK', locationInfo.longitude, locationInfo.latitude, locationInfo.city)
        .then(
          (answer) => {
            if (answer === true) {
              // console.log(answer);
              queryDbPedia('SELECT DISTINCT', locationInfo.longitude, locationInfo.latitude, locationInfo.city)
                .then(
                  (bindingsStream) => {
                    bindingsStream.on('data', (bindings) => {
                      // If the promise is successful the abstract is added.
                      locationInfo.abstract = bindings.abstract.value;
                      queryWeatherbit(locationInfo);
                    });
                  },
                  /*
                    Since a ASK query was run that was returned true, no specific error handling
                    is neccessary.
                  */
                );
            }
            if (answer === false) {
              /*
                If there is nothing returned by the ASK query the previously retrieved information
                is transferred.
              */
              queryWeatherbit(locationInfo);
            }
          },
        );
    }
    /*
        In any other case an error message is displayed to the user.
        The error message is retrieved from the API to provide a meaningful
        error message to the user.
      */
    if (!res.ok) {
      const errorData = await res.json();
      return errorData;
    }
  } catch (error) {
    // Todo: Message to UI
    console.error('the following error occured: ', error.message);
  }
  return null;
};

// queryDbPedia('London', 'United Kingdom');

// queryWikiData('Berlin');
