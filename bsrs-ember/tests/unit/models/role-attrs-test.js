import {test, module} from 'qunit';
import Role from 'bsrs-ember/models/role';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

module('unit: role attrs test');

test('default state for name on role model is undefined', (assert) => {
    assert.expect(0);
    var role = Role.create({id: ROLE_DEFAULTS.id, name: undefined});
});
