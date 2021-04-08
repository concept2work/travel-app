import 'bootstrap';

import {
  inputCountry, submitByKeypress, submitInfo,
} from './js/formHandler';

import {
  showSpinner, removeSpinner, resetView,
} from './js/updateIndex';

import './styles/base.scss';

// Event listener to check if the search button is pressed.
document.getElementById('generate').addEventListener('click', submitInfo);

// Event listener that checks if the Enter button is used to confirm input.
document.getElementById('city').addEventListener('keypress', submitByKeypress);

export {
  inputCountry,
  submitInfo,
  submitByKeypress,
  showSpinner,
  removeSpinner,
  resetView,
};
