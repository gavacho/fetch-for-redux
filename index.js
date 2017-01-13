module.exports = function fetchForRedux() {
  return fetch.apply(this, arguments).then(parseResponse, nullResponse);
};

function parseResponse(response) {
  var headers = parseHeaders(response.headers);
  var contentType = headers['content-type'] || '';
  var awaitBody = response[contentType.match(/\W*json\W*/i) ? 'json' : 'text']();
  return awaitBody.then(function(body) {
    return {
      status: response.status,
      headers: headers,
      body: body
    };
  });
}

function parseHeaders(headers) {
  var result = {};
  forEachHeader(headers, function(value, unnormalizedKey) {
    var key = unnormalizedKey.toLowerCase();
    if (result[key] === undefined) {
      result[key] = value;
    } else {
      result[key] += ', ' + value;
    }
  });
  return result;
}

function forEachHeader(headers, iteratee) {
  if (typeof Symbol !== 'undefined' && typeof Symbol.iterator !== 'undefined' && headers[Symbol.iterator]) {
    for (var _iterator = headers[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      iteratee(_step.value[1], _step.value[0]);
    }
    return;
  }
  if (headers.forEach) {
    headers.forEach(iteratee);
    return;
  }
  throw new Error('fetch-for-redux was unable to iterate the specified headers');
}

function nullResponse(error) {
  return {
    status: 0,
    headers: {},
    body: error.message
  };
}
