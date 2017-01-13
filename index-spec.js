/* eslint-env jasmine */

var fetchForRedux = require('./index');
var withServer = require('./with-server');

var urls = {
  json: 'https://www.hautelook.com/api',
  text: 'https://www.hautelook.com/',
  failure: 'http://this_thing_does_not_exit/'
};

describe('fetchForRedux', function() {
  it('is a function which returns a promise', function() {
    expect(typeof fetchForRedux).toEqual('function');
    expect(typeof fetchForRedux().then).toEqual('function');
  });

  it('passes all args to fetch', function() {
    var spy = spyOn(global, 'fetch').and.callThrough();
    fetchForRedux('one', 'two', 'three', 'four');
    expect(spy.calls.allArgs()).toEqual([
      ['one', 'two', 'three', 'four']
    ]);
  });

  describe('the result when fetch resolves with a response', function() {
    it('has a status property', function() {
      return fetchForRedux(urls.text).then(function(response) {
        expect(response.status).toEqual(200);
      });
    });

    it('has a headers property', function() {
      return fetchForRedux(urls.text).then(function(response) {
        expect(response.headers['content-type']).toEqual('text/html; charset=UTF-8');
      });
    });

    it('combines headers correctly', function() {
      return withServer(9234, function() {
        return fetchForRedux('http://localhost:9234/').then(function(response) {
          expect(response.headers.single).toEqual('a single value');
          expect(response.headers.double).toEqual('the first value, the second value');
        });
      });
    });

    it('has a body property whose type is string', function() {
      return fetchForRedux(urls.text).then(function(response) {
        expect(typeof response.body).toEqual('string');
        expect(response.body.length).not.toEqual(0);
      });
    });

    it('has a body property whose type is object when the response is json', function() {
      return fetchForRedux(urls.json).then(function(response) {
        expect(response.body._links.self).toEqual({href: urls.json});
      });
    });
  });

  describe('the result when fetch rejects with an error', function() {
    it('has a status property with value of 0', function() {
      return fetchForRedux(urls.failure).then(function(response) {
        expect(response.status).toEqual(0);
      });
    });

    it('has a headers property', function() {
      return fetchForRedux(urls.failure).then(function(response) {
        expect(typeof response.headers).toEqual('object');
      });
    });

    it('has a body property with the error message', function() {
      spyOn(global, 'fetch').and.returnValue(Promise.reject(new Error('an example error message')));
      return fetchForRedux(urls.failure).then(function(response) {
        expect(response.body).toEqual('an example error message');
      });
    });
  });
});
