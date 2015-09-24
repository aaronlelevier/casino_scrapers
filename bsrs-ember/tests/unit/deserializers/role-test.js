import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import RoleDeserializer from 'bsrs-ember/deserializers/role';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

module('unit: role deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:location-level']);
    }
});

test('location level will not be deserialized into its own store when deserialize list is invoked', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    var json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.unusedId);
    var response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('location level will correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    var response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.unusedId);
    subject.deserialize(response, ROLE_DEFAULTS.unusedId);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('role location level will not be duplicated and correctly be deserialized into its own store with a foreign key on role (single)', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    var response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.ok(original.get('isNotDirty'));
});

test('role location level will correctly be deserialized when server returns role without a location_level (single)', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    var response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized (with many roles) when server returns role without a location_level (single)', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.unusedId]});
    var response = ROLE_FIXTURES.generate(ROLE_DEFAULTS.idOne);
    response.location_level = undefined;
    subject.deserialize(response, ROLE_DEFAULTS.idOne);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), [ROLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), undefined);
});

test('role location level will correctly be deserialized when server returns role without a location_level (list)', (assert) => {
    var subject = RoleDeserializer.create({store: store});
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    var json = ROLE_FIXTURES.generate_single_for_list(ROLE_DEFAULTS.idOne);
    json.location_level = undefined;
    var response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    var original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('roles'), []);
    assert.ok(original.get('isNotDirty'));
    assert.ok(role.get('isNotDirty'));
});
