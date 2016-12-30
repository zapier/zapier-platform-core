'use strict';

const _ = require('lodash');

const isCreate = require('./is-create');

/*
  Makes sure the results are all objects.
*/
const createIsSingle = {
  name: 'createIsSingle',
  shouldRun: isCreate,
  run: (method, results) => {
    if (_.isArray(results) && results.length > 1) {
      const repr = _.truncate(JSON.stringify(results), 50);
      return [
        `Got a result with multiple return values, expecting a single object from create (${repr})`
      ];
    }

    if (_.isObject(results)) {
      return []; // assumes a single object is not nested {data: [{}, {}]}
    }

    return [];
  }
};

module.exports = createIsSingle;
