import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, location_one, location_two, location_three, run = Ember.run;

moduleForComponent('ticket-location-select', 'integration: ticket-location-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:location']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: LOCATION_DEFAULTS.idOne});
        location_one = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName});
        location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo});
        location_three = store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: LOCATION_DEFAULTS.storeNameThree});
    }
});

test('should render a selectbox when location options are empty (initial state of selectize)', function(assert) {
    let ticket_location_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_location_options', ticket_location_options);
    this.render(hbs`{{ticket-location-select ticket=ticket ticket_location_options=ticket_location_options}}`);
    let $component = this.$('.t-ticket-location-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 0);
});

test('should render a selectbox with bound options after type ahead for search_location', function(assert) {
    let ticket_location_options = store.find('location');
    location_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_location_options', ticket_location_options);
    this.set('search_location', 'x');
    this.render(hbs`{{ticket-location-select ticket=ticket search_location=search_location ticket_location_options=ticket_location_options}}`);
    let $component = this.$('.t-ticket-location-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
});

test('should be able to select new location when one doesnt exist', function(assert) {
    let ticket_location_options = store.find('location');
    this.set('ticket', ticket);
    this.set('ticket_location_options', ticket_location_options);
    this.set('search_location', 'x');
    this.render(hbs`{{ticket-location-select ticket=ticket search_location=search_location ticket_location_options=ticket_location_options}}`);
    let $component = this.$('.t-ticket-location-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 3);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
});

test('should be able to select new location when ticket already has a location', function(assert) {
    let ticket_location_options = store.find('location');
    location_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_location_options', ticket_location_options);
    this.set('search_location', 'x');
    this.render(hbs`{{ticket-location-select ticket=ticket search_location=search_location ticket_location_options=ticket_location_options}}`);
    let $component = this.$('.t-ticket-location-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(1)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     this.set('location', location);
//     this.set('search_location', undefined);
//     this.set('model', location.get('locations'));
//     this.render(hbs`{{location-locations-select model=model location=location search_location=search_location}}`);
//     let $component = this.$('.t-location-locations-select');
//     this.$('div.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search_location'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search_location'), 'x');
//             done();
//         }, 15);
//     }, 290);
// });


