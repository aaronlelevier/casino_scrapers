import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TicketDeserializer from 'bsrs-ember/deserializers/ticket';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject;

module('unit: ticket deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
        subject = TicketDeserializer.create({store: store});
    }
});

test('ticket status will be deserialized into its own store when deserialize list is invoked', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns same status (list)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns same status (single)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns different status (list)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_status_two = store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    json.status = TICKET_DEFAULTS.statusTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), []);
    assert.deepEqual(ticket_status_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('status_fk'), TICKET_DEFAULTS.statusTwoId);
});

test('newly inserted ticket will have non dirty status when deserialize list executes', (assert) => {
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    let ticket_status_two = store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    json.status = TICKET_DEFAULTS.statusTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), []);
    assert.deepEqual(ticket_status_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
    let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('status_fk'), TICKET_DEFAULTS.statusTwoId);
});

test('ticket status will be updated when server returns different status (single)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_status_two = store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    json.status = TICKET_DEFAULTS.statusTwoId;
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), []);
    assert.deepEqual(ticket_status_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusTwoId);
});
