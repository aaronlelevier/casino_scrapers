import {test, module} from 'qunit';
import Role from 'bsrs-ember/models/role';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

module('unit: role attrs test');

test('default state for name on role model is undefined', (assert) => {
    var role = Role.create({id: ROLE_DEFAULTS.idOne, name: undefined});
    role.set('name', 'bill');
    assert.ok(role.get('isDirty'));
    role.set('name', '');
    assert.ok(role.get('isNotDirty'));
});

test('default state for role type on role model is location', (assert) => {
    var role = Role.create({id: ROLE_DEFAULTS.idOne, role_type: 'Location'});
    assert.ok(role.get('isNotDirty'));
    role.set('role_type', 'Third-Party');
    assert.ok(role.get('isDirty'));
    role.set('role_type', 'Location');
    assert.ok(role.get('isNotDirty'));
});

test('default state for people on role model is undefined', (assert) => {
    var role = Role.create({id: ROLE_DEFAULTS.idOne, people: undefined});
    role.set('people', [1, 2, 3]);
    assert.ok(role.get('isDirty'));
    role.set('people', []);
    assert.ok(role.get('isNotDirty'));
});
