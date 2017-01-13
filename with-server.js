var express = require('express');

module.exports = function withServer(port, awaitSignal) {
  return new Promise(function(resolve, reject) {
    var app = express();

    app.get('/', function(req, res) {
      res
        .set('single', 'a single value')
        .set('double', ['the first value', 'the second value'])
        .send('A great response');
    });

    var server = app.listen(port, function() {
      awaitSignal().then(
        function(result) {
          server.close();
          resolve(result);
        },
        function(error) {
          server.close();
          reject(error);
        }
      );
    });
  });
};
