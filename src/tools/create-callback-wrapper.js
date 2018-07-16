'use strict';

const _ = require('lodash');

const createCallbackWrapper = input => {
  let callbackUrl = _.get(input, '_zapier.callback.url');
  let callbackWrapper = {};
  Object.defineProperty(callbackWrapper, 'url', {
    get: function() {
      _.set(input, '_zapier.callback.isUsed', true);
      return callbackUrl;
    }
  });
  return callbackWrapper;
};

module.exports = createCallbackWrapper;
