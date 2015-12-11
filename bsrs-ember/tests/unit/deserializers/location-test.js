import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

var store, location_level_deserializer, subject, location_status, location_status_two, location_level;

module('unit: location deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level', 'model:location-status']);
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        subject = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        location_status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
        location_status_two = store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
    }
});

test('location deserializer returns correct data with already present location_level (list)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let location_unused = store.push('location', {id: LD.unusedId, name: LD.storeName, number: '988', location_level_fk: LLD.idOne});
    location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne, LD.unusedId]});
    let json = [LF.generate(LD.idOne), LF.generate(LD.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(location_level.get('isNotDirty'));
    assert.ok(location.get('statusIsNotDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_unused.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level_fk'), LLD.idOne);
    assert.equal(location_unused.get('location_level_fk'), LLD.idOne);
    assert.equal(store.find('location').get('length'), 2);
});

test('location deserializer returns correct data with no current location_level (list)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = [LF.generate(LD.unusedId)];
    let response = {'count':1,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('location deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.unusedId);
    subject.deserialize(json, LD.unusedId);
    assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(location_level.get('isNotDirty'));
    let loc = store.find('location', LD.idOne);
    assert.equal(loc.get('location_level_fk'), LLD.idOne);
    assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location deserializer returns correct data with no current location_level (detail)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.unusedId);
    subject.deserialize(json, LD.unusedId);
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location array in location level will not be duplicated and deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    subject.deserialize(json, LD.idOne);
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne]);
    let loc = store.find('location', LD.idOne);
    assert.equal(loc.get('location_level_fk'), LLD.idOne);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LD.idOne).get('location_level.name'), LLD.nameCompany);
});

test('location location level will correctly be deserialized when server returns location without a different location level (detail)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, locations: []});
    let json = LF.generate(LD.idOne);
    json.location_level.id = LLD.idTwo;
    subject.deserialize(json, LD.idOne);
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), []);
    let newLocationLevel = store.find('location-level', LLD.idTwo);
    assert.deepEqual(newLocationLevel.get('locations'), [LD.idOne]);
    let loc = store.find('location', LD.idOne);
    assert.ok(original.get('isNotDirty'));
    assert.ok(newLocationLevel.get('isNotDirty'));
    assert.ok(location.get('isNotDirty'));
});

/* LOCATION TO STATUS */
test('location status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    // assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('statusIsNotDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    subject.deserialize(json, location.get('id'));
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns same status (list)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    delete json.cc;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns same status (single)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, location.get('id'));
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns different status (list)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    delete json.cc;
    json.status = LDS.closedId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(location_status.get('locations'), []);
    assert.deepEqual(location_status_two.get('locations'), [LD.idOne]);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('status_fk'), LDS.closedId);
});

test('newly inserted location will have non dirty status when deserialize list executes', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    store.clear('location');
    location_status.set('locations', []);
    let json = LF.generate(LD.idOne);
    delete json.cc;
    json.status = LDS.openId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.deepEqual(location_status_two.get('locations'), []);
    location = store.find('location', LD.idOne);
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('status_fk'), LDS.openId);
});

test('can push in location with location level as an object', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    subject.deserialize(json, LD.idOne);
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
});

test('can push in location with location level as an id', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    let json = LF.generate(LD.idOne);
    json.location_level = LLD.idOne;
    subject.deserialize(json, LD.idOne);
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
});
