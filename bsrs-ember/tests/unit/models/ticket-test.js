import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

var store, uuid;

module('unit: ticket test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
    }
});

test('ticket is dirty or related is dirty when model has been updated', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, number: TICKET_DEFAULTS.numberOne, subject: TICKET_DEFAULTS.subjectOne, status_fk: TICKET_DEFAULTS.statusOneId});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.set('number', 'abc');
    assert.ok(ticket.get('isDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.set('number', TICKET_DEFAULTS.numberOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.set('subject', TICKET_DEFAULTS.subjectTwo);
    assert.ok(ticket.get('isDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.set('subject', TICKET_DEFAULTS.subjectOne);
    assert.ok(ticket.get('isNotDirty'));
});

test('ticket is dirty or related is dirty when existing status is altered', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: []});
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_status(TICKET_DEFAULTS.statusTwoId);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback status will revert and reboot the dirty status to clean', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: []});
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_status(TICKET_DEFAULTS.statusTwoId);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_status(TICKET_DEFAULTS.statusTwoId);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.saveRelated();
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('status property returns associated object or undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let status = ticket.get('status');
    assert.equal(status.get('id'), TICKET_DEFAULTS.statusOneId);
    assert.equal(status.get('name'), TICKET_DEFAULTS.statusOne);
    status.set('tickets', []);
    status = ticket.get('status');
    assert.equal(status, undefined);
});

test('change_status will append the ticket id to the new status tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [9]});
    ticket.change_status(TICKET_DEFAULTS.statusOneId);
    assert.deepEqual(status.get('tickets'), [9, TICKET_DEFAULTS.idOne]);
});

test('change_status will remove the ticket id from the prev status tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [9, TICKET_DEFAULTS.idOne]});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: []});
    ticket.change_status(TICKET_DEFAULTS.statusTwoId);
    assert.deepEqual(status.get('tickets'), [9]);
});

test('status will save correctly as undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: undefined});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    ticket.saveRelated();
    let status = ticket.get('status');
    assert.equal(ticket.get('status_fk'), undefined);
});
