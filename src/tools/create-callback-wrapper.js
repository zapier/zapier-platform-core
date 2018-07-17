'use strict';

const _ = require('lodash');

const createCallbackWrapper = input => {
  let callbackUrl = _.get(input, '_zapier.event.callbackUrl');
  let callbackWrapper = {};
  Object.defineProperty(callbackWrapper, 'isUsed', {
    get: function () {
      return _.get(input, '_zapier.event.callbackUrl.isUsed');
    }
  })
  Object.defineProperty(callbackWrapper, 'url', {
    get: function () {
      _.set(input, '_zapier.event.callbackUrl.isUsed', true);
      return callbackUrl;
    }
  });
  return callbackWrapper;
};

module.exports = createCallbackWrapper;
