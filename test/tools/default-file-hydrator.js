'use strict';

const defaultFileHydrator = require('../../src/tools/default-file-hydrator');
const requestInternal = require('../../src/tools/request-client-internal');

describe('default file hydrator', () => {
  // Mocked z object
  const z = {
    request: options => {
      options.headers = options.headers || {};
      options.headers['X-Footprint'] = 'a proof that z.request is used';
      return requestInternal(options);
    },

    stashFile: (responsePromise, knownLength, filename, contentType) =>
      responsePromise.then(response => {
        // Instead of returning a URL, like how real z.stashFile does, here we make
        // z.stashFile return all the useful info for testing
        return {
          response,
          knownLength,
          filename,
          contentType
        };
      })
  };

  it('should use z.request', () => {
    const bundle = {
      inputData: {
        url: 'https://zapier-httpbin.herokuapp.com/get'
      }
    };
    return defaultFileHydrator(z, bundle).then(result => {
      const content = result.response.content;
      content.headers['X-Footprint'].should.eql(
        'a proof that z.request is used'
      );
    });
  });

  it('should use internal request client', () => {
    const bundle = {
      inputData: {
        url: 'https://zapier-httpbin.herokuapp.com/get',
        request: {
          headers: { 'X-Foo': 'hello' }
        }
      }
    };
    return defaultFileHydrator(z, bundle).then(result => {
      const content = result.response.content;
      content.headers.should.not.have.property('X-Footprint');
      content.headers['X-Foo'].should.eql('hello');
    });
  });

  it('should pass along file meta', () => {
    const bundle = {
      inputData: {
        url: 'https://zapier-httpbin.herokuapp.com/get',
        meta: {
          knownLength: 1234,
          filename: 'hello.json',
          contentType: 'application/json'
        }
      }
    };
    return defaultFileHydrator(z, bundle).then(result => {
      const content = result.response.content;
      content.headers['X-Footprint'].should.eql(
        'a proof that z.request is used'
      );

      result.knownLength.should.eql(1234);
      result.filename.should.eql('hello.json');
      result.contentType.should.eql('application/json');
    });
  });
});
