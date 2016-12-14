import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import RD from 'bsrs-ember/vendor/defaults/role';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import CD from 'bsrs-ember/vendor/defaults/category';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import { RESOURCES_WITH_PERMISSION, PERMISSION_PREFIXES } from 'bsrs-ember/utilities/constants';
import { eachPermission } from 'bsrs-ember/utilities/permissions';

const PD = PERSON_DEFAULTS.defaults();

let role;

moduleFor('model:role', 'Unit | Model | role', {
  needs: ['model:category', 'model:location-level', 'model:role-category', 'model:uuid', 'service:i18n', 'validator:presence'],
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    this.factory = this.container.lookupFactory('model:role');
  },
  afterEach() {
    delete this.factory;
    this.store = null;
    role = null;
  }
});

test('role is dirty or related is dirty when model has been updated', function(assert) {
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  role.name = RD.nameOne;
  run(() => {
    role = this.store.push('role', role);
  });
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
test('role can be related to one or many people', function(assert) {
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  role.name = RD.nameOne;
  role.people = [];
  run(() => {
    role = this.store.push('role', role);
  });
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  let related = role.get('people');
  run(() => {
    this.store.push('role', {id: role.get('id'), people: related.concat(PD.id)});
  });
  assert.deepEqual(role.get('people'), [PD.id]);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
});

test('there is no leaky state when instantiating role (set)', function(assert) {
  let role_two;
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  role.name = RD.nameOne;
  run(() => {
    role = this.store.push('role', role);
  });
  role = this.factory.getDefaults(role.get('id'), RD.roleTypeGeneral);
  role.people = [PD.id];
  run(() => {
    role = this.store.push('role', role);
  });
  assert.deepEqual(role.get('people'), [PD.id]);
  run(() => {
    role_two = this.factory.getDefaults(RD.idTwo, RD.roleTypeGeneral);
    role_two.name = RD.nameOne;
    role_two = this.store.push('role', role_two);
  });
  assert.deepEqual(role_two.get('people'), []);
});

/*ROLE TO LOCATION LEVEL 1-to-Many RELATIONSHIP*/
test('related location level should return first location level or undefined', function(assert) {
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  role.name = RD.nameOne;
  run(() => {
    role = this.store.push('role', role);
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
  });
  let location_level = role.get('location_level');
  assert.equal(location_level.get('name'), LLD.nameRegion);
  run(() => {
    this.store.push('location-level', {id: location_level.get('id'), roles: [RD.unused]});
  });
  assert.equal(role.get('location_level'), undefined);
});

test('related location level is not dirty when no location level present', function(assert) {
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, roles: [LLD.unusedId]});
    role = this.store.push('role', this.factory.getDefaults(RD.id));
  });
  assert.ok(role.get('locationLevelIsNotDirty'));
  assert.equal(role.get('location_level'), undefined);
});

test('when role suddenly has location level assigned to it, it is shown as dirty', function(assert) {
  let location_level;
  run(() => {
    role = this.store.push('role', this.factory.getDefaults(RD.idOne));
    location_level = this.store.push('location-level', {id: LLD.idOne, roles: undefined});
  });
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.change_location_level(location_level.get('id'));
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when role suddently has location level assigned to it starting with non empty array, it is shown as dirty', function(assert) {
  let location_level;
  run(() => {
    role = this.store.push('role', this.factory.getDefaults(RD.idOne));
    location_level = this.store.push('location-level', {id: LLD.idOne, roles: [RD.unusedId]});
  });
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.change_location_level(location_level.get('id'));
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('rollback location level will reset the previously used location level when switching from valid location level to another', function(assert) {
  role = this.factory.getDefaults(RD.idOne);
  role.location_level_fk = LLD.idOne;
  let location_level_one, location_level_two;
  run(() => {
    role = this.store.push('role', role);
    location_level_one = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
    location_level_two = this.store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, roles: [RD.unusedId]});
  });
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

test('rollback location level will reset the previously used location level when switching from valid location level to another location level', function(assert) {
  role = this.factory.getDefaults(RD.idOne);
  role.location_level_fk = LLD.idOne;
  let location_level_one, location_level_two, another_location_level;
  run(() => {
    role = this.store.push('role', role);
    location_level_one = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
    location_level_two = this.store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, roles: [RD.unusedId]});
    another_location_level = this.store.push('location-level', {id: LLD.idThree, name: LLD.nameDistrict, roles: [RD.unusedId]});
  });
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
test('categories property only returns the single matching item even when multiple categories exist', function(assert) {
  role = this.factory.getDefaults(RD.idOne);
  role.location_level_fk = LLD.idOne;
  run(() => {
    role = this.store.push('role', role);
    this.store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
  });
  const cat_two = {id: CD.idTwo};
  run(() => {
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  });
  role.add_category(cat_two);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idTwo);
});

test('categories property returns multiple matching items when multiple categories exist', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idTwo, role_pk: RD.idOne, category_pk: CD.idOne});
  });
  role = this.factory.getDefaults(RD.idOne);
  role.role_categories_fks = [ROLE_CD.idOne, ROLE_CD.idTwo];
  run(() => {
    role = this.store.push('role', role);
  });
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 2);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(1).get('id'), CD.idTwo);
});

test('categories property will update when add category is invoked and add new m2m join model (starting w/ empty array)', function(assert) {
  role = this.factory.getDefaults(RD.idOne);
  role.role_categories_fks = [];
  run(() => {
    role = this.store.push('role', role);
  });
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

test('categories property will update when add category is invoked and add new m2m join model', function(assert) {
  run(() => {
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
    this.store.push('category', {id: CD.idOne});
  });
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

test('categories property will update when the m2m array suddenly removes the category', function(assert) {
  run(() => {
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
    this.store.push('category', {id: CD.idOne});
  });
  assert.equal(role.get('categories').get('length'), 1);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 0);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  });
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  role.remove_category(CD.idTwo);
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('categoriesIsDirty'));
  assert.ok(role.get('isDirtyOrRelatedDirty'));
});

