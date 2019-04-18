'use strict';

const should = require('should');

const createAppTester = require('../../src/tools/create-app-tester');
const appDefinition = require('../userapp');

// this doesn't work for core modules like 'http' which don't use the cache
const requireUncached = m => {
  delete require.cache[require.resolve(m)];
  return require(m);
};

describe('create-lambda-handler', () => {
  // this block is skipped because there's no way to un-modify 'http' once we've done it
  // I've verified that the bottom test works in isolation, but doesn't when it's part of the larger suite
  describe.skip('http patch', () => {
    it('should patch by default', async () => {
      const appTester = createAppTester(appDefinition);
      await appTester(appDefinition.resources.list.list.operation.perform);
      const http = requireUncached('http');
      should(http.patchedByZapier).eql(true);
    });

    it('should be ablet opt out of patch', async () => {
      const appTester = createAppTester(appDefinition, { skipHttpPatch: true });
      await appTester(appDefinition.resources.list.list.operation.perform);
      const http = requireUncached('http');
      should(http.patchedByZapier).eql(undefined);
    });
  });
});
