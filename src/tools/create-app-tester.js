'use strict';

const createLambdaHandler = require('./create-lambda-handler');
const resolveMethodPath = require('./resolve-method-path');
const ZapierPromise = require('./promise');
const { get } = require('lodash');
const { md5 } = require('./data');

// this is (annoyingly) mirrored in cli/api_base, so that test functions only
// have a storeKey when canPaginate is true. otherwise, a test would work but a
// poll on site would fail. this is only used in test handlers

const shouldPaginate = (appRaw, method) => {
  if (method.startsWith('triggers') && method.endsWith('perform')) {
    const methodParts = method.split('.');
    methodParts.pop();
    return get(appRaw, `${methodParts.join('.')}.canPaginate`);
  }

  return false;
};

// Convert a app handler to promise for convenience.
const promisifyHandler = handler => {
  return event => {
    return new ZapierPromise((resolve, reject) => {
      handler(event, {}, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
    });
  };
};

// A shorthand compatible wrapper for testing.
const createAppTester = appRaw => {
  const handler = createLambdaHandler(appRaw);
  const createHandlerPromise = promisifyHandler(handler);

  return (methodOrFunc, bundle) => {
    bundle = bundle || {};

    const method = resolveMethodPath(appRaw, methodOrFunc);

    // we need a value that's unique to this test (but consistent across test runs) so we don't lose cursors
    const username = process.env.USER || process.env.USERNAME || 'fallback';
    const unique = md5(`${method}-${username}`);

    const event = {
      command: 'execute',
      method,
      bundle,
      storeKey: shouldPaginate(appRaw, method) ? `testKey-${unique}` : null
    };

    if (process.env.LOG_TO_STDOUT) {
      event.logToStdout = true;
    }
    if (process.env.DETAILED_LOG_TO_STDOUT) {
      event.detailedLogToStdout = true;
    }

    return createHandlerPromise(event).then(resp => resp.results);
  };
};

module.exports = createAppTester;
