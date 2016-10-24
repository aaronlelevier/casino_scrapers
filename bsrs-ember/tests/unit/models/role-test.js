import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import RD from 'bsrs-ember/vendor/defaults/role';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CD from 'bsrs-ember/vendor/defaults/category';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import PD from 'bsrs-ember/vendor/defaults/person';

var store, role, run = Ember.run;

module('unit: role test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:role', 'model:category', 'model:location-level', 'model:role-category', 'model:uuid', 'service:i18n']);
  }
});

test('role is dirty or related is dirty when model has been updated', (assert) => {
  role = store.push('role', {id: RD.idOne, name: RD.nameOne, role_type: RD.roleTypeGeneral});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.set('name', 'abc');
  assert.ok(role.get('isDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.set('name', RD.nameOne);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.set('role_type', RD.roleTypeContractor);
  assert.ok(role.get('isDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.set('role_type', RD.roleTypeGeneral);
  assert.ok(role.get('isNotDirty'));
});

/*ROLE TO PEOPLE 1-2-Many*/
test('role can be related to one or many people', (assert) => {
  role = store.push('role', {id: RD.idOne, name: RD.nameOne, role_type: RD.roleTypeGeneral, people: []});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  let related = role.get('people');
  run(function() {
    store.push('role', {id: role.get('id'), people: related.concat(PD.id)});
  });
  assert.deepEqual(role.get('people'), [PD.id]);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('there is no leaky state when instantiating role (set)', (assert) => {
  let role_two;
  role = store.push('role', {id: RD.idOne, name: RD.nameOne, role_type: RD.roleTypeGeneral});
  store.push('role', {id: role.get('id'), people: [PD.id]});
  assert.deepEqual(role.get('people'), [PD.id]);
  run(function() {
    role_two = store.push('role', {id: RD.idTwo, name: RD.nameOne, role_type: RD.roleTypeGeneral});
  });
  assert.deepEqual(role_two.get('people'), []);
});

/*ROLE TO LOCATION LEVEL 1-to-Many RELATIONSHIP*/
test('related location level should return first location level or undefined', (assert) => {
  role = store.push('role', {id: RD.idOne});
  store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
  let location_level = role.get('location_level');
  assert.equal(location_level.get('name'), LLD.nameRegion);
  run(function() {
    store.push('location-level', {id: location_level.get('id'), roles: [RD.unused]});
  });
  assert.equal(role.get('location_level'), undefined);
});

test('related location level is not dirty when no location level present', (assert) => {
  store.push('location-level', {id: LLD.idOne, roles: [LLD.unusedId]});
  role = store.push('role', {id: RD.id});
  assert.ok(role.get('locationLevelIsNotDirty'));
  assert.equal(role.get('location_level'), undefined);
});

test('when role suddently has location level assigned to it, it is shown as dirty', (assert) => {
  role = store.push('role', {id: RD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, roles: undefined});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.change_location_level(location_level.get('id'));
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when role suddently has location level assigned to it starting with non empty array, it is shown as dirty', (assert) => {
  role = store.push('role', {id: RD.idOne});
  let location_level = store.push('location-level', {id: LLD.idOne, roles: [RD.unusedId]});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.change_location_level(location_level.get('id'));
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('rollback location level will reset the previously used location level when switching from valid location level to another', (assert) => {
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne});
  let location_level_one = store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
  let location_level_two = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, roles: [RD.unusedId]});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(role.get('location_level.name'), LLD.nameRegion);
  role.change_location_level();
  assert.equal(role.get('location_level.name'), undefined);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.change_location_level(location_level_two.get('id'));
  assert.equal(role.get('location_level.name'), LLD.nameDepartment);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.save();
  role.saveRelated();
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.change_location_level(location_level_one.get('id'));
  assert.equal(role.get('location_level.name'), LLD.nameRegion);
  assert.equal(role.get('location_level_fk'), LLD.idTwo);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  role.rollbackLocationLevel();
  assert.equal(role.get('location_level.name'), LLD.nameDepartment);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location level will reset the previously used location level when switching from valid location level to another location level', (assert) => {
  role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne});
  let location_level_one = store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
  let location_level_two = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, roles: [RD.unusedId]});
  let another_location_level = store.push('location-level', {id: LLD.idThree, name: LLD.nameDistrict, roles: [RD.unusedId]});
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(role.get('location_level.name'), LLD.nameRegion);
  role.change_location_level(location_level_two.get('id'));
  assert.equal(role.get('location_level.name'), LLD.nameDepartment);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.save();
  role.saveRelated();
  role.change_location_level(another_location_level.get('id'));
  assert.equal(role.get('location_level.name'), LLD.nameDistrict);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  role.rollbackLocationLevel();
  assert.equal(role.get('location_level.name'), LLD.nameDepartment);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.deepEqual(another_location_level.get('roles'), [RD.unusedId]);
  //changed location level dirty tracking on roles to non attr based
  assert.ok(another_location_level.get('isNotDirty'));
  assert.ok(location_level_two.get('isNotDirty'));
  assert.ok(location_level_one.get('isNotDirty'));
});

