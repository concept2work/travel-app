exports.evaluateResponseData = (inputValue) => {
  if (inputValue === 'P+') {
    return '<li class="list-group-item list-group-item-success">The polarity of the text is strong positive.</li>';
  }
  if (inputValue === 'P') {
    return '<li class="list-group-item list-group-item-success">The polarity of the text is positive.</li>';
  }
  if (inputValue === 'NEU') {
    return '<li class="list-group-item list-group-item-light">The polarity of the text is neutral.</li>';
  }
  if (inputValue === 'N') {
    return '<li class="list-group-item list-group-item-danger">The polarity of the text is negative.</li>';
  }
  if (inputValue === 'N+') {
    return '<li class="list-group-item list-group-item-danger">The polarity of the text is strong negative.</li>';
  }
  if (inputValue === 'N+') {
    return '<li class="list-group-item list-group-item-light">The text is without sentiment.</li>';
  }
  if (inputValue === 'AGREEMENT') {
    return '<li class="list-group-item list-group-item-light">There is an agreement between the author and the subject of the text.</li>';
  }
  if (inputValue === 'DISAGREEMENT') {
    return '<li class="list-group-item list-group-item-warning">There is an disagreement between the author and the subject of the text.</li>';
  }
  if (inputValue === 'OBJECTIVE') {
    return '<li class="list-group-item list-group-item-light">The text does not have any subjectivity marks.</li>';
  }
  if (inputValue === 'SUBJECTIVE') {
    return '<li class="list-group-item list-group-item-warning">The text has subjective marks.</li>';
  }
  if (inputValue === 'NONIRONIC') {
    return '<li class="list-group-item list-group-item-light">The text does not have ironic marks.</li>';
  }
  if (inputValue === 'IRONIC') {
    return '<li class="list-group-item list-group-item-warning">The text has ironic marks.</li>';
  }
  if (inputValue <= 25) {
    return `<li class="list-group-item list-group-item-danger">The text shows a confidence of ${inputValue}%.</li>`;
  }
  if (inputValue > 25 && inputValue <= 50) {
    return `<li class="list-group-item list-group-item-warning">The text shows a confidence of ${inputValue}%.</li>`;
  }
  if (inputValue > 50 && inputValue <= 80) {
    return `<li class="list-group-item list-group-item-light">The text shows a confidence of ${inputValue}%.</li>`;
  }
  if (inputValue > 81) {
    return `<li class="list-group-item list-group-item-success">The text shows a confidence of ${inputValue}%.</li>`;
  }
  return inputValue;
};

exports.getErrorMessage = (error) => `<li class="list-group-item list-group-item-danger">${error}.</li>`;
