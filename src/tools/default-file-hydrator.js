'use strict';

const defaultFileHydrator = (z, bundle) => {
  const request = bundle.inputData.request || {};
  request.url = bundle.inputData.url || request.url;
  request.raw = true;
  const stream = z.request(request);
  const meta = bundle.inputData.meta || {};
  return z.stashFile(stream, meta.knownLength, meta.filename, meta.contentType);
};

module.exports = defaultFileHydrator;
