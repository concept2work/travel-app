/* eslint-disable max-len */
import { updateUI } from './updateIndex';
import { showSpinner } from './updateIndex';
import { removeSpinner } from './updateIndex';

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
  The user can select the country for the weather info. US is the standard selection.
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

const getInput = () => {
  userInput = {
    city: document.getElementById('city').value,
    countryCode: selectedCountryCode,
    date: document.getElementById('trip-date').value,
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

const submitInfo = (event) => {
  // If a result is already shown the view gets reset.
  // updateIndex.resetView();
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
      showSpinner();
      postUserSelection()
        .then((response) => {
          updateUI(response);
        });
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

const inputCountry = () => {
  selectedCountryCode = document.getElementById('country').value;
  console.log(selectedCountryCode);
};

// When the page is loaded the current date is set in the date input field.
window.addEventListener('load', () => {
  // document.getElementById('trip-date').value = getDate();
  document.getElementById('trip-date').valueAsDate = new Date();
  let image = '';
  const getHomePageImage = async () => {
    const res = await fetch(queryLocalServer('/api/getHomePageImage'));
    try {
      image = await res.json();
      console.log(`home page image id: ${image.imageId}`);
      return image.imageId;
    } catch (error) {
      console.error('the following error occured: ', error.message);
    }
    return null;
  };
  getHomePageImage().then((result) => {
    document.getElementById('hero').style.backgroundImage = `url("./dist/cache/${result}.jpg")`;
    document.getElementById('main-heading-contents').innerHTML = 'City guides for all of the world';
  });
});

export { submitInfo };
export { inputCountry };
