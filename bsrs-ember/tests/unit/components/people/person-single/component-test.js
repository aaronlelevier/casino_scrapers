import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/location';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, location_repo;

moduleForComponent('people/person-single', 'Unit | Component | people/person single', {
    needs: ['validator:presence', 'validator:has-many'],
    unit: true,
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:location-level', 'model:location', 'model:person-location', 'service:eventbus', 'service:tab-list', 'service:error']);
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationSelect = function() { return store.find('location'); };
    }
});

test('locations computed will be filtered by person.role.location_level', function(assert) {
    let person, person_two, role, role_invalid, location_level, location_level_two;
    run(() => {
        store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
        store.push('person-location', {id: PERSON_LD.idThree, person_pk: PD.unusedId, location_pk: LD.idTwo});
        role = store.push('role', {id: RD.idTwo, name: RD.nameTwo, people: [PD.id], location_level_fk: LLD.idOne});
        role_invalid = store.push('role', {id: RD.idOne, name: RD.nameOne, people: [PD.unusedId], location_level_fk: LLD.idTwo});
        person = store.push('person', {id: PD.id, role_fk: RD.idTwo, person_locations_fks: [PERSON_LD.idOne]});
        person_two = store.push('person', {id: PD.unusedId, role_fk: RD.idOne, person_locations_fks: [PERSON_LD.idThree]});
        store.push('location', {id: LD.idOne, name: LD.storeName, person_locations_fks: [PERSON_LD.idOne], location_level_fk: LLD.idOne});
        location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, roles: [RD.idTwo], locations: [LD.idOne]});
        location_level_two = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, roles: [RD.idOne], locations: []});
    });
    run(function() {
        store.push('location', {id: LD.idTwo, name: LD.storeNameTwo, person_locations_fks: [PERSON_LD.idTwo], location_level_fk: LLD.idOne});
        store.push('person-location', {id: PERSON_LD.idTwo, person_pk: PD.id, location_pk: LD.idTwo});
    });
    person.set('person_locations_fks', [PERSON_LD.idOne, PERSON_LD.idTwo]);
    location_level.set('locations', [LD.idOne, LD.idTwo]);
    run(function() {
        store.push('location', {id: LD.unusedId, name: LD.storeNameThree, person_locations_fks: [PERSON_LD.idFour], location_level_fk: LLD.idTwo});
        store.push('person-location', {id: PERSON_LD.idFour, person_pk: PD.unusedId, location_pk: LD.unusedId});
    });
    person_two.set('person_locations_fks', [PERSON_LD.idThree, PERSON_LD.idFour]);
    location_level_two.set('locations', [LD.unusedId]);
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
    person.change_role(role, role_invalid);
    assert.equal(person_location_one.get('removed'), undefined);
    assert.equal(person_location_two.get('removed'), undefined);
    assert.equal(person_location_three.get('removed'), undefined);
    assert.equal(person_location_four.get('removed'), undefined);
    assert.equal(person.get('locations').get('length'), 2);
});
