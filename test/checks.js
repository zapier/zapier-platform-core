'use strict';

require('should');

const checks = {
  isTrigger: require('../src/checks/is-trigger'),
  triggerHasId: require('../src/checks/trigger-has-id'),
  triggerHasUniqueIds: require('../src/checks/trigger-has-unique-ids'),
  triggerIsArray: require('../src/checks/trigger-is-array'),
  triggerIsObject: require('../src/checks/trigger-is-object'),
};

describe.only('checks', () => {

  describe('isTrigger', () => {

    it('should return true for a poll', () => {
      checks.isTrigger('triggers.example.operation.perform').should.eql(true);
    });

    it('should return false for a create', () => {
      checks.isTrigger('creates.example.operation.perform').should.eql(false);
    });

  });

  describe('triggerHasId', () => {

    it('should return no errors for results with id', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        }
      ];

      const errors = checks.triggerHasId.run('does.not.matter', results);
      errors.should.eql([]);
    });

    it('should return no errors for results with an empty id', () => {
      const results = [
        {
          id: '',
          name: 'Something'
        }
      ];

      const errors = checks.triggerHasId.run('does.not.matter', results);
      errors.should.eql([]);
    });

    it('should return errors for results without id', () => {
      const results = [
        {
          name: 'Something'
        }
      ];

      const errors = checks.triggerHasId.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Got a result missing the "id" property');
    });

    it('should return errors for results with a null id', () => {
      const results = [
        {
          id: null,
          name: 'Something'
        }
      ];

      const errors = checks.triggerHasId.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Got a result missing the "id" property');
    });

  });

  describe('triggerHasUniqueIds', () => {

    it('should return no errors for results with unique ids', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        },
        {
          id: 2,
          name: 'Something Else'
        }
      ];

      const errors = checks.triggerHasUniqueIds.run('does.not.matter', results);
      errors.should.eql([]);
    });

    it('should return errors for results with duplicate ids', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        },
        {
          id: 1,
          name: 'Something Else'
        }
      ];

      const errors = checks.triggerHasUniqueIds.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Got two or more results with the id of 1');
    });

  });

  describe('triggerIsArray', () => {

    it('should return no errors for results as array', () => {
      const results = [];

      const errors = checks.triggerIsArray.run('does.not.matter', results);
      errors.should.eql([]);
    });

    it('should return errors for results as object', () => {
      const results = {};

      const errors = checks.triggerIsArray.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Results must be an array');
    });

  });

  describe('triggerIsObject', () => {

    it('should return no errors for results that are objects', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        },
        {
          id: 2,
          name: 'Something Else'
        }
      ];

      const errors = checks.triggerIsObject.run('does.not.matter', results);
      errors.should.eql([]);
    });

    it('should return errors for results that are not objects', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        },
        'Something Else'
      ];

      const errors = checks.triggerIsObject.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Got a result that was not an object');
    });

    it('should return errors for results that are null', () => {
      const results = [
        {
          id: 1,
          name: 'Something'
        },
        null
      ];

      const errors = checks.triggerIsObject.run('does.not.matter', results);
      errors.should.be.an.Array();
      errors.length.should.eql(1);

      const error = errors[0];
      error.should.containEql('Got a result that was not an object');
    });

  });

});
