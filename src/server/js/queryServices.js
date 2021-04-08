// Node fetch is required to query the external API via fetch()
const fetch = require('node-fetch');

// NLP library to process info texts
const nlp = require('compromise');
nlp.extend(require('compromise-sentences'));

// Modules required for image download
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Module to send queries to SPARQL endpoints, used to query DBpedia
const { SparqlEndpointFetcher } = require('fetch-sparql-endpoint');

const logObject = (object = {}) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(object)) {
    console.log(`${key}: ${value}`);
  }
};

let locationInfo = {
};

/*
  DBpedia is queried for additional information. DBpedia provides a SPARQL endpoint
  which is queried with the help of the fetch-sparql-endpoint library. As additional
  information the full abstract of a city's Wikipedia article is tried to retrieve.
  Via the latitude and longitude values the suiting article information is going to be
  queried. For this procedure two steps are neccessary. In the first step a ASK query
  is run that returns true or false for the query. Only if true is returned, the
  SELECT DISTINCT query is run that returns specific data.
*/
// Todo: read values from object
exports.queryDbPedia = async (object = {}) => {
  /*
    The article of a city is tried to retrieve via the latitude and longitude values
    that are provided by the Geonames API. The coordinates get adjusted since they do
    not match exactly the values in DBpedia. Therefore a range is set via various FILTER
    settings in the SPARQL query.
  */
  const { longitude } = object;
  const { latitude } = object;
  const { city } = object;
  const cityDbResource = city.replace(/ /g, '_');
  const longLess = parseFloat(longitude) - 0.25;
  const longMore = parseFloat(longitude) + 0.25;
  const latLess = parseFloat(latitude) - 0.25;
  const latMore = parseFloat(latitude) + 0.25;
  const fetcher = new SparqlEndpointFetcher();
  const sparqlQuery = (queryType, queryTypeSuffix, queryLimit) => `PREFIX : <http://dbpedia.org/resource/>
  ${queryType} ${queryTypeSuffix}
  WHERE {
    VALUES ?cityType { schema:City wikidata:Q486972 dbo:City } 
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
  console.log(`sparqlQuery: ${sparqlQuery}`);
  try {
    const data = await fetcher.fetchBindings('https://dbpedia.org/sparql', sparqlQuery(
      'SELECT DISTINCT', '?place ?abstract ?area ?population ?comment', 'LIMIT 1',
    ));
    data.on('data', (bindings) => {
      // console.log(`bindings.abstract.value: ${bindings.abstract.value}`);
      // console.log(`nlp: ${nlp(bindings.abstract.value).sentences().data()}`);
      locationInfo.abstract = bindings.abstract.value;
      locationInfo.abstractParsed = nlp(bindings.abstract.value).sentences().data();
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
    });
    return locationInfo;
  } catch (error) {
    console.error('the following error occured: ', error.message);
  }
  return null;
};

exports.queryPixabay = async (object = {}) => {
  const apiKey = process.env.PIXABAY_API_KEY;
  let uri;

  // General query with one key/value from passed object
  uri = `https://pixabay.com/api/?key=${apiKey}&q=${object[Object.keys(object)[0]]}&image_type=photo&orientation=horizontal&per_page=200`;

  // City specific query
  if (object.city && object.countryName) {
    uri = `https://pixabay.com/api/?key=${apiKey}&q=${object.city}+${object.countryName}&image_type=photo&orientation=horizontal&per_page=200`;
  }

  let res = await fetch(encodeURI(uri));
  console.log(`get image from Pixabay API: ${encodeURI(uri)}`);

  // https:// stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
  const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      let response = await res.json();

      /*
        If no image is found for the city and country, a search only for
        the country is carried out.
      */
      if (object.city && object.countryName && response.totalHits === 0) {
        // console.log('no hits');
        uri = `https://pixabay.com/api/?key=${apiKey}&q=${object.countryName}+flag&image_type=photo&orientation=horizontal&per_page=200`;
        console.log(`get country info from Pixabay API: ${encodeURI(uri)}`);
        res = await fetch(encodeURI(uri));
        response = await res.json();
      }

      const pixabayImages = response.hits;

      // Getting a random number
      const randomIndexNumber = randomIntFromInterval(0, 200);

      /*
        Getting the image with the most favorites (city and country search). The solution to find
        the image in the response object is adapted from senocular
        (https://www.reddit.com/r/javascript/comments/7xhjg9/es6_find_the_maximum_number_of_an_array_of_objects/).
        Otherwise a random image is selected.
      */
      const selectImage = () => {
        if (object.city && object.countryName) {
          return (pixabayImages.reduce(
            (max, image) => (max && max.favorites > image.favorites ? max : image), null,
          ));
        }
        return pixabayImages[randomIndexNumber];
      };

      locationInfo.imageId = selectImage().id;
      locationInfo.largeImageURL = selectImage().largeImageURL;
      console.log(`queryPixabay imageId: ${locationInfo.imageId}`);
      return locationInfo;
    }
    if (!res.ok) {
      // console.log(res.status);
      // Todo: set default image
    }
  } catch (error) {
    // Todo: error handling
    console.error('the following error occured: ', error.message);
  }
  return null;
};

