import { getPermission } from 'bsrs-ember/helpers/get-permission';
import { module, test } from 'qunit';

module('Unit | Helper | get permission');

test('returns a string with prefix: permissions_[arg1]_[arg2]', function(assert) {
  'view add change delete'.split(' ').forEach(function(prefix) {
    let actual = getPermission(['ticket', prefix]);
    let expected = `permissions_${prefix}_ticket`;
    assert.equal(actual, expected, `${expected} generated from args: 'ticket', '${prefix}'`);
  });
});

