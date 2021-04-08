/*
  The datepicker library is added to get a consistent functionality in all browsers
  instead of using the HTML element input with the attribute type="date".
*/
import datepicker from 'js-datepicker';

import {
  updateUI, showSpinner, removeSpinner, showErrorMessage, removeErrorMessage,
} from './updateIndex';

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

// The user can select the country for the travel info. US is the standard selection.
let selectedCountryCode = 'US';

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
  const userInput = {
    city: document.getElementById('city').value,
    countryCode: selectedCountryCode,
    date: document.getElementById('trip-date').value,
    daysUntilTrip: getDaysUntilTrip(document.getElementById('trip-date').value),
  };
  return userInput;
};

// The user input is sent to the server. On the server side the APIs are queried.
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
  /*
    The following function validates user input and carries out feedback if the input
    is not valid. This function is adapted from the Bootstrap Starter code
    (https://getbootstrap.com/docs/4.6/components/forms/#validation).
  */
  Array.prototype.filter.call(forms, (form) => {
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
          // After getting a response from the server the data is processed.
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

const submitByKeypress = (event) => {
  if (event.key === 'Enter') {
    submitInfo(event);
  }
};

// The selected country is read.
const inputCountry = () => {
  selectedCountryCode = document.getElementById('country').value;
  console.log(selectedCountryCode);
};

// When the page is loaded the content gets updated.
window.addEventListener('load', () => {
  /*
    Datepicker is added. When the page is loaded the current date is set in
    the date input field. Via minDate: getToday() it is prevented for the
    user to select a date in the past.
  */
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
      return image;
    } catch (error) {
      console.error('the following error occured: ', error.message);
    }
    return null;
  };
  getHomePageImage()
    .then((result) => {
      if (result.imageId) {
        if (process.env.NODE_ENV === 'production') {
          document.getElementById('hero').style.backgroundImage = `url("./cache/${result.imageId}.jpg")`;
        }
        if (process.env.NODE_ENV === 'development') {
          document.getElementById('hero').style.backgroundImage = `url("./dist/cache/${result.imageId}.jpg")`;
        }
      } else {
        showErrorMessage(result.error);
        document.getElementById('hero').style.backgroundImage = '';
      }
    });
});

export { inputCountry };
export { submitInfo };
export { submitByKeypress };
