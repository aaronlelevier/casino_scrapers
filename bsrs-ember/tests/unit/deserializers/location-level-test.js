import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

let container, store, registry;

module('sco unit: location level deserializer test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location-level']);
    },
    afterEach() {
        store = null;
        container = null;
        registry = null;
    }
});

test('location level correctly deserialized the children with no children currently in store (list)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [LOCATION_LEVEL_DEFAULTS.idTwo];
    let json = [loc_level_one, LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo, LOCATION_LEVEL_DEFAULTS.nameDepartment)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized the children with children currently in store (list)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children: [LOCATION_LEVEL_DEFAULTS.idTwo] });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [LOCATION_LEVEL_DEFAULTS.idTwo];
    let json = [loc_level_one, LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo, LOCATION_LEVEL_DEFAULTS.nameDepartment)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    delete location_level.children;
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized the children with children not currently in store (list)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [LOCATION_LEVEL_DEFAULTS.idTwo];
    let json = [loc_level_one, LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo, LOCATION_LEVEL_DEFAULTS.nameDepartment)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    delete location_level.children;
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized if has children and new one comes in the store w/ children already present (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children_fks: [LOCATION_LEVEL_DEFAULTS.idTwo] });
    let location_level_two = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment });
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    json.children = [LOCATION_LEVEL_DEFAULTS.idTwo];
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized if has no children and new one comes in the store w/ children (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let location_level_two = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict });
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    json.children = [LOCATION_LEVEL_DEFAULTS.idTwo];
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized if has no children and new one comes in the store w/ no children (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let location_level_two = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children.length'), 0);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized if has no children and store location level already has children (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children_fks: [LOCATION_LEVEL_DEFAULTS.idTwo] });
    let location_level_two = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict });
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children.length'), 0);
    assert.equal(location_level_two.get('children.length'), 0);
});

test('location level updates children_fks array when new location level is pushed into store', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children_fks: [LOCATION_LEVEL_DEFAULTS.idTwo] });
    let location_level_two = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict });
    let location_level_three = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.unusedId, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children.length'), 1);
    json.children = [LOCATION_LEVEL_DEFAULTS.idTwo, LOCATION_LEVEL_DEFAULTS.unusedId];
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_level.get('children').get('length'), 2);
    assert.equal(location_level.get('children').objectAt(0).get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level.get('children').objectAt(1).get('id'), LOCATION_LEVEL_DEFAULTS.unusedId);
    assert.equal(location_level_two.get('children.length'), 0);
});
