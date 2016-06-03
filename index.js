function fetchForRedux() {
  return fetch.apply(this, arguments).then(parseResponse, nullResponse);
}

function parseResponse(response) {
  var isJson = isJsonContentType(response.headers.get('content-type'));
  return response[isJson ? 'json' : 'text']().then(function(body) {
    return {
      status: response.status,
      headers: parseHeaders(response.headers),
      body: body
    };
  });
}

function isJsonContentType(contentType) {
  return contentType.match(/\W*json\W*/i);
}

function parseHeaders(headers) {
  var result = {};
  headers.forEach(function(value, key) {
    result[key] = result[key] || [];
    result[key].push(value);
  });
  return result;
}

function nullResponse(error) {
  return {
    status: 0,
    headers: {},
    body: error.message
  };
}

module.exports = fetchForRedux;
