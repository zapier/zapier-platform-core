'use strict';

const createLambdaHandler = require('./create-lambda-handler');
const resolveMethodPath = require('./resolve-method-path');
const ZapierPromise = require('./promise');
const { get, last } = require('lodash');
const { genId } = require('./data');

// this is (annoyingly) mirrored in cli/api_base, so that test functions only
// have a storeKey when canPaginate is true. otherwise, a test would work but a
// poll on site would fail. this is only used in test handlers
const shouldPaginate = (appRaw, method) => {
  const methodParts = method.split('.');
  if (methodParts[0] !== 'triggers' || last(methodParts) !== 'perform') {
    return false;
  }

  methodParts.pop();

  return get(appRaw, `${methodParts.join('.')}.canPaginate`);
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

    const event = {
      command: 'execute',
      method,
      bundle,
      storeKey: shouldPaginate(appRaw, method) ? `testKey-${genId()}` : null
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
