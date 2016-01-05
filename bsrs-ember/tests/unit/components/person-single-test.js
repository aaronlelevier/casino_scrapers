import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PersonSingleComponent from 'bsrs-ember/components/person-single/component';
import PersonLocationSelect from 'bsrs-ember/components/person-locations-select/component';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, location_repo, eventbus, tabList, run = Ember.run;

module('unit: person-single component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:location-level', 'model:location', 'model:person-location', 'service:eventbus', 'service:tab-list']);
        eventbus = this.container.lookup('service:eventbus');
        tabList = this.container.lookup('service:tab-list');
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationSelect = function() { return store.find('location'); };
    }
});

test('locations computed will be filtered by person.role.location_level', (assert) => {
    let m2m, m2m_two, m2m_three, m2m_four, role, role_invalid, person, person_two, location_one, location_two, location_three, location_level, location_level_two;
    run(function() {
        m2m = store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
        m2m_three = store.push('person-location', {id: PERSON_LD.idThree, person_pk: PD.unusedId, location_pk: LD.idTwo});
        role = store.push('role', {id: RD.idTwo, name: RD.nameTwo, people: [PD.id], location_level_fk: LLD.idOne});
        role_invalid = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.unusedId], location_level_fk: LLD.idTwo});
        person = store.push('person', {id: PD.id, role_fk: RD.idTwo, person_location_fks: [PERSON_LD.idOne]});
        person_two = store.push('person', {id: PD.unusedId, role_fk: RD.idOne, person_location_fks: [PERSON_LD.idThree]});
        location_one = store.push('location', {id: LD.idOne, name: LD.storeName, person_location_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idTwo], locations: [LD.idOne]});
        location_level_two = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, roles: [RD.idOne], locations: []});
    });
    let location_level_fk = person.get('location_level_fk');
    let person_locations_children = store.find('location', {location_level_fk: location_level_fk});
    let subject = PersonSingleComponent.create({model: person, location_repo: location_repo, eventbus: eventbus, tabList: tabList, person_locations_children: person_locations_children});
    let location_select = PersonLocationSelect.create({model: person.get('locations'), person: person, repository: location_repo});
    assert.equal(location_select.get('person_locations_selected').get('length'), 1);
    run(function() {
        location_two = store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_location_fks: [PERSON_LD.idTwo], location_level_fk: LLD.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.id, location_pk: LD.idTwo});
    });
    person.set('person_location_fks', [PERSON_LD.idOne, PERSON_LD.idTwo]);
    location_level.set('locations', [LD.idOne, LD.idTwo]);
    assert.equal(location_select.get('person_locations_selected').get('length'), 2);
    run(function() {
        location_three = store.push('location', {id: LD.unusedId, name: LD.storeNameThree, person_location_fks: [PERSON_LD.idFour], location_level_fk: LLD.idTwo});
        m2m_four = store.push('person-location', {id: PERSON_LD.idFour, person_pk: PD.unusedId, location_pk: LD.unusedId});
    });
    person_two.set('person_location_fks', [PERSON_LD.idThree, PERSON_LD.idFour]);
    location_level_two.set('locations', [LD.unusedId]);
    assert.equal(location_select.get('person_locations_selected').get('length'), 2);
    assert.equal(person.get('location_level_pk'), LLD.idOne);
    let person_location_one = store.find('person-location', PERSON_LD.idOne);
    let person_location_two = store.find('person-location', PERSON_LD.idTwo);
    let person_location_three = store.find('person-location', PERSON_LD.idThree);
    let person_location_four = store.find('person-location', PERSON_LD.idFour);
    assert.equal(person_location_one.get('removed'), undefined);
    assert.equal(person_location_two.get('removed'), undefined);
    assert.equal(person_location_three.get('removed'), undefined);
    assert.equal(person_location_four.get('removed'), undefined);
    assert.equal(person.get('role_fk'), RD.idTwo);
    person.change_role(role_invalid, role);
    assert.equal(person.get('role_fk'), role.get('id'));
    assert.equal(person_location_one.get('removed'), true);
    assert.equal(person_location_two.get('removed'), true);
    assert.equal(person_location_three.get('removed'), undefined);
    assert.equal(person_location_four.get('removed'), undefined);
    assert.equal(person.get('location_level_pk'), LLD.idTwo);
    assert.equal(location_select.get('person_locations_selected').get('length'), 0);
    person.change_role(role, role_invalid);
    assert.equal(person_location_one.get('removed'), undefined);
    assert.equal(person_location_two.get('removed'), undefined);
    assert.equal(person_location_three.get('removed'), undefined);
    assert.equal(person_location_four.get('removed'), undefined);
    assert.equal(location_select.get('person_locations_selected').get('length'), 2);
    assert.equal(person.get('locations').get('length'), 2);
});
