import { alertClass } from 'bsrs-ember/helpers/alert-class';
import { module, test } from 'qunit';

module('Unit | Helper | alert class');

test('it works', function(assert) {
  let result = alertClass('', {translated: 'info'});
  assert.equal(result, 'alert-info');
});