/*ROLE TO CATEGORY M2M*/
test('categories property only returns the single matching item even when multiple categories exist', (assert) => {
  store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
  const cat_two = {id: CD.idTwo};
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  role.add_category(cat_two);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idTwo);
});

test('categories property returns multiple matching items when multiple categories exist', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idTwo, role_pk: RD.idOne, category_pk: CD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 2);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(1).get('id'), CD.idTwo);
});

test('categories property will update when add category is invoked and add new m2m join model (starting w/ empty array)', (assert) => {
  role = store.push('role', {id: RD.idOne, role_categories_fks: []});
  const category = {id: CD.idOne};
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.add_category(category);
  assert.equal(role.get('categories').get('length'), 1);
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when add category is invoked and add new m2m join model', (assert) => {
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  store.push('category', {id: CD.idOne});
  const category_two = {id: CD.idTwo};
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.add_category(category_two);
  assert.equal(role.get('categories').get('length'), 2);
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(role.get('categories').objectAt(1).get('id'), CD.idTwo);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly removes the category', (assert) => {
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  store.push('category', {id: CD.idOne});
  assert.equal(role.get('categories').get('length'), 1);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.remove_category(CD.idTwo);
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('add_category will add back old join model after it was removed and dirty the model (multiple)', (assert) => {
  const role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  store.push('category', {id: CD.idTwo});
  const category_three = store.push('category', {id: CD.idThree});
  store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idTwo, role_pk: RD.idOne, category_pk: CD.idThree});
  role.remove_category(category_three.get('id'));
  assert.equal(role.get('categories').get('length'), 1);
  const category_three_json = {id: CD.idThree};
  role.add_category(category_three_json);
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
});

test('when categories is changed dirty tracking works as expected (removing)', (assert) => {
  store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('when categories is changed dirty tracking works as expected (replacing)', (assert) => {
  store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne});
  const category_two = {id: CD.idTwo};
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  role.remove_category(CD.idOne);
  assert.ok(role.get('categoriesIsDirty'));
  assert.equal(role.get('categories').get('length'), 0);
  role.add_category(category_two);
  assert.ok(role.get('categoriesIsDirty'));
  assert.equal(role.get('categories').get('length'), 1);
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idTwo);
  role.rollback();
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idOne);
  role.remove_category(CD.idOne);
  role.add_category(category_two);
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idOne);
});

test('rollback role will reset the previously used people (categories) when switching from valid categories array to nothing', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.remove_category(CD.idTwo);
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.remove_category(CD.idTwo);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.rollback();
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(role.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(role.get('categories').objectAt(1).get('id'), CD.idTwo);
});

test('rollback categories will reset the previous people (categories) when switching from one category to another and saving in between each step', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  const unused = {id: CD.unusedId};
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  assert.equal(role.get('categories').get('length'), 2);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.save();
  role.saveRelated();
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.add_category(unused);
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
  role.save();
  role.saveRelated();
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  assert.equal(role.get('categories').get('length'), 2);
  assert.deepEqual(role.get('categories_ids'), [CD.idOne, CD.idTwo]);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 1);
  assert.deepEqual(role.get('categories_ids'), [CD.idTwo]);
});

test('role_categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
  role = store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  assert.equal(role.get('categories').get('length'), 2);
  assert.deepEqual(role.get('role_categories_ids'), [ROLE_CD.idOne, ROLE_CD.idTwo]);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 1);
  assert.deepEqual(role.get('role_categories_ids'), [ROLE_CD.idTwo]);
});

test('serialize', (assert) => {
  store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
  store.push('category', {id: CD.idOne});
  store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
  role = store.push('role',{id: RD.idOne, name: RD.nameOne, role_type: RD.roleTypeGeneral, auth_amount: CURRENCY_DEFAULTS.authAmountOne, auth_currency: CURRENCY_DEFAULTS.id, dashboard_text: RD.dashboard_text});
  var serialize = role.serialize();
  assert.equal(serialize.id, role.get('id'));
  assert.equal(serialize.name, role.get('name'));
  assert.equal(serialize.role_type, role.get('role_type'));
  assert.equal(serialize.location_level, role.get('location_level.id'));
  assert.equal(serialize.categories, role.get('categories_ids'));
  assert.equal(serialize.auth_amount, role.get('auth_amount'));
  assert.equal(serialize.auth_currency, role.get('auth_currency'));
  assert.equal(serialize.dashboard_text, role.get('dashboard_text'));
});
