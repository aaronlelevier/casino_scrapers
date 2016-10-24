import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import ROLE_CD from 'bsrs-ember/vendor/defaults/role-category';
import RD from 'bsrs-ember/vendor/defaults/role';
import RF from 'bsrs-ember/vendor/role_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import RoleDeserializer from 'bsrs-ember/deserializers/role';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, uuid, category_deserializer, subject, role, run = Ember.run;

module('unit: role deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:uuid', 'model:role', 'model:role-list', 'model:location-level', 'model:category', 'model:role-category', 'service:i18n']);
    category_deserializer = CategoryDeserializer.create({
      simpleStore: store
    });
    uuid = this.container.lookup('model:uuid');
    subject = RoleDeserializer.create({
      simpleStore: store,
      uuid: uuid,
      CategoryDeserializer: category_deserializer
    });
  }
});

test('category and location level will not be deserialized into its own store when deserialize list is invoked', (assert) => {
  role = store.push('role-list', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne]
  });
   store.push('category', {
    id: CD.idOne,
    name: CD.nameOne
  });
  let json = RF.generate_list(RD.unusedId);
  let response = {
    'count': 1,
    'next': null,
    'previous': null,
    'results': [json]
  };
  run(() => {
    subject.deserialize(response);
  });
  let role_two = store.find('role-list', RD.unusedId);
  assert.equal(role_two.get('id'), RD.unusedId);
});

test('location level and category will correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
  role = store.push('role', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  assert.ok(role.get('categoriesIsNotDirty'));
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne]
  });
  let response = RF.generate(RD.unusedId);
  run(() => {
    subject.deserialize(response, RD.unusedId);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('roles'), [RD.idOne, RD.unusedId]);
  assert.ok(original.get('isNotDirty'));
  let category = store.find('category', CD.idOne);
  assert.deepEqual(role.get('role_categories_fks'), []);
  let role_two = store.find('role', RD.unusedId);
  assert.deepEqual(role_two.get('role_categories_fks').length, 1);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role_two.get('isNotDirty'));
  assert.ok(category.get('isNotDirty'));
  assert.equal(store.find('role-category').get('length'), 1);
  assert.equal(store.find('role-category').objectAt(0).get('category_pk'), CD.idOne);
  assert.equal(store.find('role-category').objectAt(0).get('role_pk'), RD.unusedId);
});

test('role location level will not be duplicated and correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
  role = store.push('role', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne]
  });
  let response = RF.generate(RD.idOne);
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('roles'), [RD.idOne]);
  assert.ok(original.get('isNotDirty'));
});

test('role location level will correctly be deserialized when server returns role without a location_level (single)', (assert) => {
  role = store.push('role', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne]
  });
  let response = RF.generate(RD.idOne);
  delete response.location_level;
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('roles'), []);
  assert.ok(original.get('isNotDirty'));
  assert.ok(role.get('isNotDirty'));
  assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized (with many roles) when server returns role without a location_level (single)', (assert) => {
  role = store.push('role', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne, RD.unusedId]
  });
  let response = RF.generate(RD.idOne);
  delete response.location_level;
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('roles'), [RD.unusedId]);
  assert.ok(original.get('isNotDirty'));
  assert.ok(role.get('isNotDirty'));
  assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
  role = store.push('role-list', {
    id: RD.idOne,
    location_level_fk: LLD.idOne
  });
  store.push('location-level', {
    id: LLD.idOne,
    name: LLD.nameCompany,
    roles: [RD.idOne]
  });
  let json = RF.generate_list(RD.idOne);
  json.location_level = undefined;
  let response = {
    'count': 1,
    'next': null,
    'previous': null,
    'results': [json]
  };
  run(() => {
    subject.deserialize(response);
  });
  let original = store.find('location-level', LLD.idOne);
  assert.deepEqual(original.get('roles'), [RD.idOne]);
  assert.ok(original.get('isNotDirty'));
});

/*LL and CATEGORIES*/
test('role category will correctly be deserialized when server returns role without a location_level and without a category (single)', (assert) => {
  let role_category;
  role = store.push('role', {
    id: RD.idOne,
    name: RD.nameOne,
    role_categories_fks: [ROLE_CD.idOne]
  });
  role_category = store.push('role-category', {
    id: ROLE_CD.idOne,
    role_pk: RD.idOne,
    category_pk: CD.idOne
  });
  store.push('category', {
    id: CD.idOne,
    name: CD.nameOne
  });
  assert.equal(role.get('categories').get('length'), 1);
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  let response = RF.generate(RD.idOne);
  assert.deepEqual(role.get('role_categories_fks'), [ROLE_CD.idOne]);
  response.categories = undefined;
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  assert.deepEqual(role.get('role_categories_fks'), []);
  assert.equal(role.get('categories').get('length'), 0);
  store.find('category', CD.idOne);
  assert.ok(role.get('isNotDirty'));
  assert.equal(role_category.get('removed'), true);
  assert.equal(role.get('categories').get('length'), 0);
});

test('role category will correctly be deserialized when server returns role without a location_level and without one of two categories (single)', (assert) => {
  let role_category, role_category_two;
  role = store.push('role', {
    id: RD.idOne,
    name: RD.nameOne,
    role_categories_fks: [ROLE_CD.idOne, ROLE_CD.idTwo]
  });
  role_category = store.push('role-category', {
    id: ROLE_CD.idOne,
    role_pk: RD.idOne,
    category_pk: CD.idOne
  });
  role_category_two = store.push('role-category', {
    id: ROLE_CD.idTwo,
    role_pk: RD.idOne,
    category_pk: CD.unusedId
  });
  store.push('category', {
    id: CD.idOne,
    name: CD.nameOne
  });
  store.push('category', {
    id: CD.unusedId,
    name: CD.nameTwo
  });
  let response = RF.generate(RD.idOne);
  assert.deepEqual(role.get('role_categories_fks'), [ROLE_CD.idOne, ROLE_CD.idTwo]);
  assert.equal(role.get('categories').get('length'), 2);
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  store.find('category', CD.idOne);
  assert.ok(role.get('isNotDirty'));
  assert.deepEqual(role.get('role_categories_fks'), [ROLE_CD.idOne]);
  assert.equal(role_category_two.get('removed'), true);
  assert.equal(role_category.get('removed'), undefined);
  assert.equal(role.get('categories').get('length'), 1);
});

