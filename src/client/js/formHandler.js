/* eslint-disable max-len */
// Import UIkit components
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

// Function that sets the whole server path to a relative API path
const queryLocalServer = (path) => {
  if (process.env.NODE_ENV === 'production') {
    const localhost = `http://localhost:${process.env.PORT_PROD}`;
    return new URL(path, localhost);
  }
  if (process.env.NODE_ENV === 'development') {
    const localhost = `http://localhost:${process.env.PORT_DEV}`;
    return new URL(path, localhost);
  }
  return null;
};

// https://phrase.com/blog/posts/detecting-a-users-locale/
// from Mohammad
function getBrowserLocales(options = {}) {
  const defaultOptions = {
    languageCodeOnly: false,
  };

  const opt = {
    ...defaultOptions,
    ...options,
  };

  const browserLocales = navigator.languages === undefined
    ? [navigator.language]
    : navigator.languages;

  if (!browserLocales) {
    return undefined;
  }

  return browserLocales.map((locale) => {
    const trimmedLocale = locale.trim();

    return opt.languageCodeOnly
      ? trimmedLocale.split(/-|_/)[0]
      : trimmedLocale;
  });
}

console.log(getBrowserLocales());

// load the UIkit Icon plugin
UIkit.use(Icons);

// https://stackoverflow.com/questions/6982692/how-to-set-input-type-dates-default-value-to-today
// Solution adapted from brianary
// eslint-disable-next-line no-extend-native
// Date.prototype.toDateInputValue = (function () {
//   const local = new Date(this);
//   local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
//   return local.toJSON().slice(0, 10);
// });

// const getDate = () => {
//   // const today = formatDate(currentDate);
//   const today = new Date().toDateInputValue();
//   return today;
// };

/*
  The user can select the country for the weather info. US is the standard selection.
*/
let selectedCountryCode = 'US';

let userInput = {};

// The Open Weather Map API specific info is provided.
const apiKey = '415ad5403eda30ccec0cef7b078bf31a';
const weatherServiceUri = 'api.openweathermap.org/data/2.5/weather?';

// The zip code input is reused several times and and returned via a function.
// const getCity = () => document.getElementById('city');

// The user can input his/her current feelings. The function returns the value of the input.
const getFeelings = () => document.getElementById('feelings').value;

/*
  In some occasions the user must correct his/her input.
  For this reason the input field is highlighted so the user quickly sees
  where to input corrected data.
*/
const highlightInput = () => {
  document.getElementById('zip').style.cssText = 'border: solid 1px #f0506e;';
};
// After user input the highlighted field is unhiglighted.
const unhighlightInput = () => {
  document.getElementById('zip').style.cssText = 'border: none;';
};

/*
  The weather data is received from the API. The passed URI must include all needed parameters.
  If the call is successful a JSON object is populated from the API response and returned.
*/
// const getWeather = async (uri) => {
//   const res = await fetch(uri);
//   try {
//     // If the API sends OK, weather data is returned.
//     if (res.ok) {
//       /*
//         The success notification is sent to give additional feedback to the user.
//         UIkit (https://getuikit.com) notification is used for feedback purposes.
//       */
//       UIkit.notification('Success: city found', { status: 'success' });
//       /*
//         If a invalid zip code is getting valid via language change, unhighlightInput()
//         ensures that the highlighted input is removed.
//       */
//       unhighlightInput();
//       const weatherData = await res.json();
//       return weatherData;
//     }
//     /*
//       In any other case an error message is displayed to the user.
//       The error message is retrieved from the API to provide a meaningful
//       error message to the user.
//     */
//     if (!res.ok) {
//       const errorData = await res.json();
//       const input = getZipCode();
//       // UIkit (https://getuikit.com) notification is used for feedback purposes.
//       UIkit.notification(`Error: ${errorData.message}`, { status: 'danger' });
//       /*
//         Special case: if the city is not found or the zip code is too short,
//         the user is guided to the zip input field to correct his/her input.
//       */
//       if (res.status === 404 || res.status === 400) {
//         input.focus();
//         highlightInput();
//         document.getElementById('zip').addEventListener('keydown', () => {
//           unhighlightInput();
//           UIkit.notification.closeAll();
//         });
//       }
//     }
//   } catch (error) {
//     console.error('the following error occured: ', error.message);
//   }
//   return null;
// };

