'use strict';

const _ = require('lodash');

const requestInternal = require('./request-client-internal');

const defaultFileHydrator = (z, bundle) => {
  const requestOptions = bundle.inputData.request || {};
  const request = _.isEmpty(requestOptions) ? z.request : requestInternal;

  requestOptions.url = bundle.inputData.url || requestOptions.url;
  requestOptions.raw = true;

  const filePromise = request(requestOptions);
  const meta = bundle.inputData.meta || {};
  return z.stashFile(
    filePromise,
    meta.knownLength,
    meta.filename,
    meta.contentType
  );
};

module.exports = defaultFileHydrator;
