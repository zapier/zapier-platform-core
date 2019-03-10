'use strict';

const util = require('util');
const _ = require('lodash');

// Make some of the errors we'll use!
const createError = name => {
  const NewError = function(message = '') {
    this.name = name;
    this.message = message;
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
  };
  util.inherits(NewError, Error);
  return NewError;
};

const names = [
  'CheckError',
  'DehydrateError',
  'ExpiredAuthError',
  'HaltedError',
  'MethodDoesNotExist',
  'NotImplementedError',
  'RefreshAuthError',
  'RequireModuleError',
  'StopRequestError'
];

const exceptions = _.reduce(
  names,
  (col, name) => {
    col[name] = createError(name);
    return col;
  },
  {}
);

const isRequireError = ({ name, message }) =>
  name === 'ReferenceError' && message === 'require is not defined';

const handleError = err => {
  const { RequireModuleError } = exceptions;
  if (isRequireError(err)) {
    throw new RequireModuleError(
      "Node's module system is not in scope. Use z.require() instead."
    );
  }

  throw err;
};

module.exports = {
  ...exceptions,
  handleError
};
