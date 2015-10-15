import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';

let store, m2m, m2m_two, ticket, person_one, person_two, person_three, run = Ember.run;

moduleForComponent('ticket-person-select', 'integration: ticket-person-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:ticket-person']);
        m2m = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
        m2m_two = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.idTwo});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PEOPLE_DEFAULTS.idOne, TICKET_PEOPLE_DEFAULTS.idTwo]});
        person_one = store.push('person', {id: PEOPLE_DEFAULTS.id});
        person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
        person_three = store.push('person', {id: PEOPLE_DEFAULTS.unusedId});
    }
});

test('should render a selectbox when the options are empty (initial state of selectize)', function(assert) {
    let ticket_cc_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_cc_options', ticket_cc_options);
    this.set('search', '');
    this.render(hbs`{{ticket-person-multi-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
    let $component = this.$('.t-ticket-people-select');
    assert.equal($component.prop('multiple'), true);
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 0);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_cc_options = store.find('person');
    this.set('ticket', ticket);
    this.set('ticket_cc_options', ticket_cc_options);
    this.set('search', 'x');
    this.render(hbs`{{ticket-person-multi-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
    let $component = this.$('.t-ticket-people-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
});

// test('should render a selectbox with bound options after type ahead for search with search params for people', function(assert) {
//     let one = store.push('person', {id: 'abcde4'});
//     let two = store.push('person', {id: 'abcde5'});
//     let three = store.push('person', {id: 'abcde6'});
//     let ticket_cc_options = Ember.ArrayProxy.extend({
//         content: Ember.computed(function() {
//             return Ember.A(this.get('source'));
//         })
//     }).create({
//         source: [one, two, three]
//     });
//     this.set('ticket', ticket);
//     this.set('ticket_cc_options', ticket_cc_options);
//     this.set('search', 'abcde');
//     this.render(hbs`{{ticket-person-multi-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
//     let $component = this.$('.t-ticket-people-select');
//     assert.equal($component.find('div.item').length, 2);
//     assert.equal($component.find('div.option').length, 3);
// });

test('should render a selectbox with bound options and multiple set to true after type ahead for search', function(assert) {
    let ticket_cc_options = store.find('person');
    this.set('ticket', ticket);
    this.set('ticket_cc_options', ticket_cc_options);
    this.set('search', 'x');
    this.render(hbs`{{ticket-person-multi-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
    let $component = this.$('.t-ticket-people-select');
    assert.equal($component.find('div.item').length, 2);
    assert.equal($component.find('div.option').length, 1);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 3);
    assert.equal($component.find('div.option').length, 0);
    assert.equal(ticket.get('cc').objectAt(2).get('id'), PEOPLE_DEFAULTS.unusedId);
    let unique_people = ticket.get('cc_ids').toArray().uniq();
    assert.equal(unique_people.get('length'), 3);
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

