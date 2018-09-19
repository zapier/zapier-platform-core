'use strict';

const _ = require('lodash');

const { DEFAULT_FILE_HYDRATOR_NAME } = require('../constants');
const { DehydrateError } = require('../errors');
const resolveMethodPath = require('./resolve-method-path');
const wrapHydrate = require('./wrap-hydrate');

const MAX_PAYLOAD_SIZE = 2048; // most urls cannot be larger than 2,083

const createFileDehydrator = input => {
  const app = _.get(input, '_zapier.app');

  const dehydrateFileFromRequest = (url, request, meta) => {
    url = url || undefined;
    request = request || undefined;
    meta = meta || undefined;
    if (!url && !request) {
      throw new DehydrateError(
        'You must provide either url or request arguments!'
      );
    }

    const inputData = {
      url,
      request,
      meta
    };

    const payloadSize = JSON.stringify(inputData).length;
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      throw new DehydrateError(
        `Oops! You passed too much data (${payloadSize} bytes) to your dehydration function - try slimming it down under ${MAX_PAYLOAD_SIZE} bytes (usually by just passing the needed IDs).`
      );
    }

    return wrapHydrate({
      type: 'file',
      method: `hydrators.${DEFAULT_FILE_HYDRATOR_NAME}`,
      bundle: inputData
    });
  };

  const dehydrateFileFromFunc = (func, inputData) => {
    inputData = inputData || {};
    if (inputData.inputData) {
      throw new DehydrateError(
        'Oops! You passed a full `bundle` - really you should pass what you want under `inputData`!'
      );
    }
    const payloadSize = JSON.stringify(inputData).length;
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      throw new DehydrateError(
        `Oops! You passed too much data (${payloadSize} bytes) to your dehydration function - try slimming it down under ${MAX_PAYLOAD_SIZE} bytes (usually by just passing the needed IDs).`
      );
    }
    return wrapHydrate({
      type: 'file',
      method: resolveMethodPath(app, func),
      // inputData vs. bundle is a legacy oddity
      bundle: _.omit(inputData, 'environment') // don't leak the environment
    });
  };

  return (...args) => {
    const arg0 = args[0];
    if (_.isFunction(arg0)) {
      return dehydrateFileFromFunc.apply(this, args);
    }
    if (arg0 && typeof arg0 !== 'string') {
      throw new DehydrateError(
        'First argument () must be either null, a URL (string), or a hydrator function!'
      );
    }
    return dehydrateFileFromRequest.apply(this, args);
  };
};

module.exports = createFileDehydrator;
