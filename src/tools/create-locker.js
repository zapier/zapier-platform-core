'use strict';

const _ = require('lodash');

const LOCK_MAX_TIMEOUT = 60 * 60 * 24; // 1 day, in seconds

// Designed to be some user provided function/api.
const createLocker = (input) => {
  const rpc = _.get(input, '_zapier.rpc');

  return (callback, options) => {
    if (!rpc) {
      throw new Error('rpc is not available');
    }

    if (!options) {
      options = {};
    }

    const defaultOptions = {
      timeout: 60,
      name: 'single-lock'
    };

    _.assign(options, defaultOptions);

    if (!options.name) {
      throw new Error('Lock name needs to be defined.');
    }

    if (options.timeout > LOCK_MAX_TIMEOUT) {
      throw new Error(`Timeout for lock is too big. Max is ${LOCK_MAX_TIMEOUT}.`);
    }

    const isRunningOnTrigger = _.get(input, '_zapier.event.method', '').indexOf('triggers.') === 0;
    const isRunningOnSearch = _.get(input, '_zapier.event.method', '').indexOf('searches.') === 0;
    const isRunningOnHydrator = _.get(input, '_zapier.event.method', '').indexOf('hydrators.') === 0;
    if (isRunningOnSearch || isRunningOnTrigger || isRunningOnHydrator) {
      throw new Error('Cannot lock inside a trigger, search, or hydration function/method.');
    }

    return rpc('run_with_lock', options)
      .then((result) => {
        if (result.available) {
          callback();
        } else {
          // TODO: Do we throw something else here for the runner to catch it?
          throw new Error('NOT_A_REAL_ERROR_JUST_TRY_ME_AGAIN');
        }
      });
  };
};

module.exports = createLocker;
