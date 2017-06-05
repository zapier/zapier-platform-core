'use strict';

const _ = require('lodash');

const ZapierPromise = require('./promise');
const constants = require('./constants');

// Designed to be some user provided function/api.
const createLocker = (input) => {
  const rpc = _.get(input, '_zapier.rpc');
  const bundle = _.get(input, '_zapier.event.bundle');

  return (originalOptions) => {
    if (!rpc) {
      return ZapierPromise.reject(new Error('rpc is not available'));
    }

    const options = _.clone(originalOptions || {});

    const defaultOptions = {
      timeout: 60,
      name: 'single-lock',
      bundle
    };

    // We're nice, so we allow a lock without settings
    _.assign(options, defaultOptions);

    if (!options.name) {
      return ZapierPromise.reject(new Error('Lock name needs to be defined.'));
    }

    if (options.timeout > constants.LOCK_MAX_TIMEOUT) {
      return ZapierPromise.reject(new Error(`Timeout for lock is too big. Max is ${constants.LOCK_MAX_TIMEOUT}.`));
    }

    const eventMethod = _.get(input, '_zapier.event.method', '');
    const isRunningOnTrigger = eventMethod.startsWith('triggers.');
    const isRunningOnSearch = eventMethod.startsWith('searches.');
    const isRunningOnHydrator = eventMethod.startsWith('hydrators.');
    const isRunningOnResourceGet = eventMethod.startsWith('resources.') && eventMethod.endsWith('.get.operation.perform');
    const isRunningOnResourceList = eventMethod.startsWith('resources.') && eventMethod.endsWith('.list.operation.perform');
    const isRunningOnResourceSearch = eventMethod.startsWith('resources.') && eventMethod.endsWith('.search.operation.perform');
    if (isRunningOnSearch || isRunningOnTrigger || isRunningOnHydrator || isRunningOnResourceGet || isRunningOnResourceList || isRunningOnResourceSearch) {
      return ZapierPromise.reject(new Error('Cannot lock inside a trigger, search, or hydration function/method.'));
    }

    return rpc('run_with_lock', options)
      .then((result) => {
        if (result.available) {
          return true;
        } else {
          return ZapierPromise.reject(new Error(constants.LOCK_EXCEPTION));
        }
      });
  };
};

module.exports = createLocker;
