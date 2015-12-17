import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import RD from 'bsrs-ember/vendor/defaults/role';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNF from 'bsrs-ember/vendor/phone_number_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import SD from 'bsrs-ember/vendor/defaults/status';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LD from 'bsrs-ember/vendor/defaults/location';
import LF from 'bsrs-ember/vendor/location_fixtures';
import Person from 'bsrs-ember/models/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store, personProxy, subject, personCurrent, uuid, location_deserializer, location_level_deserializer, status, person;

module('unit: person deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:random','model:uuid','model:person', 'model:role','model:person-location','model:location','model:location-level','model:phonenumber','model:address','model:address-type','service:person-current','service:translations-fetcher','service:i18n', 'model:status']);
        uuid = this.container.lookup('model:uuid');
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        location_deserializer = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        subject = PersonDeserializer.create({store: store, uuid: uuid, LocationDeserializer: location_deserializer});
        status = store.push('status', {id: SD.activeId, name: SD.activeName});
        person = store.push('person', {id: PD.idOne, status_fk: SD.activeId});
    }
});

/* STATUS */
test('person setup correct status fk with bootstrapped data (detail)', (assert) => {
    let status = store.push('status', {id: SD.activeId, name: SD.activeName});
    let response = PF.generate(PD.idOne);
    subject.deserialize(response, PD.idOne);
    assert.equal(person.get('status_fk'), status.get('id'));
    assert.equal(person.get('status').get('id'), status.get('id'));
    assert.deepEqual(status.get('people'), [PD.idOne]);
    assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with existing status pointer to person', (assert) => {
    let status = store.push('status', {id: SD.activeId, name: SD.activeName, people: [PD.idOne]});
    let response = PF.generate(PD.idOne);
    subject.deserialize(response, PD.idOne);
    assert.equal(person.get('status_fk'), status.get('id'));
    assert.equal(person.get('status').get('id'), status.get('id'));
    assert.equal(status.get('people').length, 1);
    assert.ok(person.get('isNotDirty'));
});

test('person setup correct status fk with bootstrapped data (list)', (assert) => {
    let person = store.push('person', {id: PD.id});
    let json = PF.generate(PD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.equal(person.get('status_fk'), status.get('id'));
    assert.equal(person.get('status').get('id'), status.get('id'));
    assert.equal(status.get('people').length, 1);
    assert.deepEqual(status.get('people'), [PD.idOne]);
    assert.ok(person.get('isNotDirty'));
});

test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with relationship already in place', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
    let phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, person_fk: PD.id});
    let response = PF.generate(PD.id);
    response.phone_numbers = PNF.get();
    subject.deserialize(response, PD.id);
    let person_pk = phonenumber.get('person_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('person_fk'), PD.id);
    assert.ok(!person.get('roleIsDirty'));
});

/* PH and ADDRESSES */
test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with no relationship in place', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, role_fk: RD.idOne});
    let phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
    let response = PF.generate(PD.id);
    response.phone_numbers = PNF.get();
    subject.deserialize(response, PD.id);
    let person_pk = phonenumber.get('model_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('model_fk'), PD.id);
});

test('person will setup the correct relationship with phone numbers when deserialize_single is invoked with person setup with phone number relationship', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, phone_number_fks: [PND.idOne], role_fk: RD.idOne});
    let phonenumber = store.push('phonenumber', {id: PND.idOne, number: PND.numberOne});
    let response = PF.generate(PD.id);
    response.phone_numbers = PNF.get();
    subject.deserialize(response, PD.id);
    let person_pk = phonenumber.get('model_fk');
    assert.ok(person_pk);
    assert.deepEqual(person.get('phone_number_fks'), [PND.idOne, PND.idTwo]);
    assert.ok(person.get('isNotDirty'));
    assert.equal(phonenumber.get('model_fk'), PD.id);
});

/* ROLE */
test('role will keep appending when deserialize_list is invoked with many people who play the same role', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, role_fk: RD.idOne});
    let json = PF.generate_single_for_list(PD.unusedId);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('role', RD.idOne);
    assert.deepEqual(original.get('people'), [PD.id, PD.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('role will setup the correct relationship with location_level when deserialize_single is invoked', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, role_fk: RD.idOne});
    let response = PF.generate(PD.id);
    subject.deserialize(response, PD.id);
    let role_location_level = role.get('location_level');
    assert.ok(role_location_level);
    assert.equal(location_level.get('id'), LLD.idOne);
    assert.ok(role_location_level.get('isNotDirty'));
    assert.equal(role.get('location_level_fk'), LLD.idOne);
    assert.deepEqual(role_location_level.get('roles'), [RD.idOne]);
});

/* PERSON LOCATION */
test('person-location m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, person_location_fks: [], role_fk: RD.idOne});
    let response = PF.generate(PD.id);
    response.locations = [LF.get()];
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 0);
    subject.deserialize(response, PD.id);
    let original = store.find('person', PD.id);
    locations = original.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('name'), LD.storeName);
    assert.equal(store.find('person-location').get('length'), 1);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('person-location m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, person_location_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne]});
    assert.equal(person.get('locations.length'), 1);
    let response = PF.generate(PD.id);
    let second_location = LF.get(LD.idTwo);
    second_location.name = LD.storeNameTwo;
    response.locations = [LF.get(), second_location];
    subject.deserialize(response, PD.id);
    let original = store.find('person', PD.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('name'), LD.storeName);
    assert.equal(locations.objectAt(1).get('name'), LD.storeNameTwo);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 2);
});

test('person-location m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let person = store.push('person', {id: PD.id, person_location_fks: [PERSON_LD.idOne], role_fk: RD.idOne});
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne]});
    assert.equal(person.get('locations').get('length'), 1);
    let response = PF.generate(PD.id);
    let second_location = LF.get(LD.idTwo);
    second_location.name = LD.storeNameTwo;
    let third_location = LF.get(LD.idThree);
    third_location.name = LD.storeNameThree;
    response.locations = [second_location, third_location];
    subject.deserialize(response, PD.id);
    let original = store.find('person', PD.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LD.idTwo);
    assert.equal(locations.objectAt(1).get('id'), LD.idThree);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 3);
});

test('person-location m2m added even when person did not exist before the deserializer executes', (assert) => {
    store.clear('person');
    let location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idOne]});
    let role = store.push('role', {id: RD.idOne, location_level_fk: LLD.idOne, people: [PD.id]});
    let response = PF.generate(PD.id);
    response.locations = [LF.get()];
    subject.deserialize(response, PD.id);
    let person = store.find('person', PD.id);
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), LD.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 1);
});
