import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

let container, registry, store;

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
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('name', 'abc');
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('name', ROLE_DEFAULTS.nameOne);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.set('role_type', ROLE_DEFAULTS.roleTypeContractor);
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.set('role_type', ROLE_DEFAULTS.roleTypeGeneral);
    assert.ok(role.get('isNotDirty'));
});

test('role can be related to one or many people', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral, people: []});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    let related = role.get('people');
    role.set('people', related.concat([PEOPLE_DEFAULTS.idOne]));
    assert.deepEqual(role.get('people'), [PEOPLE_DEFAULTS.idOne]);
    assert.ok(role.get('isDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

/*ROLE TO LOCATION LEVEL 1-to-Many RELATIONSHIP*/
test('related location level should return first location level or undefined', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne});
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, roles: [ROLE_DEFAULTS.idOne]});
    let location_level = role.get('location_level');
    assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameRegion);
    location_level.set('roles', [ROLE_DEFAULTS.unused]);
    assert.equal(role.get('location_level'), undefined);
});

test('related location level is not dirty when no location level present', (assert) => {
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: [LOCATION_LEVEL_DEFAULTS.unusedId]});
    var role = store.push('role', {id: ROLE_DEFAULTS.id});
    assert.ok(role.get('locationLevelIsNotDirty'));
    assert.equal(role.get('location_level'), undefined);
});

test('when role changes location level, model is dirty', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: [ROLE_DEFAULTS.idOne]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    location_level.rollback();
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('when role suddently has location level assigned to it, it is shown as dirty', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: undefined});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('roles', [ROLE_DEFAULTS.idOne]);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when role suddently has location level assigned to it starting with non empty array, it is shown as dirty', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: [ROLE_DEFAULTS.unusedId]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('roles', [ROLE_DEFAULTS.unusedId, ROLE_DEFAULTS.idOne]);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when role suddenly has location level removed, it is dirty', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('roles', [ROLE_DEFAULTS.unusedId]);
    assert.equal(role.get('location_level'), undefined);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when role suddenly has location level removed, it is dirty (set to empty array)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, roles: [ROLE_DEFAULTS.idOne]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('roles', []);
    assert.equal(role.get('location_level'), undefined);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('rollback location level will reset the previously used location level when switching from valid location level to undefined', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, roles: [ROLE_DEFAULTS.idOne]});
    let location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, roles: [ROLE_DEFAULTS.unusedId]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameRegion); 
    location_level_one.set('roles', [ROLE_DEFAULTS.unusedId]);
    assert.equal(role.get('location_level.name'), undefined); 
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    location_level_two.set('roles', [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDepartment); 
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.save();
    role.saveRelated();
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    location_level_two.set('roles', [ROLE_DEFAULTS.unusedId]);
    location_level_two.save();
    assert.equal(role.get('location_level.name'), undefined);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollback();
    role.rollbackLocationLevel();
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDepartment);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location level will reset the previously used location level when switching from valid location level to another location level', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, roles: [ROLE_DEFAULTS.idOne]});
    let location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, roles: [ROLE_DEFAULTS.unusedId]});
    let another_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, roles: [ROLE_DEFAULTS.unusedId]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameRegion); 
    location_level_one.set('roles', [ROLE_DEFAULTS.unusedId]);
    location_level_one.save();
    location_level_two.set('roles', [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDepartment); 
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.save();
    role.saveRelated();
    location_level_two.set('roles', [ROLE_DEFAULTS.unusedId]);
    location_level_two.save();
    another_location_level.set('roles', [ROLE_DEFAULTS.unusedId, ROLE_DEFAULTS.idOne]);
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollback();
    role.rollbackLocationLevel();
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDepartment);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('roles'), [ROLE_DEFAULTS.unusedId]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
});

test('saving an undefined location level on a previously dirty role will clean the role model', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion, roles: [ROLE_DEFAULTS.idOne]});
    let location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, roles: [ROLE_DEFAULTS.unusedId]});
    let another_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, roles: [ROLE_DEFAULTS.unusedId]});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameRegion); 
    location_level_one.set('roles', [ROLE_DEFAULTS.unusedId]);
    assert.equal(role.get('location_level'), undefined); 
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.save();
    role.saveRelated();
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));//
    another_location_level.set('roles', [ROLE_DEFAULTS.idOne]);
    assert.equal(role.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollback();
    role.rollbackLocationLevel();
    assert.ok(typeof role.get('location_level') === 'undefined');
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});
