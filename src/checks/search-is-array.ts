'use strict';

import * as _ from 'lodash'

import isSearch from './is-search';

/*
  Searches should always return an array of objects.
*/
export const searchIsArray: Check = {
  name: 'triggerIsArray',
  shouldRun: isSearch,
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
