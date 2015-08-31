import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import PERSON_LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/person-location';

let store, m2m, m2m_two, person, location_one, location_two, location_three, location_four, run = Ember.run;

moduleForComponent('person-locations-select', 'integration: person-locations-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:location', 'model:person-location']);
        m2m = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idOne});
        m2m_two = store.push('person-location', {id: PERSON_LOCATION_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, location_pk: LOCATION_DEFAULTS.idTwo});
        person = store.push('person', {id: PEOPLE_DEFAULTS.id, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne, PERSON_LOCATION_DEFAULTS.idTwo]});
        location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, person_location_fks: [PERSON_LOCATION_DEFAULTS.idOne]});
        location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, person_location_fks: [PERSON_LOCATION_DEFAULTS.idTwo]});
        location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeNameThree, person_location_fks: [PERSON_LOCATION_DEFAULTS.idThree]});
        location_four = store.push('location', {id: LOCATION_DEFAULTS.anotherId, name: LOCATION_DEFAULTS.storeNameFour, person_location_fks: [PERSON_LOCATION_DEFAULTS.idFour]});
    }
});

test('should render a selectbox with bound options and multiple set to true', function(assert) {
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('options', store.find('location'));
    this.render(hbs`{{person-locations-select model=model person=person options=options}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.option').length, 2);
});

test('select should show items selected correctly based on the model', function(assert) {
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('options', store.find('location'));
    this.render(hbs`{{person-locations-select model=model person=person options=options}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.item:eq(0)').data('value'), LOCATION_DEFAULTS.idOne);
    assert.equal($component.find('div.item:eq(1)').data('value'), LOCATION_DEFAULTS.idTwo);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(1)').trigger('click').trigger('change'); });
    assert.equal($component.find('div.option').length, 1);
    assert.equal($component.find('div.item').length, 3);
    assert.equal(person.get('locations').get('length'), 3);
    assert.equal($component.find('div.item:eq(0)').data('value'), LOCATION_DEFAULTS.idOne);
    assert.equal($component.find('div.item:eq(1)').data('value'), LOCATION_DEFAULTS.idTwo);
    assert.equal($component.find('div.item:eq(2)').data('value'), LOCATION_DEFAULTS.anotherId);
});

test('selecting a location will update the model when person had no locations to begin with', function(assert) {
    store.clear('person-location');
    person.set('person_location_fks', []);
    person.save();
    person.saveRelated();
    assert.equal(person.get('locations').get('length'), 0);
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('options', store.find('location'));
    this.render(hbs`{{person-locations-select model=model person=person options=options}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal(person.get('locations').get('length'), 0);
    assert.equal($component.find('div.item').length, 0);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(0)').trigger('click').trigger('change'); });
    assert.equal($component.find('div.item').length, 1);
    assert.equal(person.get('locations').get('length'), 1);
});

test('adding a location will append it to the person-location m2m relationship', function(assert) {
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('options', store.find('location'));
    this.render(hbs`{{person-locations-select model=model person=person options=options}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.item:eq(0)').data('value'), LOCATION_DEFAULTS.idOne);
    assert.equal($component.find('div.item:eq(1)').data('value'), LOCATION_DEFAULTS.idTwo);
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.option:eq(0)').data('value'), LOCATION_DEFAULTS.unusedId);
    assert.equal($component.find('div.option:eq(1)').data('value'), LOCATION_DEFAULTS.anotherId);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_one.get('isNotDirty'));
    assert.ok(location_two.get('isNotDirty'));
    assert.ok(location_three.get('isNotDirty'));
    assert.ok(location_four.get('isNotDirty'));
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(person.get('locations').objectAt(1).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.option:eq(1)').trigger('click').trigger('change'); });
    assert.equal(person.get('locations').get('length'), 3);
    assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(person.get('locations').objectAt(1).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    assert.equal(person.get('locations').objectAt(2).get('name'), LOCATION_DEFAULTS.storeNameFour);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(location_one.get('isNotDirty'));
    assert.ok(location_two.get('isNotDirty'));
    assert.ok(location_three.get('isNotDirty'));
    assert.ok(location_four.get('isNotDirty'));
});

test('removing a location will remove from the person-location m2m relationship', function(assert) {
    this.set('person', person);
    this.set('model', person.get('locations'));
    this.set('options', store.find('location'));
    this.render(hbs`{{person-locations-select model=model person=person options=options}}`);
    let $component = this.$('.t-person-locations-select');
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.option:eq(0)').data('value'), LOCATION_DEFAULTS.unusedId);
    assert.equal($component.find('div.option:eq(1)').data('value'), LOCATION_DEFAULTS.anotherId);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location_one.get('isNotDirty'));
    assert.ok(location_two.get('isNotDirty'));
    assert.ok(location_three.get('isNotDirty'));
    assert.ok(location_four.get('isNotDirty'));
    assert.equal(person.get('locations').get('length'), 2);
    assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeName);
    assert.equal(person.get('locations').objectAt(1).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    this.$('.selectize-input input').trigger('click');
    run(() => { $component.find('div.item:eq(0) a').trigger('click').trigger('change'); });
    assert.equal(person.get('locations').get('length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('name'), LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(person.get('isDirtyOrRelatedDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(location_one.get('isNotDirty'));
    assert.ok(location_two.get('isNotDirty'));
    assert.ok(location_three.get('isNotDirty'));
    assert.ok(location_four.get('isNotDirty'));
});
