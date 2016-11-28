'use strict';

const _ = require('lodash');
const dataTools = require('./data');

const quote = (s) => "'" + s + "'";
const join = (list) => list.map(quote).join(', ');

const isRequestMethod = needle => typeof needle === 'object' && typeof needle.url === 'string';

/*
  Verifies a object in an app tree, returning the path to it if found (or throwing an error if not found):

    // a findable function/array/method
    resolveMethodPath(app, app.resources.contact.get.operation.perform)

*/
const resolveMethodPath = (app, needle) => {
  let possibilities;

  // can be a function (directly callable), an array (like inputFields) or a path itself
  if (typeof needle === 'function' || _.isArray(needle) || isRequestMethod(needle)) {
    const path = dataTools.findMapDeep(app, needle);
    if (!path) {
      throw new Error('We could not find your function, is it registered somewhere on your app?');
    }
    possibilities = [path];
  } else {
    throw new Error('You must pass in a function/array found (via ===) somewhere ob your App definition.');
  }

  const paths = possibilities.filter(path => _.get(app, path) !== undefined);

  if (!paths.length) {
    throw new Error(`${quote(needle)} is not a valid full path / shorthand path. We checked ${join(possibilities)}.`);
  }

  if (paths.length > 1) {
    throw new Error(`Found more than one paths with functions: ${join(paths)}. Can you be more specific?`);
  }

  return paths[0];
};

module.exports = resolveMethodPath;
