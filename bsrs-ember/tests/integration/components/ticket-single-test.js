import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

let store;

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
        translation.initialize(this);
    }
});

test('each status shows up as a valid select option', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status');
    assert.equal($component.find('option').length, 2);
    assert.equal($component.find('option:eq(0)').val(), TICKET_DEFAULTS.statusOneId);
    assert.equal($component.find('option:eq(1)').val(), TICKET_DEFAULTS.statusTwoId);
    assert.equal($component.find('option:eq(0)').text(), TICKET_DEFAULTS.statusOne);
    assert.equal($component.find('option:eq(1)').text(), TICKET_DEFAULTS.statusTwo);
});

test('the selected status reflects the status property on the ticket', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status');
    assert.equal($component.find('option:selected').val(), TICKET_DEFAULTS.statusTwoId);
});

test('on change will modify the underlying status property on ticket', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status');
    assert.equal($component.find('option:selected').val(), TICKET_DEFAULTS.statusTwoId);
    Ember.run(function() {
        $component.val(TICKET_DEFAULTS.statusOneId).trigger('change');
    });
    assert.equal($component.find('option:selected').val(), TICKET_DEFAULTS.statusOneId);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});
