import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var container, registry, store;

module('sco unit: role test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:role', 'model:location-level']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('role is dirty or related is dirty when model has been updated', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name, location_level: LOCATION_LEVEL_DEFAULTS.idOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', 'abc');
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('name', ROLE_DEFAULTS.name);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('location_level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('location_level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('role_type', ROLE_DEFAULTS.roleTypeContractor);
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('role_type', ROLE_DEFAULTS.roleTypeGeneral);
    assert.ok(role.get('isNotDirty'));
});

