import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

var store, location_level_deserializer, subject;

module('unit: location deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        subject = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
    }
});

test('location deserializer returns correct data with already present location_level (list)', (assert) => {
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, number: '987', location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_unused = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeName, number: '988', location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.unusedId]});
    let json = [LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.idOne), LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    assert.deepEqual(location_level.get('locations'), [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.unusedId]);
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_unused.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(location_unused.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(store.find('location').get('length'), 2);
});

test('location deserializer returns correct data with no current location_level (list)', (assert) => {
    let json = [LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.unusedId)];
    let response = {'count':1,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('locations'), [LOCATION_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('location deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.idOne]});
    let json = LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.unusedId);
    subject.deserialize(json, LOCATION_DEFAULTS.unusedId);
    assert.deepEqual(location_level.get('locations'), [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.unusedId]);
    assert.ok(location_level.get('isNotDirty'));
    let loc = store.find('location', LOCATION_DEFAULTS.idOne);
    assert.equal(loc.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.equal(store.find('location', LOCATION_DEFAULTS.unusedId).get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
});

test('location deserializer returns correct data with no current location_level (detail)', (assert) => {
    let json = LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.unusedId);
    subject.deserialize(json, LOCATION_DEFAULTS.unusedId);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('locations'), [LOCATION_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LOCATION_DEFAULTS.unusedId).get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
});

test('location array in location level will not be duplicated and deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.idOne]});
    let json = LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.idOne);
    subject.deserialize(json, LOCATION_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('locations'), [LOCATION_DEFAULTS.idOne]);
    let loc = store.find('location', LOCATION_DEFAULTS.idOne);
    assert.equal(loc.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LOCATION_DEFAULTS.idOne).get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
});

test('location location level will correctly be deserialized when server returns location without a different location level (detail)', (assert) => {
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.idOne]});
    let json = LOCATION_FIXTURES.generate(LOCATION_DEFAULTS.idOne);
    json.location_level.id = LOCATION_LEVEL_DEFAULTS.idTwo;
    subject.deserialize(json, LOCATION_DEFAULTS.idOne);
    let original = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(original.get('locations'), []);
    let newLocationLevel = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.deepEqual(newLocationLevel.get('locations'), [LOCATION_DEFAULTS.idOne]);
    let loc = store.find('location', LOCATION_DEFAULTS.idOne);
    assert.ok(original.get('isNotDirty'));
    assert.ok(newLocationLevel.get('isNotDirty'));
    assert.ok(location.get('isNotDirty'));
});
