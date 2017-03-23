'use strict';

const _ = require('lodash');

const requestClean = require('./request-clean');

// Remove any matching keys (case-insensitive) from object, in order
const removeExistingSimilarKeys = (object, keys) => {
  keys.reverse(); // Last added is first to keep.

  const indexLimit = keys.length - 1;
  let i = 0;

  while (i <= indexLimit && keys[i]) {
    const checkingKey = keys[i];

    const foundKeyIndex = _.findIndex(keys, (key) => key !== checkingKey && key.toLowerCase() === checkingKey.toLowerCase());

    if (foundKeyIndex !== -1) {
      const foundKey = keys[foundKeyIndex];
      delete object[foundKey];
      keys.splice(foundKeyIndex, 1);
      i = -1; // Don't want to miss a thing (cue music)
    }

    i += 1;
  }
};

// Stack requests on top of each other - deeply merging them.
const requestMerge = (requestOne, requestTwo) => {
  const baseRequest = {
    method: 'GET',
    params: {},
    headers: {
      'user-agent': 'Zapier'
    }
  };

  const requests = [baseRequest, requestOne, requestTwo];

  const request = _.merge.apply(_, requests.map(requestClean));

  requests.headers = requests.headers || {};
  const keys = Object.keys(request.headers);

  request.headers = keys.reduce((coll, key) => {
    let val = request.headers[key];

    if (val === requestClean.DROP_DIRECTIVE) {
      delete coll[key];
    }

    return coll;
  }, request.headers);

  removeExistingSimilarKeys(request.headers, keys);

  return request;
};

module.exports = requestMerge;
