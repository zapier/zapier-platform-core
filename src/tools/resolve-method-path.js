'use strict';

const _ = require('lodash');
const dataTools = require('./data');

const isRequestMethod = needle => typeof needle === 'object' && typeof needle.url === 'string';

/*
  Verifies a object in an app tree, returning the path to it if found (or throwing an error if not found):

    // a findable function/array/method
    resolveMethodPath(app, app.resources.contact.get.operation.perform)

*/
const resolveMethodPath = (app, needle) => {
  // can be a function (directly callable), an array (like inputFields) or a path itself
  if (!(typeof needle === 'function' || _.isArray(needle) || isRequestMethod(needle))) {
    throw new Error('You must pass in a function/array/object.');
  }

  // incurs roughly ~10ms penalty for _.isEqual fallback on a === miss on an averagish app
  const path = dataTools.memoizedFindMapDeep(app, needle) || dataTools.memoizedFindMapDeep(app, needle, _.isEqual);
  if (!path) {
    throw new Error('We could not find your function/array/object anywhere on your App definition.');
  }

  return path;
};

module.exports = resolveMethodPath;
