import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import ROLE_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/role-category';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import RoleDeserializer from 'bsrs-ember/deserializers/role';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import random from 'bsrs-ember/models/random';

let store, uuid, category_deserializer, subject;

module('unit: role deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:uuid', 'model:role', 'model:location-level', 'model:category', 'model:role-category']);
        category_deserializer = CategoryDeserializer.create({store: store});
        uuid = this.container.lookup('model:uuid');
        subject = RoleDeserializer.create({store: store, uuid: uuid, CategoryDeserializer: category_deserializer});
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
    }
});

test('category and location level will not be deserialized into its own store when deserialize list is invoked', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.unusedId);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    let role_two = store.find('role', ROLE_DEFAULTS.unusedId);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(category.get('isNotDirty'));
});

test('location level and category will correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.unusedId);
    subject.deserialize(response, ROLE_DEFAULTS.unusedId);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    let category = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), []);
    let role_two = store.find('role', ROLE_DEFAULTS.unusedId);
    assert.deepEqual(role_two.get('role_category_fks'), ['abc123']);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(category.get('isNotDirty'));
    assert.equal(store.find('role-category').get('length'), 1);
    assert.equal(store.find('role-category').objectAt(0).get('category_fk'), CATEGORY_DEFAULTS.idOne);
    assert.equal(store.find('role-category').objectAt(0).get('role_fk'), ROLE_DEFAULTS.unusedId);
});

test('role location level will not be duplicated and correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.ok(original.get('isNotDirty'));
});

test('role location level will correctly be deserialized when server returns role without a location_level (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized (with many roles) when server returns role without a location_level (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.location_level = undefined;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
});

test('role category will correctly be deserialized when server returns role without a location_level and without a category (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [CATEGORY_DEFAULTS.idOne]});
    let role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    assert.equal(role.get('categories').get('length'), 1);
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), [CATEGORY_DEFAULTS.idOne]);
    response.categories = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), []);
    assert.equal(role.get('categories').get('length'), 0);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.equal(role_category.get('removed'), true);
    assert.equal(role.get('categories').get('length'), 0);
});

test('role category will correctly be deserialized when server returns role without a location_level and without one of two categories (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
    let role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    let role_category_two = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.unusedId});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let category_unused = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameTwo});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]);
    assert.equal(role.get('categories').get('length'), 2);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne]);
    assert.equal(role_category_two.get('removed'), true);
    assert.equal(role_category.get('removed'), undefined);
    assert.equal(role.get('categories').get('length'), 1);
});

test('role category will correctly be deserialized when server returns role without a location_level and with an extra category (single)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
    let role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne]);
    assert.equal(role.get('categories').get('length'), 1);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.abc, ROLE_CATEGORY_DEFAULTS.idOne]);
    assert.equal(role.get('categories').get('length'), 2);
});

test('role category will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.ok(role.get('isNotDirty'));
});
