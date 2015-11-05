import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';

let store, m2m, m2m_two, ticket, person_one, person_two, person_three, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const DROPDOWN = '.ember-power-select-dropdown';
const COMPONENT = '.t-ticket-cc-select';

moduleForComponent('ticket-cc-power-select', 'integration: ticket-cc-power-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:ticket-person']);
        m2m = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
        m2m_two = store.push('ticket-person', {id: TICKET_PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.idTwo});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PEOPLE_DEFAULTS.idOne, TICKET_PEOPLE_DEFAULTS.idTwo]});
        person_one = store.push('person', {id: PEOPLE_DEFAULTS.id, first_name: PEOPLE_DEFAULTS.first_name, last_name: PEOPLE_DEFAULTS.last_name});
        person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo, first_name: 'Scooter', last_name: 'McGavin'});
        person_three = store.push('person', {id: PEOPLE_DEFAULTS.unusedId, first_name: 'Aaron', last_name: 'Wat'});
    }
});

test('should render a selectbox when with options selected (initial state of selectize)', function(assert) {
    let ticket_cc_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_cc_options', ticket_cc_options);
    this.set('search', '');
    this.render(hbs`{{ticket-cc-power-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
});

test('should render a selectbox with bound options after type ahead for search', function(assert) {
    let ticket_cc_options = store.find('person');
    this.set('ticket', ticket);
    this.set('ticket_cc_options', ticket_cc_options);
    this.set('search', 'x');
    this.render(hbs`{{ticket-cc-power-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
    let $component = this.$(`${COMPONENT}`);
    run(() => { 
        this.$(`${PowerSelect}`).click(); 
    });
    assert.equal($(`${DROPDOWN}`).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal($('li.ember-power-select-option:eq(0)').text().trim(), PEOPLE_DEFAULTS.fullname);
    assert.equal($('li.ember-power-select-option:eq(1)').text().trim(), 'Scooter McGavin');
    assert.equal($('li.ember-power-select-option:eq(2)').text().trim(), 'Aaron Wat');
    assert.equal($(`${PowerSelect} > span`).length, 2);
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains(${PEOPLE_DEFAULTS.fullname})`));
    assert.ok($(`${PowerSelect} > span.ember-power-select-multiple-option:contains('Scooter McGavin')`));
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
//     this.render(hbs`{{ticket-cc-power-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
//     let $component = this.$(`${COMPONENT}`);
//     assert.equal($component.find('div.item').length, 2);
//     assert.equal($component.find('div.option').length, 3);
// });

// test('should render a selectbox with bound options and multiple set to true after type ahead for search', function(assert) {
//     let ticket_cc_options = store.find('person');
//     this.set('ticket', ticket);
//     this.set('ticket_cc_options', ticket_cc_options);
//     this.set('search', 'x');
//     this.render(hbs`{{ticket-cc-power-select ticket=ticket search=search ticket_cc_options=ticket_cc_options}}`);
//     let $component = this.$(`${COMPONENT}`);
//     assert.equal($component.find('div.item').length, 2);
//     assert.equal($component.find('div.option').length, 1);
//     this.$('.selectize-input input').trigger('click');
//     this.$('.selectize-input input').val('a').trigger('change');
//     run(() => { 
//         $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
//     });
//     assert.equal($component.find('div.item').length, 3);
//     assert.equal($component.find('div.option').length, 0);
//     assert.equal(ticket.get('cc').objectAt(2).get('id'), PEOPLE_DEFAULTS.unusedId);
//     let unique_people = ticket.get('cc_ids').toArray().uniq();
//     assert.equal(unique_people.get('length'), 3);
// });

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

