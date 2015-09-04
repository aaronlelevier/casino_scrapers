import Ember from 'ember';
import {test, module} from 'qunit';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
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

    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    let json = PEOPLE_FIXTURES.generate_single_for_list(PEOPLE_DEFAULTS.unusedId);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};

    subject.deserialize(response);
    let original = store.find('role', ROLE_DEFAULTS.idOne);
    assert.deepEqual(original.get('people'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.unusedId]);
    assert.ok(original.get('notDirty'));
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
    assert.ok(role_location_level.get('notDirty'));
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
    assert.ok(original.get('notDirty'));
    assert.ok(original.get('notDirtyOrRelatedNotDirty'));
});

test('person-location m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne]});

    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    assert.equal(person.get('locations.length'), 1);
    let response = PEOPLE_FIXTURES.generate(PEOPLE_DEFAULTS.id);

    response.locations = [LOCATION_FIXTURES.get(), {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo}];
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(locations.objectAt(1).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(original.get('notDirty'));
    assert.ok(original.get('notDirtyOrRelatedNotDirty'));
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

    response.locations = [{id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo}, {id: LOCATION_DEFAULTS.idThree, name: LOCATION_DEFAULTS.storeNameThree}];
    subject.deserialize(response, PEOPLE_DEFAULTS.id);
    let original = store.find('person', PEOPLE_DEFAULTS.id);
    let locations = original.get('locations');
    assert.equal(locations.get('length'), 2);
    assert.equal(locations.objectAt(0).get('id'), LOCATION_DEFAULTS.idTwo);
    assert.equal(locations.objectAt(1).get('id'), LOCATION_DEFAULTS.idThree);
    assert.ok(original.get('notDirty'));
    assert.ok(original.get('notDirtyOrRelatedNotDirty'));
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
    assert.ok(person.get('notDirty'));
    assert.ok(person.get('notDirtyOrRelatedNotDirty'));
    assert.equal(store.find('person-location').get('length'), 1);
});