/*
  Hotlinking of Pixabay images is not allowed. Therefore the image is downloaded.
  The following solution was adapted by Senthil Muthuvel
  (https://gist.github.com/senthilmpro/072f5e69bdef4baffc8442c7e696f4eb)
  */
exports.downloadFile = async (object = {}) => {
  const uri = object.largeImageURL;
  const { imageId } = object;

  const dirPath = path.join(`${process.cwd()}/dist`, '/cache', `${imageId}.jpg`);

  // Todo: only download if the file is not cached
  // fs.access(`${dirPath}/${imageId.id}.jpg`, fs.F_OK, (err) => {
  //   if (!err) {
  //     console.log('image already there');
  //   }
  //   if (err) {
  //     console.log('image not there');
  //   }
  // });

  // axios image download with response type "stream"
  const response = await axios.get(uri, {
    responseType: 'stream',
  });

  // pipe the result stream into a file on disc
  response.data.pipe(fs.createWriteStream(dirPath));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      console.log(`locationInfo.forecastMonth.month DL ${logObject(locationInfo)}`);
      console.log('resolved');
      resolve(locationInfo);
    });

    response.data.on('error', () => {
      console.log('rejected');
      reject(locationInfo);
    });
  });
};

/*
  Todo: adapt function for requirement If the trip is within a week, you will get the
  current weather forecast. If the trip is in the future, you will get a predicted forecast.
*/
exports.queryWeatherbit = async (object = {}) => {
  const apiKey = process.env.WEATHERBIT_API_KEY;
  let uri = '';

  if (object.daysUntilTrip <= 15) {
    // If the trip is within the next 16 days the forecast for the location is requested.
    uri = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${object.latitude}&lon=${object.longitude}&key=${apiKey}`;
  }

  if (object.daysUntilTrip > 15) {
    /*
      If the trip is later than 16 days the average weather data for the date is retrieved.
      The date is adjusted to match the API's requirements.
    */
    uri = `https://api.weatherbit.io/v2.0/normals?lat=${object.latitude}&lon=${object.longitude}&start_day=${object.date.slice(5)}&end_day=${object.date.slice(5)}&tp=monthly&key=${apiKey}`;
  }

  const res = await fetch(encodeURI(uri));
  console.log(`get Info from Weatherbit API: ${uri}`);
  try {
    // If the API sends OK, text information is returned.
    if (res.ok) {
      const response = await res.json();

      if (object.daysUntilTrip <= 15) {
      // The daily forecasts are iterated and appended to the dailyForecast object.
        const getDailyForecasts = () => {
          const dailyForecast = {};
          // eslint-disable-next-line no-restricted-syntax
          for (const [i, forecastInfo] of response.data.entries()) {
            dailyForecast[i] = {
              date: forecastInfo.valid_date,
              avg_temp: forecastInfo.temp,
              temp_min: forecastInfo.app_min_temp,
              temp_max: forecastInfo.app_max_temp,
              pop: forecastInfo.pop,
              uv: forecastInfo.uv,
              code: forecastInfo.weather.code,
              icon: forecastInfo.weather.icon,
              description: forecastInfo.weather.description,
            };
          }
          return dailyForecast;
        };

        // Adding the dailyForecast object to locationInfo
        const getExtensiveForecast = () => {
          locationInfo.forecastDays = {};
          Object.assign(locationInfo, locationInfo.forecastDays);
          // eslint-disable-next-line no-restricted-syntax
          for (const [key, value] of Object.entries(getDailyForecasts())) {
            locationInfo.forecastDays[`${key}`] = value;
          }
          Object.assign(locationInfo, locationInfo.forecast);
        };
        getExtensiveForecast();
      }
      if (object.daysUntilTrip > 15) {
        locationInfo.forecastMonth = {};
        locationInfo.forecastMonth.month = response.data[0].month;
        locationInfo.forecastMonth.min_temp = response.data[0].min_temp;
        locationInfo.forecastMonth.max_temp = response.data[0].max_temp;
        locationInfo.forecastMonth.avg_temp = response.data[0].temp;
        Object.assign(locationInfo, locationInfo.forecastMonth);
        return locationInfo;
      }
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
    The data for the client is accumulated. In the first step the latitude and longitude
    values from the submitted city are retrieved from the Geonames API.
  */
exports.getGeoData = async (location, countryCode, date, daysUntilTrip) => {
  // Todo: Weather API in distinct function. Start promise chain in this function.
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
        daysUntilTrip,
      };
      return locationInfo;
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
  return null;
};
