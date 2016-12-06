var test = require('tape');
var Boom = require('boom');
var sendBoom = require('./');
var http = require('http');
var request = require('request');
var HttpHashRouter = require('http-hash-router');

test('basic usage', function (t) {
  var server;
  var router = HttpHashRouter();

  router.set('/400', function badRequest (req, res) {
    sendBoom(req, res, Boom.badRequest('indeed'));
  });
  router.set('/401', function badRequest (req, res) {
    sendBoom(req, res, Boom.unauthorized('indeed', 'awesome'));
  });
  router.set('/500', function badRequest (req, res) {
    sendBoom(req, res, Boom.badImplementation('indeed'));
  });
  router.set('/generic', function badRequest (req, res) {
    sendBoom(req, res, new Error('indeed'));
  });

  t.test('server setup', function (t) {
    server = http.createServer(function (req, res) {
      router(req, res, {}, onError);

      function onError (err) {
        t.fail(err);
      }
    });
    server.listen(3456, function () {
      t.end();
    });
  });

  t.test('test', function (t) {
    t.plan(13);
    request.get('http://127.0.0.1:3456/400', function (err, result) {
      t.notOk(err, 'no error');
      t.equal(result.statusCode, 400, 'should get proper status code');
      var body = JSON.parse(result.body);
      t.deepEqual(body, {
        statusCode: 400,
        error: 'Bad Request',
        message: 'indeed'
      }, 'body gets json message');
    });
    request.get('http://127.0.0.1:3456/401', function (err, result) {
      t.notOk(err, 'no error');
      t.equal(result.statusCode, 401, 'should get proper status code');
      var body = JSON.parse(result.body);
      t.deepEqual(body, {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'indeed',
        attributes: {
          error: 'indeed'
        }
      }, 'body gets complex json message');
      t.equal(result.headers['WWW-Authenticate'.toLowerCase()], 'awesome error="indeed"', 'gets www auth header');
    });
    request.get('http://127.0.0.1:3456/500', function (err, result) {
      t.notOk(err, 'no error');
      t.equal(result.statusCode, 500, 'should get proper status code');
      var body = JSON.parse(result.body);
      t.deepEqual(body, {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      }, 'body gets json with hidden message');
    });
    request.get('http://127.0.0.1:3456/generic', function (err, result) {
      t.notOk(err, 'no error');
      t.equal(result.statusCode, 500, 'wraps error with generic boom 500');
      var body = JSON.parse(result.body);
      t.deepEqual(body, {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      }, 'body gets json with hidden message');
    });
  });

  t.test('server teardown', function (t) {
    server.close();
    t.end();
  });
});
