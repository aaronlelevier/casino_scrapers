import Ember from 'ember';
import {test, module} from 'qunit';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import random from 'bsrs-ember/models/random';

var container, registry, subject, store, uuid;

module('unit: person deserializer test', {
    beforeEach() {
        random.uuid = function() { return Ember.uuid(); };
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:random','model:uuid','model:person', 'model:role','model:person-location','model:location','model:location-level','model:phonenumber','model:address','model:address-type']);
        uuid = container.lookup('model:uuid');
        subject = PersonDeserializer.create({store: store, uuid: uuid});
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
        subject = null;
        store = null;
        container = null;
        registry = null;
    }
});

test('role will keep appending when deserialize_list is invoked with many people who play the same role', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id]);
    var json = [PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.unusedId)];
    var response = {'count':1,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('role will keep appending when deserialize_single is invoked with many people who play the same role', (assert) => {
    var role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    var original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id]);
    var response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.unusedId);
    response.phone_numbers = [];
    response.addresses = [];
    subject.deserialize(response, PEOPLE_DEFAULTS.unusedId);
    original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('isNotDirty'));
});

test('person location many to many is set up correctly using deserialize list', (assert) => {
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: []});
    let json = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    json.locations = [LOCATION_FIXTURES.get()];
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 0);
    subject.deserialize(response);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    locations = original.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(store.find('person-location').get('length'), 1);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('person will have new m2m relationships added after deserialize list', (assert) => {
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations.length'), 1);
    let json = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    json.locations = [LOCATION_FIXTURES.get(), {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo}];
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.ok(original.get('isNotDirty'));
    assert.equal(store.find('person-location').get('length'), 2);
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    //var location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
});

test('person will have remove m2m relationships that are not reflected on the server', (assert) => {
    var m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations.length'), 1);
    let json = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    json.locations = [{id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo}, {id: LOCATION_DEFAULTS.idThree, name: LOCATION_DEFAULTS.storeNameThree}];
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idTwo);
    assert.equal(locations.objectAt(1).get('id'), LOCATION_DEFAULTS.idThree);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 3);
});

test('location m2m added even when person did not exist before the deserializer executes', (assert) => {
    let json = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);
    json.locations = [LOCATION_FIXTURES.get()];
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let person = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = person.get('locations');
    assert.equal(locations.get('length'), 1);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idOne);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 1);
});
