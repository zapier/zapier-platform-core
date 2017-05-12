'use strict';

const _ = require('lodash');

const ZapierPromise = require('./promise');

const LOCK_MAX_TIMEOUT = 60 * 60 * 24; // 1 day, in seconds

// Designed to be some user provided function/api.
const createLocker = (input) => {
  const rpc = _.get(input, '_zapier.rpc');

  return (options) => {
    if (!rpc) {
      return ZapierPromise.reject(new Error('rpc is not available'));
    }

    if (!options) {
      options = {};
    }

    const defaultOptions = {
      timeout: 60,
      name: 'single-lock'
    };

    // We're nice, so we allow a lock without settings
    _.assign(options, defaultOptions);

    if (!options.name) {
      return ZapierPromise.reject(new Error('Lock name needs to be defined.'));
    }

    if (options.timeout > LOCK_MAX_TIMEOUT) {
      return ZapierPromise.reject(new Error(`Timeout for lock is too big. Max is ${LOCK_MAX_TIMEOUT}.`));
    }

    const isRunningOnTrigger = _.get(input, '_zapier.event.method', '').indexOf('triggers.') === 0;
    const isRunningOnSearch = _.get(input, '_zapier.event.method', '').indexOf('searches.') === 0;
    const isRunningOnHydrator = _.get(input, '_zapier.event.method', '').indexOf('hydrators.') === 0;
    if (isRunningOnSearch || isRunningOnTrigger || isRunningOnHydrator) {
      return ZapierPromise.reject(new Error('Cannot lock inside a trigger, search, or hydration function/method.'));
    }

    return rpc('run_with_lock', options)
      .then((result) => {
        if (result.available) {
          return true;
        } else {
          // TODO: Do we throw something else here for the runner to catch it?
          return ZapierPromise.reject(new Error('NOT_A_REAL_ERROR_JUST_TRY_ME_AGAIN'));
        }
      });
  };
};

module.exports = createLocker;
