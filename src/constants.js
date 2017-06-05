'use strict';

const _process_args = process.argv.join(' ');
const IS_TESTING = _process_args.indexOf('mocha') > 0;

const KILL_MIN_LIMIT = 250;
const KILL_MAX_LIMIT = 450 * 1000 * 1000;

const RESPONSE_SIZE_LIMIT = 6291456;

const HYDRATE_DIRECTIVE_HOIST = '$HOIST$';

const RENDER_ONLY_METHODS = ['authentication.oauth2Config.authorizeUrl'];

const REQUEST_OBJECT_SHORTHAND_OPTIONS = {replace: true};

// TODO: Match this with backend
const LOCK_MAX_TIMEOUT = 60 * 60 * 24; // 1 day, in seconds
const LOCK_EXCEPTION = 'LOCK_EXCEPTION';

module.exports = {
  IS_TESTING,
  KILL_MIN_LIMIT,
  KILL_MAX_LIMIT,
  RESPONSE_SIZE_LIMIT,
  HYDRATE_DIRECTIVE_HOIST,
  RENDER_ONLY_METHODS,
  REQUEST_OBJECT_SHORTHAND_OPTIONS,
  LOCK_MAX_TIMEOUT,
  LOCK_EXCEPTION
};
