/**
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
ServerError.prototype = errorProtoFactory(ServerError);

/**
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
ClientError.prototype = errorProtoFactory(ClientError);

function errorProtoFactory(ctor) {
  return Object.create(Error.prototype, {
    constructor: {
      value: ctor,
      writable: true,
      configurable: true
    }
  });
}
