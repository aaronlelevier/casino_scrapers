import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import ED from 'bsrs-ember/vendor/defaults/email';
import EF from 'bsrs-ember/vendor/email_fixtures';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import AND from 'bsrs-ember/vendor/defaults/address';
import ANF from 'bsrs-ember/vendor/address_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

var store, location_unused, location_level_deserializer, subject, location_status, location_status_two, location_level, run = Ember.run;

module('unit: location deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level', 'model:location-status', 'model:address', 'model:phonenumber', 'model:email', 'service:i18n']);
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        subject = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        run(function() {
            location_status = store.push('location-status', {id: LDS.openId, name: LDS.openName, locations: [LD.idOne]});
            location_status_two = store.push('location-status', {id: LDS.closedId, name: LDS.closedName, locations: []});
            location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
        });
    }
});

test('location deserializer returns correct data with already present location_level (list)', (assert) => {
    let location;
    let json = [LF.generate(LD.idOne), LF.generate(LD.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        location_unused = store.push('location', {id: LD.unusedId, name: LD.storeName, number: '988', location_level_fk: LLD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne, LD.unusedId]});
        subject.deserialize(response);
    });
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
    let location;
    let json = [LF.generate(LD.unusedId)];
    let response = {'count':1,'next':null,'previous':null,'results': json};
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(response);
    });
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('location deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location;
    let json = LF.generate(LD.unusedId);
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(json, LD.unusedId);
    });
    assert.deepEqual(location_level.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(location_level.get('isNotDirty'));
    let loc = store.find('location', LD.idOne);
    assert.equal(loc.get('location_level_fk'), LLD.idOne);
    assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location deserializer returns correct data with no current location_level (detail)', (assert) => {
    let location;
    let json = LF.generate(LD.unusedId);
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(json, LD.unusedId);
    });
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne, LD.unusedId]);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LD.unusedId).get('location_level.name'), LLD.nameCompany);
});

test('location array in location level will not be duplicated and deserializer returns correct data with already present location_level (detail)', (assert) => {
    let location;
    let json = LF.generate(LD.idOne);
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(json, LD.idOne);
    });
    let original = store.find('location-level', LLD.idOne);
    assert.deepEqual(original.get('locations'), [LD.idOne]);
    let loc = store.find('location', LD.idOne);
    assert.equal(loc.get('location_level_fk'), LLD.idOne);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('location', LD.idOne).get('location_level.name'), LLD.nameCompany);
});

test('location location level will correctly be deserialized when server returns location without a different location level (detail)', (assert) => {
    let location;
    let json = LF.generate(LD.idOne);
    json.location_level.id = LLD.idTwo;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment, locations: []});
        subject.deserialize(json, LD.idOne);
    });
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
    let location;
    let json = LF.generate(LD.idOne);
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    });
    // assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('statusIsNotDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    run(function() {
        subject.deserialize(json, location.get('id'));
    });
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns same status (list)', (assert) => {
    let location;
    let json = LF.generate(LD.idOne);
    delete json.cc;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    });
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        subject.deserialize(response);
    });
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns same status (single)', (assert) => {
    let location;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    });
    let json = LF.generate(LD.idOne);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        subject.deserialize(json, location.get('id'));
    });
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(location.get('status.id'), LDS.openId);
});

test('location status will be updated when server returns different status (list)', (assert) => {
    let location;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
    });
    let json = LF.generate(LD.idOne);
    delete json.cc;
    json.status = LDS.closedId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    run(function() {
        subject.deserialize(response);
    });
    assert.deepEqual(location_status.get('locations'), []);
    assert.deepEqual(location_status_two.get('locations'), [LD.idOne]);
    assert.equal(location.get('status.id'), LDS.closedId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('status_fk'), LDS.closedId);
});

test('newly inserted location will have non dirty status when deserialize list executes', (assert) => {
    let location;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        store.clear('location');
    });
    location_status.set('locations', []);
    let json = LF.generate(LD.idOne);
    delete json.cc;
    json.status = LDS.openId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    run(function() {
        subject.deserialize(response);
    });
    assert.deepEqual(location_status.get('locations'), [LD.idOne]);
    assert.deepEqual(location_status_two.get('locations'), []);
    location = store.find('location', LD.idOne);
    assert.equal(location.get('status.id'), LDS.openId);
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('status_fk'), LDS.openId);
});

test('can push in location with location level as an object', (assert) => {
    let location;
    let json = LF.generate(LD.idOne);
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(json, LD.idOne);
    });
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
});

test('can push in location with location level as an id', (assert) => {
    let location;
    let json = LF.generate(LD.idOne);
    json.location_level = LLD.idOne;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        subject.deserialize(json, LD.idOne);
    });
    assert.equal(location.get('location_level').get('id'), LLD.idOne);
});

/* PH and ADDRESSES and Emails*/
test('location will setup the correct relationship with emails when deserialize_single is invoked with no relationship in place', (assert) => {
    let location, email;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        email = store.push('email', {id: ED.idOne, email: ED.emailOne});
    });
    let response = LF.generate(LD.idOne);
    response.emails = EF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = email.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('email_fks'), [ED.idOne, ED.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(email.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with emails when deserialize_single is invoked with location setup with phone number relationship', (assert) => {
    let location, email;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, email_fks: [ED.idOne]});
        email = store.push('email', {id: ED.idOne, number: ED.emailOne});
    });
    let response = LF.generate(LD.idOne);
    response.emails = EF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = email.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('email_fks'), [ED.idOne, ED.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(email.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with phone numbers when deserialize_single is invoked with no relationship in place', (assert) => {
    let location, phonenumber;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
    });
    let response = LF.generate(LD.idOne);
    response.phone_numbers = PNF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = phonenumber.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(phonenumber.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with phone numbers when deserialize_single is invoked with location setup with phone number relationship', (assert) => {
    let location, phonenumber;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, phone_number_fks: [PND.idOne]});
        phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
    });
    let response = LF.generate(LD.idOne);
    response.phone_numbers = PNF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = phonenumber.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(phonenumber.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with addresses when deserialize_single is invoked with no relationship in place', (assert) => {
    let location, address;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId});
        address = store.push('address', {id: AND.idOne, address: AND.streetOne});
    });
    let response = LF.generate(LD.idOne);
    response.addresses = ANF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = address.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('address_fks'), [AND.idOne, AND.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(address.get('model_fk'), LD.idOne);
});

test('location will setup the correct relationship with address when deserialize_single is invoked with location setup with address relationship', (assert) => {
    let location, address;
    run(function() {
        location = store.push('location', {id: LD.idOne, name: LD.storeName, location_level_fk: LLD.idOne, status_fk: LDS.openId, address_fks: [AND.idOne]});
        address = store.push('address', {id: AND.idOne, address: AND.streetOne});
    });
    let response = LF.generate(LD.idOne);
    response.addresses = ANF.get();
    run(function() {
        subject.deserialize(response, LD.idOne);
    });
    let location_pk = address.get('model_fk');
    assert.ok(location_pk);
    assert.deepEqual(location.get('address_fks'), [AND.idOne, AND.idTwo]);
    assert.ok(location.get('isNotDirty'));
    assert.equal(address.get('model_fk'), LD.idOne);
});
