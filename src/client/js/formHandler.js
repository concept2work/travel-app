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

const postUserSelection = async () => {
  const settings = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getInput()),
  };
  try {
    const fetchResponse = await fetch(queryLocalServer('/api/postUserSelection'), settings);
    const data = await fetchResponse.json();
    console.log('data received');
    return data;
  } catch (error) {
    console.error('the following error occured: ', error.message);
    return error;
  }
};

/*
  Event listener that checks if the generate button is clicked. Input is validated.
  If the zip is valid the Weather API is queried.
*/
const submitInfo = () => {
  console.log('Button clicked.');
  postUserSelection().then((response) => console.log(response));
};

/*
  Event listener that checks if the Enter button in zip input is used to confirm.
  The input is validated, if the zip is valid the Weather API is queried.
*/
document.getElementById('city').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    console.log('Enter pressed.');
    postUserSelection().then((response) => console.log(response));
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
