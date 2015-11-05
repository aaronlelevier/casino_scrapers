import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/role-category';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var store, uuid;

module('unit: role test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:category', 'model:location-level', 'model:role-category', 'model:uuid']);
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

/*ROLE TO PEOPLE 1-2-Many*/
test('role can be related to one or many people', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral, people: []});
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    let related = role.get('people');
    role.set('people', related.concat([PEOPLE_DEFAULTS.id]));
    assert.deepEqual(role.get('people'), [PEOPLE_DEFAULTS.id]);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('there is no leaky state when instantiating role (set)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    role.set('people', [PEOPLE_DEFAULTS.id]);
    assert.deepEqual(role.get('people'), [PEOPLE_DEFAULTS.id]);
    let role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    assert.deepEqual(role_two.get('people'), []);
});

test('there is leaky state when instantiating role (pushObject - DO NOT DO THIS)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    let people = role.get('people');
    people.pushObject(PEOPLE_DEFAULTS.id);
    assert.deepEqual(role.get('people'), [PEOPLE_DEFAULTS.id]);
    let role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, role_type: ROLE_DEFAULTS.roleTypeGeneral});
    assert.deepEqual(role_two.get('people'), [PEOPLE_DEFAULTS.id]);
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

/*ROLE TO CATEGORY M2M*/
test('categories property only returns the single matching item even when multiple categories exist', (assert) => {
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    role.add_category(CATEGORY_DEFAULTS.idTwo);
    let categories = role.get('categories');
    assert.equal(categories.get('length'), 1);
    assert.equal(categories.objectAt(0).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('categories property returns multiple matching items when multiple categories exist', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    let categories = role.get('categories');
    assert.equal(categories.get('length'), 2);
    assert.equal(categories.objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(categories.objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('categories property will update when add category is invoked and add new m2m join model (starting w/ empty array)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: []});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.add_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 1);
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when add category is invoked and add new m2m join model', (assert) => {
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(role.get('categories').get('length'), 2);
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly removes the category', (assert) => {
    let m2m = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    assert.equal(role.get('categories').get('length'), 1);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, category_fk: CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when categories is changed dirty tracking works as expected (removing)', (assert) => {
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('when categories is changed dirty tracking works as expected (replacing)', (assert) => {
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('categoryIsDirty'));
    assert.equal(role.get('categories').get('length'), 0);
    role.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.ok(role.get('categoryIsDirty'));
    assert.equal(role.get('categories').get('length'), 1);
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idTwo);
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    role.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
});


test('rollback role will reset the previously used people (categories) when switching from valid categories array to nothing', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, category_fk: CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.remove_category(CATEGORY_DEFAULTS.idTwo);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 0);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.rollbackRelated();
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(role.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('rollback categories will reset the previous people (categories) when switching from one category to another and saving in between each step', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, category_fk: CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(role.get('categories').get('length'), 2);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.save();
    role.saveRelated();
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    role.add_category(CATEGORY_DEFAULTS.unusedId);
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('categoryIsDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    role.save();
    role.saveRelated();
    assert.equal(role.get('categories').get('length'), 2);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('categoryIsNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('categories_ids computed returns a flat list of ids for each category', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, category_fk: CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(role.get('categories').get('length'), 2);
    assert.deepEqual(role.get('categories_ids'), [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.idTwo]);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 1);
    assert.deepEqual(role.get('categories_ids'), [CATEGORY_DEFAULTS.idTwo]);
});

test('role_categories_ids computed returns a flat list of ids for each category', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne});
    store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, category_fk: CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(role.get('categories').get('length'), 2);
    assert.deepEqual(role.get('role_categories_ids'), [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]);
    role.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 1);
    assert.deepEqual(role.get('role_categories_ids'), [ROLE_CATEGORY_DEFAULTS.idTwo]);
});