test('role category will correctly be deserialized when server returns role without a location_level and with an extra category (single)', (assert) => {
  let response = RF.generate(RD.idOne);
  role = store.push('role', {
    id: RD.idOne,
    name: RD.nameOne,
    role_categories_fks: [ROLE_CD.idOne]
  });
  store.push('role-category', {
    id: ROLE_CD.idOne,
    role_pk: RD.idOne,
    category_pk: CD.idOne
  });
  store.push('category', {
    id: CD.idOne,
    name: CD.nameOne
  });
  response.categories.push(CF.generate_for_power_select(CD.unusedId));
  assert.deepEqual(role.get('role_categories_fks'), [ROLE_CD.idOne]);
  assert.equal(role.get('categories').get('length'), 1);
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  store.find('category', CD.idOne);
  assert.ok(role.get('isNotDirty'));
  assert.deepEqual(role.get('role_categories_fks').length, 2);
  assert.equal(role.get('categories').get('length'), 2);
});

/*ROLE CATEGORY M2M*/
test('role-category m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  run(() => {
    store.push('location-level', {
      id: LLD.idOne,
      name: LLD.nameCompany,
      roles: [RD.idOne]
    });
    role = store.push('role', {
      id: RD.idOne,
      location_level_fk: LLD.idOne
    });
  });
  let response = RF.generate(RD.idOne);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 0);
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(role.get('categoriesIsNotDirty'));
  assert.ok(role.get('locationLevelIsNotDirty'));
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  let original = store.find('role', RD.idOne);
  categories = original.get('categories');
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
  assert.equal(store.find('role-category').get('length'), 1);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('role-category m2m is set up correctly using deserialize single (starting with a m2m relationship)', (assert) => {
  run(() => {
    store.push('location-level', {
      id: LLD.idOne,
      name: LLD.nameCompany,
      roles: [RD.idOne]
    });
    role = store.push('role', {
      id: RD.idOne,
      location_level_fk: LLD.idOne
    });
    store.push('category', {
      id: CD.idTwo,
      name: CD.nameTwo
    });
  });
  role.set('role_categories_fks', [ROLE_CD.idOne]);
  role.save();
  store.push('role-category', {
    id: ROLE_CD.idOne,
    role_pk: RD.idOne,
    category_pk: CD.idTwo
  });
  assert.equal(role.get('categories').get('length'), 1);
  let response = RF.generate(RD.idOne);
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  role = store.find('role', RD.idOne);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('role-category').get('length'), 2);
});

test('role-category m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
  run(() => {
    store.push('location-level', {
      id: LLD.idOne,
      name: LLD.nameCompany,
      roles: [RD.idOne]
    });
    role = store.push('role', {
      id: RD.idOne,
      location_level_fk: LLD.idOne
    });
  });
  let response = RF.generate(RD.idOne);
  delete response.categories[0];
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  role = store.find('role', RD.idOne);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 0);
  assert.equal(categories.objectAt(0), undefined);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('role-category').get('length'), 0);
});

test('role-category m2m does not delete other role-category m2m models', (assert) => {
  let  role_two;
  run(() => {
    store.push('location-level', {
      id: LLD.idOne,
      name: LLD.nameCompany,
      roles: [RD.idOne]
    });
    role = store.push('role', {
      id: RD.idOne,
      location_level_fk: LLD.idOne
    });
    role_two = store.push('role', {
      id: RD.idTwo,
      location_level_fk: LLD.idOne
    });
    store.push('category', {
      id: CD.idTwo,
      name: CD.nameTwo
    });
    store.push('role-category', {
      id: ROLE_CD.idOne,
      role_pk: RD.idOne,
      category_pk: CD.idTwo
    });
    store.push('role-category', {
      id: ROLE_CD.idTwo,
      role_pk: RD.idTwo,
      category_pk: CD.idTwo
    });
  });
  role.set('role_categories_fks', [ROLE_CD.idOne]);
  role.save();
  assert.equal(role.get('categories').get('length'), 1);
  let response = RF.generate(RD.idOne);
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  role = store.find('role', RD.idOne);
  let categories = role.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.ok(role.get('isNotDirty'));
  assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('role-category').get('length'), 3);
  assert.equal(role_two.get('role_categories').get('length'), 1);
});

test('auth_amount', assert => {
  let response = RF.generate(RD.idOne);
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  role = store.find('role', RD.idOne);
  assert.equal(role.get('auth_amount'), CURRENCY_DEFAULTS.authAmountOne);
});

test('inherited copySettingsToFirstLevel', (assert) => {
  let response = RF.generate(RD.idOne);
  assert.equal(response.auth_currency, undefined);
  assert.equal(response.dashboard_text, undefined);
  run(() => {
    subject.deserialize(response, RD.idOne);
  });
  role = store.find('role', RD.idOne);
  assert.equal(role.get('dashboard_text'), null);
  assert.equal(role.get('auth_currency'), null);
  // inherited
  assert.deepEqual(role.get('inherited').dashboard_text, RD.inherited.dashboard_text);
  assert.deepEqual(role.get('inherited').auth_currency, RD.inherited.auth_currency);
});
