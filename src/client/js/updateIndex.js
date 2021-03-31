// The function displays a loading spinner
const showSpinner = () => {
  document.getElementById('loading-status').className = 'd-flex justify-content-center mt-5';
};

/*
  The function removes a previously invoked loading spinner.
  It is called when a result is displayed.
  */
const removeSpinner = () => {
  document.getElementById('loading-status').className = 'd-none';
};

/*
  List entries show results retrieved from the MeaningCloud API and error messages.
  With this function they can be removed. Solution adapted by Gabriel McAdams
  (https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript).
*/
const resetView = () => {
  const resultList = document.getElementById('results');
  while (resultList.firstChild) {
    resultList.removeChild(resultList.lastChild);
  }
};

const updateUI = async (object = {}) => {
  // showSpinner();
  document.getElementById('hero').style.backgroundImage = `url("./dist/cache/${object.imageId}.jpg")`;
  document.getElementById('main-heading-contents').innerHTML = `${object.city}, ${object.countryName}`;
  removeSpinner();
  console.log(object);
  // Todo check sentences and add paragraph after n sentences, see https://stackoverflow.com/questions/11761563/javascript-regexp-for-splitting-text-into-sentences-and-keeping-the-delimiter
};

const updateResults = (response) => {
  // const responseObject = Object.entries(response);
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(response)) {
    document.getElementById('results').insertAdjacentHTML('beforeEnd', value);
  }
};

const getServerErrorMessage = (error) => `<li class="list-group-item list-group-item-danger">Sorry, there is no connection to the server at the moment. Please try again later. If the error persists please contact the website administrator and refer to the following error: <code>${error}</code></li>`;

const getUserErrorMessage = () => '<li class="list-group-item list-group-item-danger">The provided URL contains incorrect characters. Please check again.</li>';

// Necessary JavaScript to run Service Worker
const runServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
};

// Service Worker code is integrated for production mode only
const startServiceWorker = () => {
  if (process.env.NODE_ENV === 'production') {
    runServiceWorker();
  }
};
startServiceWorker();

export { showSpinner };
export { removeSpinner };
export { resetView };
export { updateUI };
export { updateResults };
export { getServerErrorMessage };
export { getUserErrorMessage };
