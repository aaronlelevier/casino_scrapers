import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var container, registry, store;

module('unit: role test', {
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
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    assert.ok(role.get('isNotDirty'));
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

test('related location level is not dirty when no location level present with correct role_id', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: LOCATION_LEVEL_DEFAULTS.unusedId});
    assert.ok(role.get('locationLevelIsNotDirty'));
});

test('related location level is not dirty with original location level model ', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    assert.ok(role.get('locationLevelIsNotDirty'));
});

test('related location level is dirty when location level is dirty', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(role.get('locationLevelIsNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(location_level.get('isDirty'));
    assert.ok(role.get('locationLevelIsDirty'));
});

test('role is dirty or related is dirty when model is updated', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    assert.ok(role.get('isNotDirty'));
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', ROLE_DEFAULTS.namePut);
    assert.ok(role.get('isDirty'));
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('name', ROLE_DEFAULTS.name);
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(location_level.get('isDirty'));
    assert.ok(role.get('locationLevelIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('save related will iterate over each location level and save that model', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    var second_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    assert.ok(role.get('locationLevelIsNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(role.get('locationLevelIsDirty'));
    assert.ok(location_level.get('isDirty'));
    role.saveLocationLevels();
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.ok(location_level.get('isNotDirty'));
    second_location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(role.get('locationLevelIsDirty'));
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(second_location_level.get('isDirty'));
    role.saveLocationLevels();
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.ok(second_location_level.get('isNotDirty'));
});

test('rollback related will iterate over each location level and rollback that model', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.name});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    var second_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, role_id: ROLE_DEFAULTS.idOne});
    assert.ok(role.get('locationLevelIsNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(role.get('locationLevelIsDirty'));
    role.rollbackRelated();
    assert.ok(role.get('locationLevelIsNotDirty'));
    second_location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(role.get('locationLevelIsDirty'));
    role.rollbackRelated();
    assert.ok(role.get('locationLevelIsNotDirty'));
});
