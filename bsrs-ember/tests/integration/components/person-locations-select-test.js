import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';

let store, m2m, m2m_two, person, role, location_one, location_two, location_three, location_four, run = Ember.run, location_repo;

moduleForComponent('person-locations-select', 'integration: person-locations-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:location', 'model:person-location']);
        m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
        person = store.push('person', {id: PEOPLE_DEFAULTS.id, location_level_pk: LOCATION_LEVEL_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
        role = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
        location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
        location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
        location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeNameThree, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
        location_four = store.push('location', {id: LOCATION_DEFAULTS.anotherId, name: LOCATION_DEFAULTS.storeNameFour, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idFour]});
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.find = function() { return store.find('location'); };
    }
});

test('should render a selectbox with bound options and multiple set to true', function(assert) {
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.render(hbs`{{person-locations-select model=model person=person}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let person_locations_children = store.find('location');
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('person_locations_children', person_locations_children);
    this.set('search', 'x');
    this.render(hbs`{{person-locations-select model=model person=person person_locations_children=person_locations_children}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 2);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('person', person);
//     this.set('search', undefined);
//     this.set('model', person.get('locations'));
//     this.render(hbs`{{person-locations-select model=model person=person search=search}}`);
//     let $component = this.$('.t-person-locations-select');
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search'), 'x');
//             done();
//         }, 15);
//     }, 290);
// });
