// import { Button, Carousel, Tab } from 'bootstrap';
import 'bootstrap';
// import 'bootstrap';
// import 'jquery';
// import 'jquery-ui';
// import 'jquery-autocomplete';

import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

import {
  submitInfo, inputCountry,
} from './js/formHandler';

import {
  showSpinner, removeSpinner, resetView,
} from './js/updateIndex';

import './styles/base.scss';

export {
  showSpinner,
  removeSpinner,
  resetView,
  submitInfo,
  inputCountry,
  SparqlEndpointFetcher,
};
