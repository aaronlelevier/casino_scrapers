import { ClientError, ServerError } from 'bsrs-ember/utilities/errors';

/**
  Parse JSON error response and return a custom error object

  @method parseError
  @param {Number} code
  @param {String} json
  @return {Error} Custom error, e.g. ServerError
*/
export default function parseError(code, json) {
  let error;
  try {
    let response = JSON.parse(json);
    if (code >= 500) {
      // Response detail is expected to include an i18n key
      error = new ServerError(response.detail, 'error', response);
    } else if (code === 400) {
      error = new ClientError(badRequestErrorMessage(response), 'error', response);
    }
  } catch(e) {
    if (code >= 500) {
      // enforce i18n key
      error = new ServerError();
    } else if (code >= 400) {
      error = new ClientError();
    }
  }
  return error;
}

function badRequestErrorMessage(response) {
  let fields = Object.keys(response);
  let message = fields.map(function(attr) {
    return [
      attr.capitalize().replace(/_/g, ' '),
      ': ',
      response[attr].join('; ')
    ].join('');
  });
  return message;
}
