'use strict';

const _ = require('lodash');
const ZapierPromise = require('./promise');

// Similar API to JSON built in but catches errors with nicer tracebacks.
const createStoreKeyTool = input => {
  const rpc = _.get(input, '_zapier.rpc');

  return {
    get: () => {
      if (!rpc) {
        return ZapierPromise.reject(new Error('rpc is not available'));
      }

      return rpc('get_cursor').then(result => {
        return JSON.parse(result).cursor;
      });
    },
    set: cursor => {
      if (!rpc) {
        return ZapierPromise.reject(new Error('rpc is not available'));
      }

      return rpc('store_cursor', cursor);
    }
  };
};

module.exports = createStoreKeyTool;
