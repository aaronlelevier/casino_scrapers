import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

var store, uuid;

module('unit: ticket test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:category', 'model:ticket-status', 'model:ticket-priority', 'model:location', 'model:ticket-person', 'model:ticket-category', 'model:uuid', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
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

/*TICKET TO STATUS*/
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

test('ticket is dirty or related is dirty when existing status is altered (starting w/ nothing)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, status_fk: undefined});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: []});
    assert.equal(ticket.get('status'), undefined);
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

test('remove_status will remove the ticket id from the priority tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let status = store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: [9, TICKET_DEFAULTS.idOne]});
    assert.deepEqual(status.get('tickets'), [9, TICKET_DEFAULTS.idOne]);
    ticket.remove_status();
    assert.deepEqual(status.get('tickets'), [9]);
});

test('remove_status will do nothing if the ticket has no priority', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    assert.ok(!ticket.get('status'));
    ticket.remove_status();
    assert.ok(!ticket.get('status'));
});

/*TICKET TO CC*/
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

/*TICKET TOP LEVEL CATEGORY*/
test('top level category returned from route with many to many set up with only the top level category', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idThree});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idThree, parent_id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: null});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
    let top = ticket.get('top_level_category');
    assert.equal(top.get('id'), CATEGORY_DEFAULTS.idTwo);
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, parent_id: null});
    store.push('ticket-category', {id: 'xx', ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
    assert.equal(ticket.get('categories.length'), 4);
    top = ticket.get('top_level_category');
    assert.equal(top.get('id'), CATEGORY_DEFAULTS.unusedId);
});

test('top level category returned from route with many to many set up with only the top level category', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idThree});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idThree, parent_id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: null});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, parent_id: null});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
    ticket.change_category_tree(CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories.length'), 1);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.unusedId);
});

test('rollback categories will also restore the category tree (when top node changed)', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idThree});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idThree, parent_id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: null});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, parent_id: null});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_category_tree(CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories.length'), 1);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.unusedId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('rollback categories will also restore the category tree (when middle node changed)', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idThree});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idThree, parent_id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: null});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, parent_id: CATEGORY_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_category_tree(CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories.length'), 2);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.unusedId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('rollback categories will also restore the category tree (when leaf node changed)', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idThree});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idThree, parent_id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, parent_id: null});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, parent_id: CATEGORY_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo, TICKET_CATEGORY_DEFAULTS.idThree]});
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_category_tree(CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories.length'), 3);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.unusedId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    // ticket.rollbackRelated();
    // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    // assert.equal(ticket.get('categories.length'), 3);
    // assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.idTwo);
    // assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idThree);
    // assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idOne);
    // assert.equal(ticket.get('categories').objectAt(2).get('id'), CATEGORY_DEFAULTS.idTwo);
});

/*TICKET TO CATEGORIES M2M*/
test('categories property only returns the single matching item even when multiple people (categories) exist', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne]});
    ticket.add_category(CATEGORY_DEFAULTS.idTwo);
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 1);
    assert.equal(categories.objectAt(0).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('categories property returns multiple matching items when multiple people (categories) exist', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 2);
    assert.equal(categories.objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(categories.objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('categories property will update when the m2m array suddenly has the category pk (starting w/ empty array)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: []});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    assert.equal(ticket.get('categories').get('length'), 0);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly has the category pk', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly removes the category', (assert) => {
    let m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne]});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    assert.equal(ticket.get('categories').get('length'), 1);
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 0);
});

test('when categories is changed dirty tracking works as expected (removing)', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne]});
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 0);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 0);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when categories is changed dirty tracking works as expected (replacing)', (assert) => {
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne]});
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.equal(ticket.get('categories').get('length'), 0);
    ticket.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idTwo);
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    ticket.add_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback ticket will reset the previously used people (categories) when switching from valid categories array to nothing', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idTwo);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.remove_category(CATEGORY_DEFAULTS.idTwo);
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 0);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('categories').objectAt(0).get('id'), CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').objectAt(1).get('id'), CATEGORY_DEFAULTS.idTwo);
});

