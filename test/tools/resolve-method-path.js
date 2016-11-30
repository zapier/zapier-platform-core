'use strict';

require('should');

const _ = require('lodash');

const appDefinition = require('../userapp');
const resolveMethodPath = require('../../src/tools/resolve-method-path');
const schemaTools = require('../../src/tools/schema');

describe('resolve-method-path', () => {
  const app = schemaTools.prepareApp(appDefinition);

  it('should resolve a request method object with a url', () => {
    resolveMethodPath(app, app.resources.contact.list.operation.perform)
      .should.eql('resources.contact.list.operation.perform');
  });

  it('should resolve an inputFields array', () => {
    resolveMethodPath(app, app.resources.contact.list.operation.inputFields)
      .should.eql('resources.contact.list.operation.inputFields');
  });

  it('should resolve a function', () => {
    resolveMethodPath(app, app.creates.contactCreate.operation.perform)
      .should.eql('creates.contactCreate.operation.perform');

    resolveMethodPath(app, app.triggers.contactList.operation.perform)
      .should.eql('triggers.contactList.operation.perform');

    resolveMethodPath(app, app.hydrators.getBigStuff)
      .should.eql('hydrators.getBigStuff');
  });

  it('should resolve authentication paths', () => {
    const oauthAppDef = _.extend({}, appDefinition);
    oauthAppDef.authentication = {
      test: () => {},
      oauth2Config: {
        authorizeUrl: {method: 'GET', url: 'http://example.com'},
        getAccessToken: () => {}
      }
    };
    const authApp = schemaTools.prepareApp(oauthAppDef);
    resolveMethodPath(authApp, authApp.authentication.test)
      .should.eql('authentication.test');
    resolveMethodPath(authApp, authApp.authentication.oauth2Config.getAccessToken)
      .should.eql('authentication.oauth2Config.getAccessToken');
    // oauthAppDef !== authApp due to prepareApp() - so make sure isEqual is used
    resolveMethodPath(authApp, oauthAppDef.authentication.oauth2Config.authorizeUrl)
      .should.eql('authentication.oauth2Config.authorizeUrl');
    resolveMethodPath(authApp, authApp.authentication.oauth2Config.authorizeUrl)
      .should.eql('authentication.oauth2Config.authorizeUrl');
  });
});
