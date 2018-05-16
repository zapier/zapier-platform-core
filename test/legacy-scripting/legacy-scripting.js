'use strict';

const should = require('should');

const appDefinition = require('./example-app');
const createApp = require('../../src/create-app');
const createInput = require('../../src/tools/create-input');

describe('legacy scripting', () => {
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
    it('KEY_poll', () => {
      const input = createTestInput('triggers.contact_full.operation.perform');
      return app(input).then(output => {
        output.results.length.should.greaterThan(1);

        const firstContact = output.results[0];
        should.equal(firstContact.name, 'Patched by KEY_poll!');
      });
    });

    it('KEY_pre_poll', () => {
      const input = createTestInput('triggers.contact_pre.operation.perform');
      return app(input).then(output => {
        output.results.length.should.equal(1);

        const contact = output.results[0];
        should.equal(contact.id, 3);
      });
    });

    it('KEY_post_poll', () => {
      const input = createTestInput('triggers.contact_post.operation.perform');
      return app(input).then(output => {
        output.results.length.should.greaterThan(1);

        const firstContact = output.results[0];
        should.equal(firstContact.name, 'Patched by KEY_post_poll!');
      });
    });

    it('KEY_pre_poll & KEY_post_poll', () => {
      const input = createTestInput(
        'triggers.contact_pre_post.operation.perform'
      );
      return app(input).then(output => {
        output.results.length.should.equal(1);

        const contact = output.results[0];
        should.equal(contact.id, 4);
        should.equal(contact.name, 'Patched by KEY_pre_poll & KEY_post_poll!');
      });
    });
  });
});
