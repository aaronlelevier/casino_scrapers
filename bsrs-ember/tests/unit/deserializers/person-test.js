import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import PHONE_NUMBER_FIXTURES from 'bsrs-ember/vendor/phone_number_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import Person from 'bsrs-ember/models/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import random from 'bsrs-ember/models/random';

var store, personProxy, subject, personCurrent, uuid, location_deserializer, location_level_deserializer;

module('unit: person deserializer test', {
    beforeEach() {
        random.uuid = function() { return Ember.uuid(); };
        store = module_registry(this.container, this.registry, ['model:random','model:uuid','model:person', 'model:role','model:person-location','model:location','model:location-level','model:phonenumber','model:address','model:address-type','service:person-current','service:translations-fetcher','service:i18n']);
        uuid = this.container.lookup('model:uuid');
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        location_deserializer = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        subject = PersonDeserializer.create({store: store, uuid: uuid, LocationDeserializer: location_deserializer});
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
    }
});

test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with relationship already in place', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    let phonenumber = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne, person_fk: PEOPLE_DEFAULTS.id});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    response.phone_numbers = PHONE_NUMBER_FIXTURES.get();
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let person_pk = phonenumber.get('person_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('person_fk'), PEOPLE_DEFAULTS.id);
});

test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with no relationship in place', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let phonenumber = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    response.phone_numbers = PHONE_NUMBER_FIXTURES.get();
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let person_pk = phonenumber.get('person_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('person_fk'), PEOPLE_DEFAULTS.id);
});

test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with person setup with phone number relationship', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, phone_number_fks: [PHONE_NUMBER_DEFAULTS.idOne]});
    let phonenumber = store.push('phonenumber', {id: PHONE_NUMBER_DEFAULTS.idOne, number: PHONE_NUMBER_DEFAULTS.numberOne});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    response.phone_numbers = PHONE_NUMBER_FIXTURES.get();
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let person_pk = phonenumber.get('person_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PHONE_NUMBER_DEFAULTS.idOne, PHONE_NUMBER_DEFAULTS.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('person_fk'), PEOPLE_DEFAULTS.id);
});

test('role will keep appending when deserialize_list is invoked with many people who play the same role', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    let json = PEOPLE_FIXTURES.generate_single_for_list(PEOPLE_DEFAULTS.unusedId);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('role will setup the correct relationship with location_level when deserialize_single is invoked', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let role_location_level = role.get('location_level');
    assert.ok(role_location_level);
    assert.equal(location_level.get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(role_location_level.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.deepEqual(role_location_level.get('roles'), [ROLE_DEFAULTS.idOne]);
});

test('person-location m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: []});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    response.locations = [LOCATION_FIXTURES.get()];
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 0);
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    locations = original.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(store.find('person-location').get('length'), 1);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('person-location m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations.length'), 1);
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    let second_location = LOCATION_FIXTURES.get(LOCATION_DEFAULTS.idTwo);
    second_location.name = LOCATION_DEFAULTS.storeNameTwo;
    response.locations = [LOCATION_FIXTURES.get(), second_location];
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(locations.objectAt(1).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 2);
});

test('person-location m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    let second_location = LOCATION_FIXTURES.get(LOCATION_DEFAULTS.idTwo);
    second_location.name = LOCATION_DEFAULTS.storeNameTwo;
    let third_location = LOCATION_FIXTURES.get(LOCATION_DEFAULTS.idThree);
    third_location.name = LOCATION_DEFAULTS.storeNameThree;
    response.locations = [second_location, third_location];
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idTwo);
    assert.equal(locations.objectAt(1).get('id'), LOCATION_DEFAULTS.idThree);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 3);
});

test('person-location m2m added even when person did not exist before the deserializer executes', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    response.locations = [LOCATION_FIXTURES.get()];
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let person = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 1);
});
