const callbackOrPromise = require('./utils/callback-or-promise');
const http = require('./utils/http');
const prune = require('./utils/prune');

const readClientOrigin = () => {
  if (typeof document === 'undefined' || !document.location) return;

  return document.location.origin;
};

const getParameters = prune(['viewname', 'viewtype', 'userinput', 'text', 'clientOrigin']);
const formatEngineUrl = (url) => url.endsWith('/') ? url : `${url}/`;
const requestBody = (body) => {
  const clientOrigin = readClientOrigin();
  const jspViewNames = { viewname: 'tieapi', viewtype: 'tieapi' };
  const parameters = clientOrigin ? Object.assign(jspViewNames, { clientOrigin }) : jspViewNames;

  return Object.assign(parameters, body);
};

function close(teneoEngineUrl, sessionId, cb) {
  const endSessionUrl = `${formatEngineUrl(teneoEngineUrl)}endsession`;
  const headers = sessionId ? { 'Cookie': `JSESSIONID=${sessionId}` } : {};
  const options = { parseAsText: true };

  return http.post(endSessionUrl, requestBody(), headers, options)
    .then((response) => cb(null, response.body))
    .catch((error) => cb(error));
}

const verifyInputData = (inputData) => {
  const validDataType = (x) => ['string', 'number', 'bool'].includes(typeof x);
  const keys = Object.keys(inputData);

  if (!(typeof inputData === 'object' && keys.includes('text'))) {
    throw new TypeError(`sendInput input data must be an object with atleast a 'text' property: ${JSON.stringify(inputData)}`);
  }

  if (!keys.every((key) => validDataType(inputData[key]))) {
    throw new TypeError(`sendInput input data object can only contain values of type string, number or bool ${JSON.stringify(inputData)}`);
  }
};

function sendInput(teneoEngineUrl, currentSessionId, inputData, cb) {
  verifyInputData(inputData);

  const headers = currentSessionId ? { 'Cookie': `JSESSIONID=${currentSessionId}` } : {};
  const parameters = getParameters(inputData);
  const body = requestBody(Object.assign({ userinput: inputData.text }, parameters));

  return http.post(formatEngineUrl(teneoEngineUrl), body, headers)
    .then((response) => cb(null, response))
    .catch((error) => cb(error));
}

module.exports = {
  close: callbackOrPromise(close),
  sendInput: callbackOrPromise(sendInput),
  init: (teneoEngineUrl) => ({
    close: callbackOrPromise(close.bind(null, teneoEngineUrl)),
    sendInput: callbackOrPromise(sendInput.bind(null, teneoEngineUrl))
  })
};
