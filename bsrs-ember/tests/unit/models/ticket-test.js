import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';
import random from 'bsrs-ember/models/random';

var store, uuid;

module('unit: ticket test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:ticket-status', 'model:ticket-priority', 'model:ticket-person', 'model:uuid']);
        random.uuid = function() { return Ember.uuid(); };
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
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

test('cc property should return all associated cc or empty array', (assert) => {
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    store.push('ticket-person', {id: m2m.get('id'), removed: true});
    assert.equal(ticket.get('cc').get('length'), 0);
});

test('cc property is not dirty when no cc present (undefined)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: undefined});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsNotDirty'));
});

test('cc property is not dirty when no cc present (empty array)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: []});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsNotDirty'));
});

test('cc property is not dirty when attr on person is changed', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    person.set('first_name', PEOPLE_DEFAULTS.first_name);
    assert.ok(person.get('isDirty'));
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PEOPLE_DEFAULTS.first_name);
});

test('removing a ticket-person will mark the ticket as dirty and reduce the associated cc models to zero', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('ccIsDirty'));
    assert.equal(ticket.get('cc').get('length'), 0);
});

test('replacing a ticket-person with some other ticket-person still shows the ticket model as dirty', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('cc').get('length'), 0);
    ticket.add_person(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('id'), PEOPLE_DEFAULTS.idTwo);
});

/*TICKET TO PEOPLE M2M*/
test('cc property only returns the single matching item even when multiple people (cc) exist', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.idTwo});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    ticket.add_person(PEOPLE_DEFAULTS.idTwo);
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('id'), PEOPLE_DEFAULTS.idTwo);
});

test('cc property returns multiple matching items when multiple people (cc) exist', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 2);
    assert.equal(cc.objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    assert.equal(cc.objectAt(1).get('id'), PEOPLE_DEFAULTS.idTwo);
});

test('cc property will update when the m2m array suddenly has the person pk (starting w/ empty array)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: []});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('cc property will update when the m2m array suddenly has the person pk', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let person_two = store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_person(PEOPLE_DEFAULTS.idTwo);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.equal(ticket.get('cc').objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').objectAt(1).get('id'), PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('cc property will update when the m2m array suddenly removes the person', (assert) => {
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.equal(ticket.get('cc').get('length'), 1);
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 0);
});

test('when cc is changed dirty tracking works as expected (removing)', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when cc is changed dirty tracking works as expected (replacing)', (assert) => {
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne]});
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('ccIsDirty'));
    assert.equal(ticket.get('cc').get('length'), 0);
    ticket.add_person(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('ccIsDirty'));
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('id'), PEOPLE_DEFAULTS.idTwo);
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    ticket.add_person(PEOPLE_DEFAULTS.idTwo);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when person is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.idTwo);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback ticket will reset the previously used people (cc) when switching from valid cc array to nothing', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.idTwo);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_person(PEOPLE_DEFAULTS.idTwo);
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 0);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('cc').objectAt(0).get('id'), PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').objectAt(1).get('id'), PEOPLE_DEFAULTS.idTwo);
});

test('rollback cc will reset the previous people (cc) when switching from one person to another and saving in between each step', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('person', {id: PEOPLE_DEFAULTS.unusedId});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    assert.equal(ticket.get('cc').get('length'), 2);
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    ticket.saveRelated();
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_person(PEOPLE_DEFAULTS.unusedId);
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('ccIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    ticket.saveRelated();
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('ccIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('cc_ids computed returns a flat list of ids for each person', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.deepEqual(ticket.get('cc_ids'), [PEOPLE_DEFAULTS.id, PEOPLE_DEFAULTS.idTwo]);
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.deepEqual(ticket.get('cc_ids'), [PEOPLE_DEFAULTS.idTwo]);
});

test('ticket_cc_ids computed returns a flat list of ids for each person', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, person_pk: PEOPLE_DEFAULTS.id, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idTwo, person_pk: PEOPLE_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_people_fks: [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]});
    assert.equal(ticket.get('cc').get('length'), 2);
    assert.deepEqual(ticket.get('ticket_cc_ids'), [TICKET_PERSON_DEFAULTS.idOne, TICKET_PERSON_DEFAULTS.idTwo]);
    ticket.remove_person(PEOPLE_DEFAULTS.id);
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.deepEqual(ticket.get('ticket_cc_ids'), [TICKET_PERSON_DEFAULTS.idTwo]);
});

test('priority property returns associated object or undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    let priority = ticket.get('priority');
    assert.equal(priority.get('id'), TICKET_DEFAULTS.priorityOneId);
    assert.equal(priority.get('name'), TICKET_DEFAULTS.priorityOne);
    priority.set('tickets', []);
    priority = ticket.get('priority');
    assert.equal(priority, undefined);
});

test('change_priority will append the ticket id to the new priority tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [9]});
    ticket.change_priority(TICKET_DEFAULTS.priorityOneId);
    assert.deepEqual(priority.get('tickets'), [9, TICKET_DEFAULTS.idOne]);
});

test('change_priority will remove the ticket id from the prev priority tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [9, TICKET_DEFAULTS.idOne]});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: []});
    ticket.change_priority(TICKET_DEFAULTS.priorityTwoId);
    assert.deepEqual(priority.get('tickets'), [9]);
});
