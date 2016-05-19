import { dtBreadcrumbText } from 'bsrs-ember/helpers/dt-breadcrumb-text';
import { module, test } from 'qunit';

module('Unit | Helper | dt breadcrumb text');

test('it shows description if present', function(assert) {
  const result = dtBreadcrumbText([{description: 'watwatwatwatwho'}]);
  assert.equal(result, 'watwatwatwat');
});
