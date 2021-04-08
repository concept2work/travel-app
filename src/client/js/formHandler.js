/* eslint-disable max-len */

/*
  Added datepicker library to get this functionality in all browsers
  instead of using the HTML element input with the attribute type="date".
*/
import datepicker from 'js-datepicker';

import {
  updateUI, showSpinner, removeSpinner, showErrorMessage, removeErrorMessage,
} from './updateIndex';

// const $ = require('jquery');
const getToday = () => new Date();

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

/*
  The user can select the country for the travel info. US is the standard selection.
*/
let selectedCountryCode = 'US';

let userInput = {};

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

const getDaysUntilTrip = (date) => {
  /*
    Date calculation adapted from trisweb
    (https://stackoverflow.com/questions/7763327/how-to-calculate-date-difference-in-javascript)
  */
  const tripDate = new Date(date).getTime();
  return (Math.floor(((tripDate - getToday().getTime()) / (1000 * 60 * 60 * 24)) + 1));
};

const getInput = () => {
  userInput = {
    city: document.getElementById('city').value,
    countryCode: selectedCountryCode,
    date: document.getElementById('trip-date').value,
    daysUntilTrip: getDaysUntilTrip(document.getElementById('trip-date').value),
  };
  console.log(`getInput.country: ${userInput.countryCode}`);
  console.log(`getInput.city: ${userInput.city}`);
  console.log(`getInput.daysUntilTrip: ${userInput.daysUntilTrip}`);
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

const submitInfo = (event) => {
  // If a result is already shown the view gets reset.
  const forms = document.getElementsByClassName('needs-validation');
  Array.prototype.filter.call(forms, (form) => {
    // const apiRequestUrl = document.getElementById('url-input').value;
    // The form validation checks, if a url including protocol is submitted.
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (form.checkValidity() === true) {
      event.preventDefault();
      // The spinner is shown to feedback the loading process.
      removeErrorMessage();
      showSpinner();
      postUserSelection()
        .then(
          (response) => {
            if (!response.error) {
              updateUI(response);
            }
            if (response.error) {
              console.log(response);
              removeSpinner();
              showErrorMessage(response.error);
            }
          },
        );
    }
    form.classList.add('was-validated');
  });
};

/*
  Event listener that checks if the Enter button in zip input is used to confirm.
  The input is validated, if the zip is valid the Weather API is queried.
*/
document.getElementById('city').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    console.log('Enter pressed.');
    submitInfo(event);
  }
});

// The selected country is read.
const inputCountry = () => {
  selectedCountryCode = document.getElementById('country').value;
  console.log(selectedCountryCode);
};

// When the page is loaded the current date is set in the date input field.
window.addEventListener('load', () => {
  // Date picker is added.
  const tripDate = datepicker('#trip-date', {
    minDate: getToday(),
    dateSelected: getToday(),
    position: 'tl',
  });

  // Heading is added.
  document.getElementById('main-heading-contents').innerHTML = 'City Guides';

  // Home link to logo is set.
  document.getElementById('home-link').setAttribute('href', queryLocalServer('/'));

  // The overview tab is hidden.
  document.getElementById('nav-item-overview').classList.add('d-none');

  // The home page image is set: a random city image provided via Pixabay.
  let image = '';
  const getHomePageImage = async () => {
    const res = await fetch(queryLocalServer('/api/getHomePageImage'));
    try {
      image = await res.json();
      console.log(`home page image id: ${image.imageId}`);
      return image;
    } catch (error) {
      console.error('the following error occured: ', error.message);
    }
    return null;
  };
  getHomePageImage()
    .then((result) => {
      if (result.imageId) {
        document.getElementById('hero').style.backgroundImage = `url("./dist/cache/${result.imageId}.jpg")`;
      }
    });
});

export { submitInfo };
export { inputCountry };
