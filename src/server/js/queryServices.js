// Dotenv is used to read values from the .env file
const dotenv = require('dotenv');

// Node fetch is required to query the external API via fetch()
const fetch = require('node-fetch');

// Todo: remove dependencies
// const _ = require('lodash/core');

// Modules required for image download
const path = require('path');
const fs = require('fs');
const request = require('request');

// Module to send queries to SPARQL endpoints, used to query DBpedia
const { SparqlEndpointFetcher } = require('fetch-sparql-endpoint');

// Todo: remove dependencies
// const WBK = require('wikibase-sdk');
// const { data } = require('autoprefixer');

// const wdk = WBK({
//   instance: 'https://www.wikidata.org',
//   sparqlEndpoint: 'https://query.wikidata.org/sparql',
// });

let locationInfo = {
};

// Function for downloading files
// https://stackoverflow.com/questions/12740659/downloading-images-with-node-js
const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const logObject = (object = {}) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(object)) {
    console.log(`${key}: ${value}`);
  }
};

const postData = async (uri, data) => {
  // console.log(`data to post: ${JSON.stringify(data)}`);
  await fetch(uri, {
    method: 'POST',
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).catch((error) => {
    // Todo: Error message to client
    // updateIndex.resetView();
    // updateIndex.removeSpinner();
    // eslint-disable-next-line max-len
    // document.getElementById('results').insertAdjacentHTML('beforeEnd', updateIndex.getServerErrorMessage());
    console.error('the following error occured: ', error.message);
  });
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
    queryTypeSuffix = '?place ?abstract ?area ?population ?comment';
    queryLimit = 'LIMIT 1';
  }
  const cityDbResource = city.replace(/ /g, '_');
  const longLess = parseFloat(longitude) - 0.25;
  const longMore = parseFloat(longitude) + 0.25;
  const latLess = parseFloat(latitude) - 0.25;
  const latMore = parseFloat(latitude) + 0.25;
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
    OPTIONAL {?place dbo:areaTotal ?area}
    OPTIONAL {?place dbo:populationTotal ?population}
    OPTIONAL {?place rdfs:comment ?comment}
    FILTER (?lat <= "${latMore}"^^xsd:float)
    FILTER (?lat >= "${latLess}"^^xsd:float)
    FILTER (?long <= "${longMore}"^^xsd:float)
    FILTER (?long >= "${longLess}"^^xsd:float)
    FILTER (lang(?abstract) = 'en' and lang(?label) = 'en' and lang(?comment) = 'en')
    FILTER (?place = :${cityDbResource})
  } ${queryLimit}`;
  // console.log(`sparqlQuery: ${sparqlQuery}`);
  try {
    // The query's answer is parsed
    if (queryType === 'SELECT' || queryType === 'SELECT DISTINCT') {
      const data = await fetcher.fetchBindings('https://dbpedia.org/sparql', sparqlQuery);
      return data;
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

const queryPixabay = async (object = {}) => {
  const apiKey = process.env.PIXABAY_API_KEY;
  let uri = `https://pixabay.com/api/?key=${apiKey}&q=${object.city}+${object.countryName}&image_type=photo&orientation=horizontal`;
  let res = await fetch(encodeURI(uri));
  console.log(`get city and country info from Pixabay API: ${encodeURI(uri)}`);
  try {
    // The download path is set.
    const dirPath = path.join(`${process.cwd()}/dist`, '/cache');
    // If the API sends OK, text information is returned.
    if (res.ok) {
      // console.log(res.status);
      let response = await res.json();

      /*
        If no image is found for the city and country, a search only for
        the country is carried out.
      */
      if (response.totalHits === 0) {
        // console.log('no hits');
        uri = `https://pixabay.com/api/?key=${apiKey}&q=${object.countryName}&editors_choice=true&category=travel&image_type=photo&orientation=horizontal`;
        console.log(`get country info from Pixabay API: ${encodeURI(uri)}`);
        res = await fetch(encodeURI(uri));
        response = await res.json();
      }

      const pixabayImages = response.hits;

      /*
        Getting the image with the most favorites. The solution to find
        the image in the response object is adapted from senocular
        (https://www.reddit.com/r/javascript/comments/7xhjg9/es6_find_the_maximum_number_of_an_array_of_objects/).
      */
      const selectImage = () => (pixabayImages.reduce(
        (max, image) => (max && max.favorites > image.favorites ? max : image), null,
      ));

      /*
        Hotlinking of images is not allowed. Therefore the image is downloaded if it is
        not cached. Therefore a check via the image id is carried out.
      */
      fs.access(`${dirPath}/${selectImage().id}.jpg`, fs.F_OK, (err) => {
        // Solution adapted from Flavio Copes
        // (https://flaviocopes.com/how-to-check-if-file-exists-node/)
        if (err) {
          download(selectImage().largeImageURL, `${dirPath}/${selectImage().id}.jpg`, () => {
            console.log(`download of Pixabay image ${selectImage().largeImageURL} with the id ${selectImage().id}`);
          });
        }
        // If the file already exists, nothing happens since the file is cached.
      });
      // The image id is appended to the locationInfo object.
      locationInfo.imageId = selectImage().id;

      // console.log(locationInfo.forecast);
      // The data is posted so is can be retrieved by the client in another step
      // Todo: retrieve port dynamically
      postData('http://localhost:8081/api/postApiData', locationInfo);
    }
    if (!res.ok) {
      // console.log(res.status);
      // Todo: set default image
    }
  } catch (error) {
    // Todo: error handling
    console.error('the following error occured: ', error.message);
  }
  // logObject(locationInfo);
  return locationInfo;
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
        for (const [i, forecastInfo] of response.data.entries()) {
          dailyForecast[i] = {
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
          locationInfo.forecast[`forecast_${key}`] = value;
        }
        Object.assign(locationInfo, locationInfo.forecast);
      };
      getExtensiveForecast();

      // Get the image for the location
      // queryPixabay(locationInfo);

      // Iterating through dates: https://stackoverflow.com/questions/4345045/loop-through-a-date-range-with-javascript
      // console.log(locationInfo.forecast[locationInfo.date]);
      // console.log(locationInfo.forecast['2021-03-26']);
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
  return locationInfo;
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
  console.log('GeoNames API is called');
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
                      // locationInfo.wikiPageId = bindings.comment.value;
                      if (bindings.comment) {
                        locationInfo.comment = bindings.comment.value;
                      }
                      if (bindings.area) {
                        locationInfo.area = bindings.area.value;
                      }
                      if (bindings.population) {
                        locationInfo.population = bindings.population.value;
                      }
                      if (bindings.wikiPageId) {
                        locationInfo.wikiPageId = bindings.wikiPageId.value;
                      }
                      // queryWeatherbit(locationInfo);
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
              // queryWeatherbit(locationInfo);
            }
          },
        ).then(
          queryWeatherbit(locationInfo),
        ).then(
          queryPixabay(locationInfo),
        )
        .then(
          postData('http://localhost:8081/api/postApiData', locationInfo),
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

  // Todo: get the final value of locationInfo
  // return null;
};
