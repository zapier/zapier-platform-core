'use strict';

import * as _ from 'lodash'

import isTrigger from './is-trigger';

/*
  Triggers should always return an array of objects.
*/
export const triggerIsArray: Check = {
  name: 'triggerIsArray',
  shouldRun: isTrigger,
  run: (method, results) => {
    if (!_.isArray(results)) {
      const repr = _.truncate(JSON.stringify(results), { length: 50 });
      return [
        `Results must be an array, got: ${typeof results}, (${repr})`
      ];
    }
    return [];
  }
};
