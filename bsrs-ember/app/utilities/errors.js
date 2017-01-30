/**
  - Error.prototype.constructor.call is calling super for the ServerError
  @class ServerError
  @constructor
  @param {String} message
  @param {String} level of notice, e.g. critical, error, info
  @param {Object} response
  @return {Error}
*/
export function ServerError(message = 'errors.server.default', level = 'error', response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'ServerError';
  this.stack = _error.stack;
  this.message = _error.message;
  this.name = 'ServerError';
  this.response = response;
  this.errors = (response) ? response.errors || null : null;
  this.code = (response) ? response.status || null : null;
  this.level = level;
}

// set prototype to an Error type
ServerError.prototype = errorProtoFactory(ServerError);

/**
  - Error.prototype.constructor.call is calling super for the ClientError
  @class ClientError
  @constructor
  @param {String} message
  @param {String} level of notice, e.g. critical, error, info
  @param {Object} response
  @return {Error}
*/
export function ClientError(message = 'errors.client.default', level = 'error', response = null) {
  let _error = Error.prototype.constructor.call(this, message);
  _error.name = this.name = 'ClientError';
  this.stack = _error.stack;
  this.message = _error.message;
  this.name = 'ClientError';
  this.response = response;
  this.errors = (response) ? response.errors || null : null;
  this.code = (response) ? response.status || null : null;
  this.level = level;
}

// set prototype to an Error type
ClientError.prototype = errorProtoFactory(ClientError);

/**
 * ctor - Client/Server function
 * @method errorProtoFactory
 * @return {Object} - Error type whose constructor is the passed in ctor (e.g. ClientError function)
 */
function errorProtoFactory(ctor) {
  return Object.create(Error.prototype, {
    constructor: {
      value: ctor,
      writable: true,
      configurable: true
    }
  });
}
