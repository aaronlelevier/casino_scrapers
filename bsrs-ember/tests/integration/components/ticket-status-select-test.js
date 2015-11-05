import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store, ticket, status_one, status_two, status_three, run = Ember.run;

moduleForComponent('ticket-status-select', 'integration: ticket-status-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
        status_one = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
        status_two = store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo});
        status_three = store.push('ticket-status', {id: TICKET_DEFAULTS.statusThreeId, name: TICKET_DEFAULTS.statusThree});
    }
});

test('should render a selectbox when status options are empty (initial state of selectize)', function(assert) {
    let statuses = Ember.A([]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 0);
    assert.ok(!ticket.get('status'));
});

test('should render a selectbox with bound options', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
});

test('should be able to select new status when one doesnt exist', function(assert) {
    let statuses = store.find('ticket-status');
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 3);
    assert.ok(!ticket.get('status'));
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
});

test('should be able to select same status when ticket already has a status', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(0)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
});

test('should be able to select new status when ticket already has a status', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TICKET_DEFAULTS.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
    this.$('.selectize-input input').trigger('click');
    run(() => { 
        $component.find('div.option:eq(1)').trigger('click').trigger('change'); 
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 3);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusTwoId);
});

