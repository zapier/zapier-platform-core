'use strict';

const _ = require('lodash');

const requestClean = require('./request-clean');

// Do a merge with case-insensitive keys, and drop empty header keys
const caseInsensitiveMerge = (requestOne, requestTwo, requestThree) => {
  // This creates copies/clones
  requestOne = requestClean(requestOne);
  requestTwo = requestClean(requestTwo);
  requestThree = requestClean(requestThree);

  // This is a very quick & efficient merge for all of request's properties
  const mergedRequest = _.merge.apply(_, [requestOne, requestTwo, requestThree]);

  // Now to cleanup headers, we start on the last request (the one to keep) and work backwards to add the keys
  // NOTE: This is done "manually" instead of a _.merge or Object.assign() because we need case-insensitivity
  const mergedRequestHeaders = requestThree.headers || {};
  const requestTwoHeaders = requestTwo.headers || {};
  const requestOneHeaders = requestOne.headers || {};

  // Check, in order, which keys to add (if they're not duplicate)
  [requestTwoHeaders, requestOneHeaders].forEach((requestHeaders) => {
    const existingKeys = Object.keys(mergedRequestHeaders);
    const requestKeys = Object.keys(requestHeaders);

    // We will loop through every header, and if we find no (case-insensitive) match, we'll add it to mergedRequest
    requestKeys.forEach((checkingKey) => {
      const foundKeyIndex = _.findIndex(existingKeys, (key) => key.toLowerCase() === checkingKey.toLowerCase());

      // Only add if the key doesn't exist yet
      if (foundKeyIndex === -1) {
        mergedRequestHeaders[checkingKey] = requestHeaders[checkingKey];
      }
    });
  });

  // Remove any keys with DROP_DIRECTIVE, after all merging happened
  Object.keys(mergedRequestHeaders).forEach((key) => {
    if (mergedRequestHeaders[key] === requestClean.DROP_DIRECTIVE) {
      delete mergedRequestHeaders[key];
    }
  });

  // Update the headers with the cleaned up version
  mergedRequest.headers = mergedRequestHeaders;

  return mergedRequest;
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

  const request = caseInsensitiveMerge(baseRequest, requestOne, requestTwo);

  return request;
};

module.exports = requestMerge;
