import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

var container, registry, store;

module('unit: role test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:role']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('role is dirty or related is dirty when model has been updated', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.id, name: ROLE_DEFAULTS.name});
    assert.ok(role.get('isNotDirty'));
//    assert.ok(role_type.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', 'abc');
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('name', ROLE_DEFAULTS.name);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    // role_type.set('role_type', ROLE_DEFAULTS.roleTypeContractor);
    // assert.ok(role_type.get('isDirty'));
    // assert.ok(role.get('phoneNumbersIsDirty'));
    // assert.ok(role.get('isNotDirty'));
    // assert.ok(role.get('isDirtyOrRelatedDirty'));
    // role_type.set('type', ROLE_DEFAULTS.roleTypeGeneral);
    // assert.ok(role.get('isNotDirty'));
});
