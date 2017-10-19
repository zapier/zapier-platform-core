'use strict';

import * as _ from 'lodash'

import isTrigger from './is-trigger';

/*
  Makes sure the results all have an ID in them.
*/
export const triggerHasId: Check = {
  name: 'triggerHasId',
  shouldRun: (method, bundle) => {
    // Hooks will have a bundle.cleanedRequest and we don't need to check they've got an id
    return (isTrigger(method) && !bundle.cleanedRequest);
  },
  run: (method, results) => {
    const missingIdResult = _.find(results, (result: any) => {
      return !result || _.isUndefined(result.id) || _.isNull(result.id);
    });

    if (missingIdResult) {
      const repr = _.truncate(JSON.stringify(missingIdResult), { length: 250 });
      return [
        `Got a result missing the "id" property (${repr})`
      ];
    }
    return [];
  }
};