/*
  The updateUI function initializes/updates given user data and API received
  weather data on the UI.
*/
const updateUI = async () => {
  // The user and weather data from the getProjectData route is received.
  const res = await fetch(queryLocalServer('/api/getProjectData'));
  try {
    const weatherData = await res.json();
    // const heading = document.getElementById('journal');
    // if (heading !== null) {
    //   heading.removeChild(heading.childNodes[0]);
    // }
    // The elements are generated or updated to show the weather data and user feelings
    // document.getElementById('entry-holder').style.cssText = 'display: initial;';
    // heading.insertAdjacentHTML('afterBegin', '<h2 class="uk-heading-line uk-text-center uk-margin-top"><span>Most Recent Entry</span></h2>');
    // document.getElementById('name').innerHTML = `${weatherData.name}, ${weatherData.country}`;
    // document.getElementById('icon').innerHTML = `<i class="owi owi-${weatherData.icon}"></i>`;
    // document.getElementById('date').innerHTML = weatherData.date;
    // document.getElementById('temp').innerHTML = `${weatherData.temperature} °C`;
    // If a feeling is entered in the text area, the element is generated.
    // if (weatherData.feelings !== '') {
    //   document.getElementById('entry-holder').insertAdjacentHTML('beforeEnd', '<div id="content" class="uk-text-center"></div>');
    //   document.getElementById('content').innerHTML = `Today I feel: ${weatherData.feelings}`;
    // }
    // // If there is no user input in the field, the element is removed.
    // if (weatherData.feelings === '') {
    //   if (document.getElementById('content')) {
    //     document.getElementById('content').remove();
    //   }
    // }
  } catch (error) {
    console.error('the following error occured: ', error.message);
  }
};

/*
  The Open Weather Map API is queried. The user input for the zip code and the country code is used.
  If there is no country code given the call is made without it: in this case the default country
  for the zip code search is USA.
*/
// const queryWeatherAPI = () => {
//   // The URI for the API call is put together
//   const weatherServiceApiCallUri = `https://${weatherServiceUri}zip=${getZipCode().value}${selectedCountry}&appid=${apiKey}&units=metric`;
//   console.log(weatherServiceApiCallUri);
//   // The function for the GET request with the assembled URI is called.
//   getWeather(weatherServiceApiCallUri)
//     /*
//       After the weather data is returned the postWeather route is used to pass the information
//       to the server.
//     */
//     .then((weatherData) => {
//       if (weatherData) {
//         postWeather('/api/postWeather', {
//           icon: weatherData.weather[0].icon,
//           name: weatherData.name,
//           country: weatherData.sys.country,
//           temperature: weatherData.main.temp,
//           date: `${currentDate.toDateString()}, ${currentDate.toLocaleTimeString('en-US')}`,
//           feelings: getFeelings(),
//         });
//         // After the server received the updated information, the UI is updated.
//         updateUI();
//       }
//     });
// };

/*
  The language selector is populated by the values  of the languages object
  (key: country code, value: country name). The languages are retrieved via the server,
  which uses the i18n-iso-countries module to retrieve language codes and their respective names.
*/
const setLanguageSelector = (languages = {}) => {
  const countrySelect = document.getElementById('country');
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(languages)) {
    const country = `<option value="${key}">${value}</option>`;
    countrySelect.insertAdjacentHTML('beforeend', country);
  }
};

// The languages are retrieved from the server and passed to the languageSelector function.
const getCountries = async () => {
  const res = await fetch(queryLocalServer('/api/getCountries'));
  try {
    const languages = await res.json();
    setLanguageSelector(languages);
  } catch (error) {
    console.error('the following error occured: ', error.message);
  }
};
getCountries();

const getInput = () => {
  userInput = {
    city: document.getElementById('city').value,
    countryCode: selectedCountryCode,
    date: document.getElementById('trip-date').value,
    preferredLanguage: getBrowserLocales()[0],
  };
  console.log(`getInput.country: ${userInput.countryCode}`);
  console.log(`getInput.city: ${userInput.city}`);
  return userInput;
};

/*
  The postUserData function specifies a POST request in which a data object is passed in the
  request body.
*/
const postUserSelection = async (uri, data = {}) => {
  console.log(uri);
  console.log(`data.countryCode: ${data.countryCode}`);
  await fetch(uri, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).catch((error) => {
    console.error('the following error occured: ', error.message);
  });
};

/*
  Event listener that checks if the generate button is clicked. Input is validated.
  If the zip is valid the Weather API is queried.
*/
const submitInfo = () => {
  console.log('Button clicked.');
  postUserSelection(queryLocalServer('/api/postUserSelection'), getInput());
};

/*
  Event listener that checks if the Enter button in zip input is used to confirm.
  The input is validated, if the zip is valid the Weather API is queried.
*/
document.getElementById('city').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    console.log('Enter pressed.');
    postUserSelection(queryLocalServer('/api/postUserSelection'), getInput());
  }
});

const inputCountry = () => {
  selectedCountryCode = document.getElementById('country').value;
  console.log(selectedCountryCode);
};

// When the page is loaded the current date is set in the date input field.
window.addEventListener('load', (event) => {
  // document.getElementById('trip-date').value = getDate();
  document.getElementById('trip-date').valueAsDate = new Date();
});

export { submitInfo };
export { inputCountry };
export { updateUI };