test('add_category will add back old join model after it was removed and dirty the model (multiple)', function(assert) {
  let category_three;
  run(() => {
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
    this.store.push('category', {id: CD.idTwo});
    category_three = this.store.push('category', {id: CD.idThree});
    this.store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idTwo, role_pk: RD.idOne, category_pk: CD.idThree});
  });
  role.remove_category(category_three.get('id'));
  assert.equal(role.get('categories').get('length'), 1);
  const category_three_json = {id: CD.idThree};
  role.add_category(category_three_json);
  assert.equal(role.get('categories').get('length'), 2);
  assert.ok(role.get('categoriesIsNotDirty'));
});

test('when categories is changed dirty tracking works as expected (removing)', function(assert) {
  run(() => {
    this.store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idOne});
    this.store.push('category', {id: CD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  });
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

test('when categories is changed dirty tracking works as expected (replacing)', function(assert) {
  let category_two;
  run(() => {
    this.store.push('role-category', {id: ROLE_CD.idOne, role_pk: RD.idOne, category_pk: CD.idOne});
    this.store.push('category', {id: CD.idOne});
    category_two = {id: CD.idTwo};
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne]});
  });
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

test('rollback role will reset the previously used people (categories) when switching from valid categories array to nothing', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  });
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

test('rollback categories will reset the previous people (categories) when switching from one category to another and saving in between each step', function(assert) {
  let unused;
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    unused = {id: CD.unusedId};
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  });
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

test('categories_ids computed returns a flat list of ids for each category', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  });
  assert.equal(role.get('categories').get('length'), 2);
  assert.deepEqual(role.get('categories_ids'), [CD.idOne, CD.idTwo]);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 1);
  assert.deepEqual(role.get('categories_ids'), [CD.idTwo]);
});

test('role_categories_ids computed returns a flat list of ids for each category', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idOne});
    this.store.push('category', {id: CD.idTwo});
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idTwo, category_pk: CD.idTwo, role_pk: RD.idOne});
    role = this.store.push('role', {id: RD.idOne, role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]});
  });
  assert.equal(role.get('categories').get('length'), 2);
  assert.deepEqual(role.get('role_categories_ids'), [ROLE_CD.idOne, ROLE_CD.idTwo]);
  role.remove_category(CD.idOne);
  assert.equal(role.get('categories').get('length'), 1);
  assert.deepEqual(role.get('role_categories_ids'), [ROLE_CD.idTwo]);
});

test('serialize', function(assert) {
  run(() => {
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion, roles: [RD.idOne]});
    this.store.push('category', {id: CD.idOne});
    this.store.push('role-category', {id: ROLE_CD.idOne, category_pk: CD.idOne, role_pk: RD.idOne});
    role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
    role = this.store.push('role', Object.assign(role, {
      name: RD.nameOne,
      auth_amount: CURRENCY_DEFAULTS.authAmountOne,
      auth_currency: CURRENCY_DEFAULTS.id,
      dashboard_text: RD.dashboard_text
    }));
  });
  var serialize = role.serialize();
  assert.equal(serialize.id, role.get('id'));
  assert.equal(serialize.name, role.get('name'));
  assert.equal(serialize.role_type, role.get('role_type'));
  assert.equal(serialize.location_level, role.get('location_level.id'));
  assert.equal(serialize.categories, role.get('categories_ids'));
  assert.equal(serialize.auth_amount, role.get('auth_amount'));
  assert.equal(serialize.auth_currency, role.get('auth_currency'));
  assert.equal(serialize.dashboard_text, role.get('dashboard_text'));

  assert.ok(typeof serialize.permissions === 'object', 'permissions is an object');
  assert.deepEqual(serialize.permissions, role.permissions(), 'permissions are grouped in an object');
  eachPermission(function(resource, prefix) {
    let key = `${prefix}_${resource}`;
    let prop = `permissions_${key}`;
    assert.equal(serialize.permissions[key], role.get(prop), `serialize.permissions.${key} equals role prop: ${prop}`);
  });
});

test('has default permissions to create, edit and view resources', function(assert) {
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  run(() => {
    role = this.store.push('role', Object.assign(role, { name: RD.nameOne }));
  });
  eachPermission(function(resource, prefix) {
    let perm = role.get(`permissions_${prefix}_${resource}`);
    if (prefix === 'delete') {
      assert.equal(perm, false, `cannot delete ${resource}`);
    } else {
      assert.equal(perm, true, `can ${prefix} ${resource}`);
    }
  });
});

test('can track dirty properties for permissions', function(assert) {
  role = this.factory.getDefaults(RD.idOne, RD.roleTypeGeneral);
  run(() => {
    role = this.store.push('role', Object.assign(role, { name: RD.nameOne }));
  });
  eachPermission(function(resource, prefix) {
    let key = `permissions_${prefix}_${resource}`;
    let perm = role.get(key);
    assert.equal(role.get('isNotDirty'), true, `${key} isNotDirty`);
    if (prefix === 'delete') {
      role.set(key, true);
      assert.equal(role.get('isDirty'), true, `${key} isDirty`);
      role.set(key, false);
    } else {
      role.set(key, false);
      assert.equal(role.get('isDirty'), true, `${key} isDirty`);
      role.set(key, true);
    }
    assert.equal(role.get('isNotDirty'), true, `${key} isNotDirty`);
  });
});