test('rollback categories will reset the previous people (categories) when switching from one category to another and saving in between each step', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(ticket.get('categories').get('length'), 2);
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    ticket.saveRelated();
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.add_category(CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('categoriesIsDirty'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    ticket.saveRelated();
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('categoriesIsNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('categories_ids computed returns a flat list of ids for each category', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.deepEqual(ticket.get('categories_ids'), [CATEGORY_DEFAULTS.idOne, CATEGORY_DEFAULTS.idTwo]);
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.deepEqual(ticket.get('categories_ids'), [CATEGORY_DEFAULTS.idTwo]);
});

test('ticket_categories_ids computed returns a flat list of ids for each category', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne});
    store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, category_pk: CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, ticket_categories_fks: [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]});
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.deepEqual(ticket.get('ticket_categories_ids'), [TICKET_CATEGORY_DEFAULTS.idOne, TICKET_CATEGORY_DEFAULTS.idTwo]);
    ticket.remove_category(CATEGORY_DEFAULTS.idOne);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.deepEqual(ticket.get('ticket_categories_ids'), [TICKET_CATEGORY_DEFAULTS.idTwo]);
});
/*END TICKET CATEGORY M2M*/

/*TICKET to PRIORITY*/
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

test('remove_priority will remove the ticket id from the priority tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priority = store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [9, TICKET_DEFAULTS.idOne]});
    assert.deepEqual(priority.get('tickets'), [9, TICKET_DEFAULTS.idOne]);
    ticket.remove_priority();
    assert.deepEqual(priority.get('tickets'), [9]);
});

test('remove_priority will do nothing if the ticket has no priority', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    assert.ok(!ticket.get('priority'));
    ticket.remove_priority();
    assert.ok(!ticket.get('priority'));
});

test('priority will save correctly as undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: undefined});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: []});
    ticket.saveRelated();
    let priority = ticket.get('priority');
    assert.equal(ticket.get('priority_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing priority is altered', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: []});
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_priority(TICKET_DEFAULTS.priorityTwoId);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing priority is altered (starting w/ nothing)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: undefined});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: []});
    assert.equal(ticket.get('priority'), undefined);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_priority(TICKET_DEFAULTS.priorityTwoId);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback priority will revert and reboot the dirty priority to clean', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, priority_fk: TICKET_DEFAULTS.priorityOneId});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: []});
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_priority(TICKET_DEFAULTS.priorityTwoId);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_priority(TICKET_DEFAULTS.priorityTwoId);
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.saveRelated();
    assert.equal(ticket.get('priority.id'), TICKET_DEFAULTS.priorityTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

/*TICKET to REQUESTER*/
test('requester property returns associated object or undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let requester = ticket.get('requester');
    let requester_id = ticket.get('requester_id');
    assert.equal(requester, undefined);
    assert.equal(requester_id, undefined);
});

test('requester can be added starting with no requester', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('requester can be updated with new name and is dirty tracked with _oldState', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, requester_id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('requester can be updated multiple times with new name and is dirty tracked with _oldState', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, requester_id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('requester can be updated and saved', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, requester_id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('requester can be saved as undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, requester_id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester();
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.save();
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('requester_id', undefined));
});

test('requester can be updated and rolled back', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, requester_id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.id});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_requester(PEOPLE_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollback();
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('requester_id'), PEOPLE_DEFAULTS.id);
});

/*TICKET to ASSIGNEE*/
test('assignee property returns associated object or undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [TICKET_DEFAULTS.idOne]});
    let assignee = ticket.get('assignee');
    assert.equal(assignee.get('id'), TICKET_DEFAULTS.assigneeOneId);
    assert.equal(assignee.get('name'), TICKET_DEFAULTS.assigneeOne);
    assignee.set('assigned_tickets', []);
    assignee = ticket.get('assignee');
    assert.equal(assignee, undefined);
});

test('change_assignee will append the ticket id to the new assignee assigned_tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let assignee = store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [9]});
    ticket.change_assignee(TICKET_DEFAULTS.assigneeOneId);
    assert.deepEqual(assignee.get('assigned_tickets'), [9, TICKET_DEFAULTS.idOne]);
});

test('change_assignee will remove the ticket id from the prev assignee assigned_tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let assignee = store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [9, TICKET_DEFAULTS.idOne]});
    store.push('person', {id: TICKET_DEFAULTS.assigneeTwoId, name: TICKET_DEFAULTS.assigneeTwo, assigned_tickets: []});
    ticket.change_assignee(TICKET_DEFAULTS.assigneeTwoId);
    assert.deepEqual(assignee.get('assigned_tickets'), [9]);
});

