import Ember from 'ember';
import {test, module} from 'qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PersonSingleComponent from 'bsrs-ember/components/person-single/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var registry, container, store, location_repo, eventbus;

module('unit: person-single component test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'model:role', 'model:location-level', 'model:location', 'model:person-location', 'service:eventbus']);
        eventbus = container.lookup('service:eventbus');
        location_repo = repository.initialize(container, registry, 'location');
        location_repo.find = function() { return store.find('location'); };
    },
    afterEach() {
        eventbus = null;
        location_repo = null;
        store = null;
        container = null;
        registry = null;
    }
});

test('locations computed will be filtered by person.role.location_level', (assert) => {
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let m2m_three = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idThree, person_pk: PEOPLE_DEFAULTS.unusedId, location_pk: LOCATION_DEFAULTS.idTwo});
    let role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let role_invalid = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId], location_level_fk: LOCATION_LEVEL_DEFAULTS.idTwo});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let person_two = store.push('person', {id: PEOPLE_DEFAULTS.unusedId, role_fk: ROLE_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
    let location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idTwo], locations: [LOCATION_DEFAULTS.idOne]});
    var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, roles: [ROLE_DEFAULTS.idOne], locations: []});
    let subject = PersonSingleComponent.create({model: person, location_repo: location_repo, eventbus: eventbus});
    assert.equal(subject.get('locations').get('length'), 1);
    let location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
    person.set('person_location_fks', [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]);
    location_level.set('locations', [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.idTwo]);
    assert.equal(subject.get('locations').get('length'), 2);
    let location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeNameThree, person_location_fks: [PERSON_LOCATION_DEFAULTS.idFour], location_level_fk: LOCATION_LEVEL_DEFAULTS.idTwo});
    let m2m_four = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idFour, person_pk: PEOPLE_DEFAULTS.unusedId, location_pk: LOCATION_DEFAULTS.unusedId});
    person_two.set('person_location_fks', [PERSON_LOCATION_DEFAULTS.idThree, PERSON_LOCATION_DEFAULTS.idFour]);
    location_level_two.set('locations', [LOCATION_DEFAULTS.unusedId]);
    assert.equal(subject.get('locations').get('length'), 2);
    person.change_role(role_invalid, role);
    assert.equal(subject.get('locations').get('length'), 1);
    person.change_role(role, role_invalid);
    assert.equal(subject.get('locations').get('length'), 2);
});
