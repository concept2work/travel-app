// import { Tooltip, Toast, Popover } from 'bootstrap';
// import 'bootstrap';
// import 'jquery';
// import 'jquery-ui';
// import 'jquery-autocomplete';

import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

import {
  submitInfo, inputCountry, updateUI,
} from './js/formHandler';

import {
  showSpinner, removeSpinner, resetView, updateResults,
} from './js/updateIndex';

import './styles/base.scss';

export {
  showSpinner,
  removeSpinner,
  resetView,
  updateResults,
  submitInfo,
  inputCountry,
  updateUI,
  SparqlEndpointFetcher,
};
