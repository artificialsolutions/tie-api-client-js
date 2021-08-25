'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const querystring = require('querystring');

const generateHeaders = (additionalHeaders) => {
  const headers = new Headers();
  headers.append('Accept', 'application/json;charset=UTF-8');
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  // TODO => Delete X-Teneo-Session header after permanent SaaS solution is implemented
  const xSessionHeader = window.sessionStorage.getItem('X-Teneo-Session');
  if (xSessionHeader) {
    headers.append('X-Teneo-Session', xSessionHeader);
  }
  Object.keys(additionalHeaders).forEach((key) => {
    headers.append(key, additionalHeaders[key]);
  });
  return headers;
};

module.exports = {
  post: (url, data, headers = {}) => {
    const request = fetch(url, {
      headers: generateHeaders(headers),
      method: 'POST',
      credentials: 'include',
      body: querystring.stringify(data)
    });

    return request
      .then((response) => {
        let it = response.headers.entries();
        let result = it.next();
        while (!result.done) {
          let key = result.value[0];
          let value = result.value[1];
          console.log(key);
          //TODO => Remove these special headers when permanent solution for SaaS is found.
          if (key === 'x-gateway-session') {
            window.sessionStorage.setItem('X-Gateway-Session', `${value.split(';')[0]}`);
            break;
          }

          result = it.next();
        }
        if (response.status >= 400) {
          throw new Error(`Received error code ${response.status}`);
        }

        return response.json();
      }).catch((error) => {
        throw new Error('Could not communicate with server. ' + error);
      });
  }
};
