'use strict';

const _ = require('lodash');

const createCallbackWrapper = input => {
  let callbackUrl = _.get(input, '_zapier.callback.url');
  let callbackWrapper = {};
  Object.defineProperty(callbackWrapper, 'url', {
    get: function() {
      _.set(true, '_zapier.callback.isUsed');
      return callbackUrl;
    }
  });
};

module.exports = createCallbackWrapper;
