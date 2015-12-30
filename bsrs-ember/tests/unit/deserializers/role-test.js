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

let store, uuid, category_deserializer, subject, role, run = Ember.run;

module('unit: role deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:uuid', 'model:role', 'model:location-level', 'model:category', 'model:role-category', 'service:i18n']);
        category_deserializer = CategoryDeserializer.create({store: store});
        uuid = this.container.lookup('model:uuid');
        subject = RoleDeserializer.create({store: store, uuid: uuid, CategoryDeserializer: category_deserializer});
    }
});

test('category and location level will not be deserialized into its own store when deserialize list is invoked', (assert) => {
    let location_level, category;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    });
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.unusedId);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    run(function() {
        subject.deserialize(response);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    let role_two = store.find('role', ROLE_DEFAULTS.unusedId);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(category.get('isNotDirty'));
});

test('location level and category will correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    let location_level;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    });
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.unusedId);
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.unusedId);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    let category = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), []);
    let role_two = store.find('role', ROLE_DEFAULTS.unusedId);
    assert.deepEqual(role_two.get('role_category_fks').length, 1);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(category.get('isNotDirty'));
    assert.equal(store.find('role-category').get('length'), 1);
    assert.equal(store.find('role-category').objectAt(0).get('category_fk'), CATEGORY_DEFAULTS.idOne);
    assert.equal(store.find('role-category').objectAt(0).get('role_fk'), ROLE_DEFAULTS.unusedId);
});

test('role location level will not be duplicated and correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    let location_level;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    });
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.ok(original.get('isNotDirty'));
});

test('role location level will correctly be deserialized when server returns role without a location_level (single)', (assert) => {
    let location_level;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    });
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized (with many roles) when server returns role without a location_level (single)', (assert) => {
    let location_level;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]});
    });
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    let location_level;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    });
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.location_level = undefined;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    run(function() {
        subject.deserialize(response);
    });
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
});

test('role category will correctly be deserialized when server returns role without a location_level and without a category (single)', (assert) => {
    let role_category, category;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
        role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    });
    assert.equal(role.get('categories').get('length'), 1);
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne]);
    response.categories = undefined;
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    assert.deepEqual(role.get('role_category_fks'), []);
    assert.equal(role.get('categories').get('length'), 0);
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.equal(role_category.get('removed'), true);
    assert.equal(role.get('categories').get('length'), 0);
});

test('role category will correctly be deserialized when server returns role without a location_level and without one of two categories (single)', (assert) => {
    let role_category, role_category_two, category, category_unused;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]});
        role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
        role_category_two = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idTwo, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.unusedId});
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
        category_unused = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameTwo});
    });
    let response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne, ROLE_CATEGORY_DEFAULTS.idTwo]);
    assert.equal(role.get('categories').get('length'), 2);
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne]);
    assert.equal(role_category_two.get('removed'), true);
    assert.equal(role_category.get('removed'), undefined);
    assert.equal(role.get('categories').get('length'), 1);
});

test('role category will correctly be deserialized when server returns role without a location_level and with an extra category (single)', (assert) => {
    let role_category, category, response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, role_category_fks: [ROLE_CATEGORY_DEFAULTS.idOne]});
        role_category = store.push('role-category', {id: ROLE_CATEGORY_DEFAULTS.idOne, role_fk: ROLE_DEFAULTS.idOne, category_fk: CATEGORY_DEFAULTS.idOne});
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    });
    response.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    assert.deepEqual(role.get('role_category_fks'), [ROLE_CATEGORY_DEFAULTS.idOne]);
    assert.equal(role.get('categories').get('length'), 1);
    run(function() {
        subject.deserialize(response, ROLE_DEFAULTS.idOne);
    });
    let original = store.find('category', CATEGORY_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.deepEqual(role.get('role_category_fks').length, 2);
    assert.equal(role.get('categories').get('length'), 2);
});

test('role category will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    let category;
    run(function() {
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne});
        category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne});
    });
    let json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.categories.push(CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId));
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    run(function() {
        subject.deserialize(response);
    });
    assert.ok(role.get('isNotDirty'));
});
