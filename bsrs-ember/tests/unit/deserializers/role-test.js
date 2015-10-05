import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import RoleDeserializer from 'bsrs-ember/deserializers/role';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store;

module('unit: role deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:location-level', 'model:category']);
    }
});

test('category and location level will not be deserialized into its own store when deserialize list is invoked', (assert) => {
    let subject = RoleDeserializer.create({store: store});
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
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.unusedId);
    subject.deserialize(response, ROLE_DEFAULTS.unusedId);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    let category = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(role.get('category_fks'), []);
    let role_two = store.find('role', ROLE_DEFAULTS.unusedId);
    assert.deepEqual(role_two.get('category_fks'), [CATEGORY_DEFAULTS.idOne]);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(category.get('isNotDirty'));
});

test('role location level will not be duplicated and correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.ok(original.get('isNotDirty'));
});

test('role location level will correctly be deserialized when server returns role without a location_level (single)', (assert) => {
    let subject = RoleDeserializer.create({store: store});
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
    let subject = RoleDeserializer.create({store: store});
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
    let subject = RoleDeserializer.create({store: store});
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
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, category_fks: [CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    assert.equal(role.get('categories').get('length'), 1);
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('category_fks'), [CATEGORY_DEFAULTS.idOne]);
    response.categories = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    assert.equal(role.get('categories').get('length'), 0);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('category_fks'), []);
    assert.equal(role.get('categories').get('length'), 0);
});

test('role category will correctly be deserialized when server returns role without a location_level and without one of two categories (single)', (assert) => {
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, category_fks: [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.unusedId]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let category_unused = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameTwo});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('category_fks'), [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.unusedId]);
    assert.equal(role.get('categories').get('length'), 2);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('category_fks'), [CATEGORY_DEFAULTS.idOne]);
    assert.equal(role.get('categories').get('length'), 1);
});

test('role category will correctly be deserialized when server returns role without a location_level and with an extra category (single)', (assert) => {
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, category_fks: [CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    assert.deepEqual(role.get('category_fks'), [CATEGORY_DEFAULTS.idOne]);
    assert.equal(role.get('categories').get('length'), 1);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('category_fks'), [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.unusedId]);
    assert.equal(role.get('categories').get('length'), 2);
});

test('role category will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    let subject = RoleDeserializer.create({store: store});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, category_fks: [CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.ok(role.get('isNotDirty'));
});
