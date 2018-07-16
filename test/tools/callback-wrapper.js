const createCallbackWrapper = require('../../src/tools/create-callback-wrapper');
const callbackStatusCatcher = require('../../src/app-middlewares/after/callback-status-catcher');
let should = require('should');

const CALLBACK_URL = 'http://example.com/callback';
let input = {
  _zapier: {
    callback: {
      url: CALLBACK_URL
    }
  }
};
describe('callbackwrapper', () => {
  let wrapper;

  before(() => {
    wrapper = createCallbackWrapper(input);
  });
  it('should expose a url property', () =>
    wrapper.url.should.eql(CALLBACK_URL));

  describe('reading the callback', () => {
    before(() => {
      //was probably set from the previous test
      delete input._zapier.callback.isUsed;
      should.not.exist(input._zapier.callback.isUsed);
    });
    it('should set the isUsed property', () => {
      wrapper.url; // eslint-disable-line no-unused-expressions
      input._zapier.callback.isUsed.should.eql(true);
    });
  });
});
describe('callbackStatusCatcher', () => {
  let output = {
    input
  };
  describe('when functions finish with an accessed callback', () => {
    let result;
    before(() => {
      input._zapier.callback.isUsed = true;
      result = callbackStatusCatcher(output);
    });
    it('should turn result into an envelope', () => {
      console.log(result);
      result.__type.should.eql('OutputEnvelope');
    });
    it('should set callback flag on envelope', () =>
      result.CALLBACK.should.be.eql(true));
  });
  describe('when functions finish without accessing callback', () => {
    let result;
    before(() => {
      delete input._zapier.callback.isUsed;
      result = callbackStatusCatcher(output);
    });
    it('should not modify result', () => result.should.eql(output));
    it('should not set CALLBACK flag', () => should.not.exist(result.CALLBACK));
  });
});
