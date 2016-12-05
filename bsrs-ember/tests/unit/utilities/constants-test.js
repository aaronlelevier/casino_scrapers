import { RESOURCES_WITH_PERMISSION, PERMISSION_PREFIXES } from 'bsrs-ember/utilities/constants';
import { module, test } from 'qunit';

module('Unit | Utility | constants');

test('RESOURCES_WITH_PERMISSION', function(assert) {
  assert.ok(RESOURCES_WITH_PERMISSION);
});

test('PERMISSION_PREFIXES', function(assert) {
  assert.ok(PERMISSION_PREFIXES);
});
