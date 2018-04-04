'use strict';

const should = require('should');

const mocky = require('./mocky');

describe.only('rpc client', () => {
  const rpc = mocky.makeRpc();

  it('should handle a ping', done => {
    mocky.mockRpcCall('pong');

    rpc('ping')
      .then(result => {
        should(result).eql('pong');
      })
      .then(() => done())
      .catch(done);
  });

  it('should handle an explosion', done => {
    mocky.mockRpcFail('this is an expected explosion');

    rpc('explode')
      .then(() => done(new Error('this should have exploded')))
      .catch(err => {
        should(err.message).eql('this is an expected explosion');
        done();
      })
      .catch(done);
  });

  it('should set a cursor key', done => {
    mocky.mockRpcCall('blah');

    rpc('store_cursor', 'blah')
      .then(res => {
        should(res).eql('blah');
        done();
      })
      .catch(done);
  });
});
