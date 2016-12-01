import { add } from 'bsrs-ember/helpers/add';
import { module, test } from 'qunit';

module('Unit | Helper | alert class');

test('it adds two numbers passed in', function(assert) {
  let result = add([1, 2]);
  assert.equal(result, 3);
  result = add([10, 2, 3]);
  assert.equal(result, 15);
  result = add([10]);
  assert.equal(result, 10);
});
