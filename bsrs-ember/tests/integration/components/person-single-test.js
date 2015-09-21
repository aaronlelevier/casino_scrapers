import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';

var store, location_repo;

moduleForComponent('person-single', 'integration: person-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:location-level', 'model:currency', 'service:currency']);
        store.push('currency', CURRENCY_DEFAULTS);
        store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idOne, ROLE_DEFAULTS.idTwo]});
        translation.initialize(this);
        location_repo = repository.initialize(this.container, this.registry, 'location');
        location_repo.findLocationSelect = function() { return store.find('location'); };
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
    }
});

test('selecting a role will append the persons id to the new role but remove it from the previous role', function(assert) {
    var role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var role_one = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    var $component = this.$('.t-person-role-select');
    assert.equal(this.$('.t-person-role-select option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-person-role-select option:eq(1)').text(), 'Administrator');//TODO: translate this
    assert.equal(person.get('role').get('people'), PEOPLE_DEFAULTS.id);
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    this.$('.t-person-role-select').val(ROLE_DEFAULTS.idTwo).trigger('change');
    assert.equal(role_two.get('people.length'), 2);
    assert.deepEqual(role_two.get('people'), [PEOPLE_DEFAULTS.unusedId, PEOPLE_DEFAULTS.id]);
    assert.equal(role_one.get('people.length'), 0);
    assert.deepEqual(role_one.get('people'), []);
    assert.deepEqual(person.get('role').get('people')[1], PEOPLE_DEFAULTS.id);
    assert.deepEqual(person.get('role.id'), ROLE_DEFAULTS.idTwo);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isDirty'));
});

test('selecting a placeholder instead of legit role will not append the persons id to anything but still remove it from the previous role', function(assert) {
    var role_two = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.unusedId], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var role_one = store.push('role', {id: ROLE_DEFAULTS.idOne, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    var $component = this.$('.t-person-role-select');
    assert.equal(this.$('.t-person-role-select option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-person-role-select option:eq(1)').text(), 'Administrator');//TODO: translate this
    assert.equal(person.get('role').get('people'), PEOPLE_DEFAULTS.id);
    assert.equal(person.get('role.id'), ROLE_DEFAULTS.idOne);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    this.$('.t-person-role-select').val('Select One').trigger('change');
    assert.equal(role_two.get('people.length'), 1);
    assert.deepEqual(role_two.get('people'), [PEOPLE_DEFAULTS.unusedId]);
    assert.deepEqual(role_one.get('people'), []);
    assert.equal(person.get('role'), undefined);
    assert.ok(role_one.get('isNotDirty'));
    assert.ok(role_two.get('isNotDirty'));
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('isNotDirty'));
});

test('locations multi select is rendered in this component', function(assert) {
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idTwo], locations: [LOCATION_DEFAULTS.idOne]});
    this.set('model', person);
    this.render(hbs`{{person-single model=model}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.find('option').length, 1);
});

test('locations multi select will not break when array proxy passes through without location_level (temporary state of the component)', function(assert) {
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: undefined, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let role_two = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idTwo, ROLE_DEFAULTS.idOne], locations: []});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.find('option').length, 0);
});

test('locations multi select will update options if clicked into.', function(assert) {
    var done = assert.async();
    let m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
    let role = store.push('role', {id: ROLE_DEFAULTS.idTwo, name: ROLE_DEFAULTS.nameTwo, people: undefined, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let role_two = store.push('role', {id: ROLE_DEFAULTS.idOne, name: ROLE_DEFAULTS.nameOne, people: [PEOPLE_DEFAULTS.id], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, role_fk: ROLE_DEFAULTS.idOne, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idTwo, ROLE_DEFAULTS.idOne], locations: []});
    this.set('model', person);
    this.set('roles', store.find('role'));
    this.render(hbs`{{person-single model=model roles=roles}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.find('div.option').length, 0);
    assert.equal($component.find('div.item').length, 0);
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne], location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.idTwo], locations: [LOCATION_DEFAULTS.idOne]});
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    $component = this.$('.t-person-locations-select');
    setTimeout(() => {
      assert.equal($component.find('div.item').length, 1);
      assert.equal($component.find('div.option').length, 0);
      done();
    }, 1);
});
