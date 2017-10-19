'use strict';

import * as _ from 'lodash'

import isCreate from './is-create'

/*
  Makes sure the results are all objects.
*/
export const createIsSingle: Check = {
  name: 'createIsSingle',
  shouldRun: isCreate,
  run: (method, results) => {
    if (_.isArray(results)) {
      const repr = _.truncate(JSON.stringify(results), { length: 50 });
      return [
        `Got a result with multiple return values, expecting a single object from create (${repr})`
      ];
    }

    // assumes a single object not array is legit
    return [];
  }
};