test('remove_assignee will remove the ticket id from the assignee assigned_tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let assignee = store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [9, TICKET_DEFAULTS.idOne]});
    assert.deepEqual(assignee.get('assigned_tickets'), [9, TICKET_DEFAULTS.idOne]);
    ticket.remove_assignee();
    assert.deepEqual(assignee.get('assigned_tickets'), [9]);
});

test('remove_assignee will do nothing if the ticket has no assignee', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    assert.ok(!ticket.get('assignee'));
    ticket.remove_assignee();
    assert.ok(!ticket.get('assignee'));
});

test('assignee will save correctly as undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: undefined});
    store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: []});
    ticket.saveRelated();
    let assignee = ticket.get('assignee');
    assert.equal(ticket.get('assignee_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing assignee is altered', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: TICKET_DEFAULTS.assigneeOneId});
    store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [TICKET_DEFAULTS.idOne]});
    store.push('person', {id: TICKET_DEFAULTS.assigneeTwoId, name: TICKET_DEFAULTS.assigneeTwo, assigned_tickets: []});
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_assignee(TICKET_DEFAULTS.assigneeTwoId);
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing assignee is altered (starting w/ nothing)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: undefined});
    store.push('person', {id: TICKET_DEFAULTS.assigneeTwoId, name: TICKET_DEFAULTS.assigneeTwo, assigned_tickets: []});
    assert.equal(ticket.get('assignee'), undefined);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_assignee(TICKET_DEFAULTS.assigneeTwoId);
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback assignee will revert and reboot the dirty assignee to clean', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, assignee_fk: TICKET_DEFAULTS.assigneeOneId});
    store.push('person', {id: TICKET_DEFAULTS.assigneeOneId, name: TICKET_DEFAULTS.assigneeOne, assigned_tickets: [TICKET_DEFAULTS.idOne]});
    store.push('person', {id: TICKET_DEFAULTS.assigneeTwoId, name: TICKET_DEFAULTS.assigneeTwo, assigned_tickets: []});
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_assignee(TICKET_DEFAULTS.assigneeTwoId);
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeOneId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_assignee(TICKET_DEFAULTS.assigneeTwoId);
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeTwoId);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.saveRelated();
    assert.equal(ticket.get('assignee.id'), TICKET_DEFAULTS.assigneeTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

/*TICKET to LOCATION*/
test('location property returns associated object or undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: LOCATION_DEFAULTS.idOne});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    assert.equal(location.get('id'), LOCATION_DEFAULTS.idOne);
});

test('change_location will append the ticket id to the new location tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    let location_two = store.push('location', {id: LOCATION_DEFAULTS.idTwo});
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.deepEqual(location.get('tickets'), []);
    assert.deepEqual(location_two.get('tickets'), [TICKET_DEFAULTS.idOne]);
});

test('change_location will remove the ticket id from the prev location tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, tickets: [9, TICKET_DEFAULTS.idOne]});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, tickets: []});
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.deepEqual(location.get('tickets'), [9]);
});

test('remove_location will remove the ticket id from the location tickets array', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, tickets: [9, TICKET_DEFAULTS.idOne]});
    assert.deepEqual(location.get('tickets'), [9, TICKET_DEFAULTS.idOne]);
    ticket.remove_location();
    assert.deepEqual(location.get('tickets'), [9]);
});

test('remove_location will do nothing if the ticket has no location', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    assert.ok(!ticket.get('location'));
    ticket.remove_location();
    assert.ok(!ticket.get('location'));
});

test('location will save correctly as undefined', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: undefined});
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, tickets: []});
    ticket.saveRelated();
    let location = ticket.get('location');
    assert.equal(ticket.get('location_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing location is altered', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: LOCATION_DEFAULTS.idOne});
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, tickets: []});
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing location is altered (starting w/ nothing)', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: undefined});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeName, tickets: []});
    assert.equal(ticket.get('location'), undefined);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback location will revert and reboot the dirty location to clean', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne, location_fk: LOCATION_DEFAULTS.idOne});
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName, tickets: [TICKET_DEFAULTS.idOne]});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: LOCATION_DEFAULTS.storeNameTwo, tickets: []});
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.rollbackRelated();
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    ticket.change_location(LOCATION_DEFAULTS.idTwo);
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    ticket.saveRelated();
    assert.equal(ticket.get('location.id'), LOCATION_DEFAULTS.idTwo);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});
