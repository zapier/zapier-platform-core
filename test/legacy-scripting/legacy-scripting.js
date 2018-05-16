'use strict';

const should = require('should');

const appDefinition = require('./example-app');
const createApp = require('../../src/create-app');
const createInput = require('../../src/tools/create-input');

describe('legacy-scripting', () => {
  const testLogger = (/* message, data */) => {
    // console.log(message, data);
    return Promise.resolve({});
  };

  const app = createApp(appDefinition);

  const createTestInput = method => {
    const event = {
      bundle: {},
      method
    };

    return createInput(appDefinition, event, testLogger);
  };

  describe('triggers', () => {
    it.skip('should run KEY_poll', () => {
      const input = createTestInput('triggers.contact_full.operation.perform');
      return app(input).then(output => {
        output.results.length.should.greaterThan(1);

        const firstContact = output.results[0];
        should.equal(firstContact.name, 'Patched by Legacy Scripting!');
      });
    });
  });
});
