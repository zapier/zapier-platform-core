'use strict';

import * as _ from 'lodash';

import isTrigger from './is-trigger';

/*
  Makes sure the results are all objects.
*/
export const triggerIsObject: Check = {
  name: 'triggerIsObject',
  shouldRun: isTrigger,
  run: (method, results) => {
    if (!_.isArray(results)) {
      return []; // trigger-is-array check will catch if not array
    }

    const nonObjectResult = _.find(results, (result) => {
      return !_.isPlainObject(result);
    });

    if (nonObjectResult !== undefined) {
      const repr = _.truncate(JSON.stringify(nonObjectResult), { length: 50 });
      return [
        `Got a result missing that was not an object (${repr})`
      ];
    }
    return [];
  }
};
