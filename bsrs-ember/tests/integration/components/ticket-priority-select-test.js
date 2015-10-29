import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, priority_one, priority_two, priority_three, run = Ember.run;

moduleForComponent('ticket-priority-select', 'integration: ticket-priority-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-priority']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
        priority_one = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
        priority_two = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo});
        priority_three = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityThreeId, name: TICKET_DEFAULTS.priorityThree});
    }
});

test('should render a selectbox when priority options are empty (initial state of selectize)', function(assert) {
    let priorities = Ember.A([]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 0);
    assert.ok(!ticket.get('priority'));
});

test('should render a selectbox with bound options', function(assert) {
    let priorities = store.find('ticket-priority');
    priority_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
});

test('should be able to select new priority when one doesnt exist', function(assert) {
    let priorities = store.find('ticket-priority');
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 3);
    assert.ok(!ticket.get('priority'));
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
});

test('should be able to select same priority when ticket already has a priority', function(assert) {
    let priorities = store.find('ticket-priority');
    priority_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
});

test('should be able to select new priority when ticket already has a priority', function(assert) {
    let priorities = store.find('ticket-priority');
    priority_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(1)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityTwoId);
});

