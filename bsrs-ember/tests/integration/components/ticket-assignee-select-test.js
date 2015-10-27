import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, person_one, person_two, person_three, run = Ember.run;

moduleForComponent('ticket-assignee-select', 'integration: ticket-assignee-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: PEOPLE_DEFAULTS.idOne});
        person_one = store.push('person', {id: PEOPLE_DEFAULTS.idOne, first_name: PEOPLE_DEFAULTS.nameOne, username: PEOPLE_DEFAULTS.usernameOne, title: PEOPLE_DEFAULTS.titleOne});
        person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo, first_name: PEOPLE_DEFAULTS.nameTwo, username: PEOPLE_DEFAULTS.usernameTwo, title: PEOPLE_DEFAULTS.titleTwo});
        person_three = store.push('person', {id: PEOPLE_DEFAULTS.unusedId, first_name: PEOPLE_DEFAULTS.nameThree, username: PEOPLE_DEFAULTS.usernameThree, title: PEOPLE_DEFAULTS.titleThree});
    }
});

test('should render a selectbox when person options are empty (initial state of selectize)', function(assert) {
    let ticket_assignee_options = Ember.A([]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.render(hbs`{{ticket-assignee-select ticket=ticket ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$('.t-ticket-assignee-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 0);
    assert.ok(!ticket.get('assignee'));
});

test('should render a selectbox with bound options after type ahead for search_assignee', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$('.t-ticket-assignee-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
});

test('should be able to select new person when one doesnt exist', function(assert) {
    let ticket_assignee_options = store.find('person');
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$('.t-ticket-assignee-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 3);
    assert.ok(!ticket.get('assignee'));
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
});

test('should be able to select same person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$('.t-ticket-assignee-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
});

test('should be able to select new person when ticket already has a person', function(assert) {
    let ticket_assignee_options = store.find('person');
    person_one.set('assigned_tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('ticket_assignee_options', ticket_assignee_options);
    this.set('search_assignee', 'x');
    this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
    let $component = this.$('.t-ticket-assignee-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idOne);
    this.$('.selectize-input input').trigger('click');
    this.$('.selectize-input input').val('a').trigger('change');
    run(() => { 
        $component.find('div.option:eq(1)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('assignee').get('id'), PEOPLE_DEFAULTS.idTwo);
});

// test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
//     var done = assert.async();
//     let ticket_assignee_options = store.find('person');
//     this.set('ticket', ticket);
//     this.set('ticket_assignee_options', ticket_assignee_options);
//     this.set('search_assignee', undefined);
//     this.render(hbs`{{ticket-assignee-select ticket=ticket search_assignee=search_assignee ticket_assignee_options=ticket_assignee_options}}`);
//     let $component = this.$('.t-ticket-assignee-select');
//     this.$('.selectize-input input').val('x').trigger('keyup');
//     setTimeout(() => {
//         assert.equal(this.get('search_assignee'), undefined);
//         setTimeout(() => {
//             assert.equal(this.get('search_assignee'), 'x');
//             done();
//         }, 11);
//     }, 290);
// });


