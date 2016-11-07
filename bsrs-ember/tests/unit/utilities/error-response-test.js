import parseError from 'bsrs-ember/utilities/error-response';
import { module, test } from 'qunit';
import { ServerError, ClientError } from 'bsrs-ember/utilities/errors';

module('Unit | Utility | error response');

test('Parses XHR error response and returns a custom error type', function(assert) {
  let error = parseError(500, '{"detail":"i18n-key"}');
  assert.ok(error instanceof ServerError, 'returns ServerError');
});

test('Returns custom error type with "message" property', function(assert) {
  let error = parseError(500, '{"detail":"i18n-key"}');
  assert.equal(error.message, 'i18n-key', 'uses error message from payload');
});

test('Without valid JSON, returns custom error type with "message" property', function(assert) {
  let error = parseError(500, 'Server Error');
  assert.equal(error.message, 'errors.server.default', 'default message is "errors.server.default"');
});

test('Returns custom error type with "level" property', function(assert) {
  let error = parseError(500, '{"detail":"i18n-key"}');
  assert.equal(error.level, 'error', 'default level is "error"');
});

test('Returns ClientError for 400 error', function(assert) {
  let error = parseError(400, '{"name":["This field may not be blank."]}');
  assert.ok(error instanceof ClientError, 'error type is ClientError');
});

test('formats the attribute error responses from a 400 error', function(assert) {
  let error = parseError(400, '{"alpha_beta_capa":["This field may not be blank."]}');
  assert.ok(error.message.match('Alpha beta capa') !== null, 'attribute capitalized and included in message');
  assert.ok(error.message.match('may not be blank') !== null, 'attribute error included in message');
});
