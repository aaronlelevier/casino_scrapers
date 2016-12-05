import { eachPermission } from 'bsrs-ember/utilities/permissions';
import { module, test } from 'qunit';

module('Unit | Utility | permissions');

test('eachPermission', function(assert) {
  assert.ok(eachPermission);
});
