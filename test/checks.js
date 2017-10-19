'use strict';

require('should');

const checks = require('../lib/checks');

const isTrigger = require('../lib/checks/is-trigger');
const isSearch = require('../lib/checks/is-search');
const isCreate = require('../lib/checks/is-create');

const testMethod = 'some.method';

describe('checks', () => {
  it('should see create return values with singles via createIsSingle', () => {
    checks.createIsSingle.run(testMethod, {}).length.should.eql(0);

    checks.createIsSingle.run(testMethod, []).length.should.eql(1);
    checks.createIsSingle.run(testMethod, [{}]).length.should.eql(1);
    checks.createIsSingle.run(testMethod, [{}, {}]).length.should.eql(1);
  });

  it('should error for objects via searchIsArray', () => {
    checks.searchIsArray.run(testMethod, [{}, {}]).length.should.eql(0);
    checks.searchIsArray.run(testMethod, [{}]).length.should.eql(0);
    checks.searchIsArray.run(testMethod, {}).length.should.eql(1);
  });

  it('should check for ids via triggerHasId', () => {
    checks.triggerHasId.run(testMethod, [{ id: 1 }]).length.should.eql(0);
    checks.triggerHasId.run(testMethod, [{ id: 1 }, { id: 2 }]).length.should.eql(0);
    checks.triggerHasId.run(testMethod, [{ game_id: 1 }]).length.should.eql(1);
    checks.triggerHasId.run(testMethod, []).length.should.eql(0, 'blank array');
    checks.triggerHasId.run(testMethod, [1]).length.should.eql(1);
    checks.triggerHasId.run(testMethod, [{ id: null }]).length.should.eql(1);
    checks.triggerHasId.run(testMethod, [{}]).length.should.eql(1);
  });

  it('should check for unique ids via triggerHasUniqueIds', () => {
    checks.triggerHasUniqueIds.run(testMethod, [{ id: 1 }, { id: 2 }]).length.should.eql(0);
    checks.triggerHasUniqueIds.run(testMethod, [{ id: 1 }, { id: 1 }]).length.should.eql(1);

    checks.triggerHasUniqueIds.run(testMethod, []).length.should.eql(0);
  });

  it('should error for objects via triggerIsArray', () => {
    checks.triggerIsArray.run(testMethod, [{}, {}]).length.should.eql(0);
    checks.triggerIsArray.run(testMethod, []).length.should.eql(0);
    checks.triggerIsArray.run(testMethod, {}).length.should.eql(1);
  });

  it('should error for non-objects via triggerIsObject', () => {
    checks.triggerIsObject.run(testMethod, ['']).length.should.eql(1, 'empty string');
    checks.triggerIsObject.run(testMethod, []).length.should.eql(0, 'empty array');
    checks.triggerIsObject.run(testMethod, [{}, {}]).length.should.eql(0, 'single object');
    checks.triggerIsObject.run(testMethod, [{}, []]).length.should.eql(1, 'mismatched objects');
  });

  it('should recognize types by name', () => {
    isTrigger.default('triggers.blah.operation.perform').should.be.true();
    isTrigger.default('resources.blah.list.operation.perform').should.be.true();
    isTrigger.default('blah').should.be.false();

    isSearch.default('searches.blah.operation.perform').should.be.true();
    isSearch.default('resources.blah.search.operation.perform').should.be.true();
    isSearch.default('blah').should.be.false();

    isCreate.default('creates.blah.operation.perform').should.be.true();
    isCreate.default('resources.blah.create.operation.perform').should.be.true();
    isCreate.default('blah').should.be.false();
  });
});
