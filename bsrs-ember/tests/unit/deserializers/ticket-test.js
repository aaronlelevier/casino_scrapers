import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import TicketDeserializer from 'bsrs-ember/deserializers/ticket';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import random from 'bsrs-ember/models/random';

let store, subject, uuid;

module('unit: ticket deserializer test', {
    beforeEach() {
        random.uuid = function() { return Ember.uuid(); };
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-person', 'model:ticket-status', 'model:ticket-priority', 'model:person', 'model:uuid']);
        uuid = this.container.lookup('model:uuid');
        subject = TicketDeserializer.create({store: store, uuid: uuid});
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
    }
});

test('ticket priority will be deserialized into its own store when deserialize list is invoked', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), [TICKET_DEFAULTS.idOne]);
    let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing non-wired priority model)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (when ticket did not exist before)', (assert) => {
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    subject.deserialize(json, TICKET_DEFAULTS.idOne);
    assert.deepEqual(ticket_priority.get('tickets'), [TICKET_DEFAULTS.idOne]);
    let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing already-wired priority model)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [99]});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), [99, TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
});

test('ticket priority will be updated when server returns different priority (list)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority_two = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityOne, tickets: []});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    delete json.cc;
    json.priority = TICKET_DEFAULTS.priorityTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), []);
    assert.deepEqual(ticket_priority_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('priority_fk'), TICKET_DEFAULTS.priorityTwoId);
});

test('ticket priority will be updated when server returns different priority (detail)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority_two = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityOne, tickets: []});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    json.priority = TICKET_DEFAULTS.priorityTwoId;
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), []);
    assert.deepEqual(ticket_priority_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('priority_fk'), TICKET_DEFAULTS.priorityTwoId);
});

test('ticket status will be deserialized into its own store when deserialize list is invoked', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns same status (list)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    delete json.cc;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns same status (single)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TICKET_DEFAULTS.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TICKET_DEFAULTS.statusOneId);
});

test('ticket status will be updated when server returns different status (list)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_status_two = store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    delete json.cc;
    json.status = TICKET_DEFAULTS.statusTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
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
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let json = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    delete json.cc;
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

test('ticket-person m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let response = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 0);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TICKET_DEFAULTS.idOne);
    let original = store.find('ticket', TICKET_DEFAULTS.idOne);
    cc = original.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('fullname'), PEOPLE_DEFAULTS.fullname);
    assert.equal(store.find('ticket-person').get('length'), 1);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('ticket-status m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, name: PEOPLE_DEFAULTS.fullname});
    assert.equal(ticket.get('cc.length'), 1);
    let response = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let second_person = PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.unusedId);
    response.cc = [PEOPLE_FIXTURES.get(), second_person];
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TICKET_DEFAULTS.idOne);
    let original = store.find('ticket', TICKET_DEFAULTS.idOne);
    let cc = original.get('cc');
    assert.equal(cc.get('length'), 2);
    assert.equal(cc.objectAt(0).get('name'), PEOPLE_DEFAULTS.fullname);
    assert.equal(cc.objectAt(1).get('name'), PEOPLE_DEFAULTS.fullname);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 2);
});

test('ticket-person m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: TICKET_DEFAULTS.statusOneId, priority_fk: TICKET_DEFAULTS.priorityOneId, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id, name: PEOPLE_DEFAULTS.fullname});
    assert.equal(ticket.get('cc').get('length'), 1);
    let response = TICKET_FIXTURES.generate(TICKET_DEFAULTS.id);
    let second_person = PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.unusedId);
    let third_person = PEOPLE_FIXTURES.get(PEOPLE_DEFAULTS.idTwo);
    response.cc = [second_person, third_person];
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TICKET_DEFAULTS.idOne);
    let original = store.find('ticket', TICKET_DEFAULTS.idOne);
    let cc = original.get('cc');
    assert.equal(cc.get('length'), 2);
    assert.equal(cc.objectAt(0).get('id'), PEOPLE_DEFAULTS.unusedId);
    assert.equal(cc.objectAt(1).get('id'), PEOPLE_DEFAULTS.idTwo);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 3);
});

test('ticket-person m2m added even when ticket did not exist before the deserializer executes', (assert) => {
    let response = TICKET_FIXTURES.generate(TICKET_DEFAULTS.idOne);
    let ticket_status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket_priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    response.cc = [PEOPLE_FIXTURES.get()];
    subject.deserialize(response, TICKET_DEFAULTS.idOne);
    let ticket = store.find('ticket', TICKET_DEFAULTS.idOne);
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 1);
});
