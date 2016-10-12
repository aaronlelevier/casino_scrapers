import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import TPD from 'bsrs-ember/vendor/defaults/ticket-join-person';
import TCD from 'bsrs-ember/vendor/defaults/model-category';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LINK from 'bsrs-ember/vendor/defaults/link';


var store, ticket, link;

module('unit: ticket test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:person', 'model:category', 'model:ticket-status', 'model:ticket-priority', 'model:location', 'model:ticket-join-person', 'model:model-category', 'model:uuid', 'service:person-current', 'service:translations-fetcher', 'service:i18n', 'model:attachment', 'model:status', 'model:role', 'model:location-level', 'model:dtd', 'model:link']);
    run(() => {
      store.push('status', {id: SD.activeId, name: SD.activeName});
      store.push('role', {id: RD.idOne, name: RD.nameOne, location_level_fk: LLD.idOne});
    });
  }
});

test('ticket request field is dirty trackable', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  ticket.set('request', 'wat');
  assert.ok(ticket.get('isDirty'));
});

test('ticket request field is dirty trackable with existing', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, request: 'who'});
  ticket.set('request', 'wat');
  assert.ok(ticket.get('isDirty'));
});

test('ticket request field is not dirty with empty string and no existing', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  ticket.set('request', 'wat');
  ticket.set('request', '');
  assert.ok(ticket.get('isNotDirty'));
});

test('ticket requester field is dirty trackable', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  ticket.set('requester', 'wat');
  assert.ok(ticket.get('isDirty'));
});

test('ticket requester field is dirty trackable with existing', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, requester: 'who'});
  ticket.set('requester', 'wat');
  assert.ok(ticket.get('isDirty'));
});

test('ticket requester field is not dirty with empty string and no existing', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  ticket.set('requester', 'wat');
  ticket.set('requester', '');
  assert.ok(ticket.get('isNotDirty'));
});

test('ticket comment field is dirty trackable and no dirty with empty string', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  ticket.set('comment', 'wat');
  assert.ok(ticket.get('isDirty'));
  ticket.set('comment', '');
  assert.ok(ticket.get('isNotDirty'));
});

test('ticket is dirty or related is dirty when model has been updated', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, number: TD.numberOne, status_fk: TD.statusOneId});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.set('number', 'abc');
  assert.ok(ticket.get('isDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.set('number', TD.numberOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

// /*TICKET TO STATUS*/
test('ticket is dirty or related is dirty when existing status is altered', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, status_fk: TD.statusOneId});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo, tickets: []});
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_status(TD.statusTwoId);
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing status is altered (starting w/ nothing)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, status_fk: undefined});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo, tickets: []});
  assert.equal(ticket.get('status'), undefined);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_status(TD.statusTwoId);
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback status will revert and reboot the dirty status to clean', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, status_fk: TD.statusOneId});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo, tickets: []});
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_status(TD.statusTwoId);
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_status(TD.statusTwoId);
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('status property returns associated object or undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
  let status = ticket.get('status');
  assert.equal(status.get('id'), TD.statusOneId);
  assert.equal(status.get('name'), TD.statusOne);
  run(function() {
    store.push('ticket-status', {id: status.get('id'), tickets: []});
  });
  status = ticket.get('status');
  assert.equal(status, undefined);
});

test('change_status will append the ticket id to the new status tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [9]});
  ticket.change_status(TD.statusOneId);
  assert.deepEqual(status.get('tickets'), [9, TD.idOne]);
});

test('change_status will remove the ticket id from the prev status tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [9, TD.idOne]});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo, tickets: []});
  ticket.change_status(TD.statusTwoId);
  assert.deepEqual(status.get('tickets'), [9]);
});

test('status will save correctly as undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, status_fk: undefined});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: []});
  ticket.saveRelated();
  assert.equal(ticket.get('status_fk'), undefined);
});

// /*TICKET TO CC*/
test('cc property should return all associated cc or empty array', (assert) => {
  let m2m = store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  store.push('person', {id: PD.idOne});
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.equal(cc.objectAt(0).get('id'), PD.id);
  run(function() {
    store.push('ticket-join-person', {id: m2m.get('id'), removed: true});
  });
  assert.equal(ticket.get('cc').get('length'), 0);
});

test('cc property is not dirty when no cc present (undefined)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: undefined});
  store.push('person', {id: PD.id});
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsNotDirty'));
});

test('cc property is not dirty when no cc present (empty array)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: []});
  store.push('person', {id: PD.id});
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsNotDirty'));
});

test('cc property is not dirty when attr on person is changed', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  let person = store.push('person', {id: PD.id});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  run(function() {
    store.push('person', {id: PD.id, first_name: PD.first_name});
  });
  assert.ok(person.get('isDirty'));
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
});

test('removing a ticket-join-person will mark the ticket as dirty and reduce the associated cc models to zero', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  ticket.remove_cc(PD.id);
  assert.ok(ticket.get('ccIsDirty'));
  assert.equal(ticket.get('cc').get('length'), 0);
});

test('replacing a ticket-join-person with some other ticket-join-person still shows the ticket model as dirty', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id});
  const person_two = {id: PD.idTwo};
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.id);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  assert.equal(ticket.get('cc').get('length'), 0);
  ticket.add_cc(person_two);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.idTwo);
});

/*TICKET TO PEOPLE M2M*/
test('cc property only returns the single matching item even when multiple people (cc) exist', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.idTwo});
  const person_two = {id: PD.idTwo};
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  ticket.add_cc(person_two);
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.equal(cc.objectAt(0).get('id'), PD.idTwo);
});

test('cc property returns multiple matching items when multiple people (cc) exist', (assert) => {
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.id, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 2);
  assert.equal(cc.objectAt(0).get('id'), PD.id);
  assert.equal(cc.objectAt(1).get('id'), PD.idTwo);
});

test('cc property will update when the m2m array suddenly has the person pk (starting w/ empty array)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: []});
  let person = {id: PD.idOne};
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_cc(person);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.id);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('cc property will update when the m2m array suddenly has the person pk', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  store.push('person', {id: PD.id});
  let person_two = {id: PD.idTwo};
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_cc(person_two);
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.id);
  assert.equal(ticket.get('cc').objectAt(1).get('id'), PD.idTwo);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('cc property will update when the m2m array suddenly removes the person', (assert) => {
  let m2m = store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  store.push('person', {id: PD.id});
  assert.equal(ticket.get('cc').get('length'), 1);
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 0);
});

test('when cc is changed dirty tracking works as expected (removing)', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('add_cc will add back old join model after it was removed and dirty the model (multiple)', (assert) => {
  const ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  store.push('person', {id: PD.idTwo});
  const person_three = store.push('person', {id: PD.idThree});
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idTwo, ticket_pk: TD.idOne, person_pk: PD.idThree});
  ticket.remove_cc(person_three.get('id'));
  assert.equal(ticket.get('cc').get('length'), 1);
  ticket.add_cc({id: PD.idThree});
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.ok(ticket.get('ccIsNotDirty'));
});

test('multiple ticket\'s with same cc will rollback correctly', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('ticket-join-person', {id: TPD.idTwo, ticket_pk: TD.idTwo, person_pk: PD.id});
  store.push('person', {id: PD.id});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  let ticket_two = store.push('ticket', {id: TD.idTwo, ticket_cc_fks: [TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket_two.get('ccIsNotDirty'));
  ticket_two.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.equal(ticket_two.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket_two.get('ccIsDirty'));
  ticket_two.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(ticket_two.get('ccIsNotDirty'));
  assert.equal(ticket_two.get('cc').get('length'), 1);
  assert.ok(ticket_two.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  assert.equal(ticket_two.get('cc').get('length'), 1);
  assert.ok(ticket_two.get('ccIsNotDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket_two.get('cc').get('length'), 1);
  assert.ok(ticket_two.get('ccIsNotDirty'));
});

test('when cc is changed dirty tracking works as expected (replacing)', (assert) => {
  store.push('ticket-join-person', {id: TPD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id});
  const person_two = {id: PD.idTwo};
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne]});
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  ticket.remove_cc(PD.id);
  assert.ok(ticket.get('ccIsDirty'));
  assert.equal(ticket.get('cc').get('length'), 0);
  ticket.add_cc(person_two);
  assert.ok(ticket.get('ccIsDirty'));
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.idTwo);
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.id);
  ticket.add_cc(person_two);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when person is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.idTwo);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback ticket will reset the previously used people (cc) when switching from valid cc array to nothing', (assert) => {
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.idTwo);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_cc(PD.idTwo);
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 0);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.id);
  assert.equal(ticket.get('cc').objectAt(1).get('id'), PD.idTwo);
});

test('rollback cc will reset the previous people (cc) when switching from one person to another and saving in between each step', (assert) => {
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  const person_unused = {id: PD.unusedId};
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 2);
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('ccIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.save();
  ticket.saveRelated();
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_cc(person_unused);
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
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.deepEqual(ticket.get('cc_ids'), [PD.id, PD.idTwo]);
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.deepEqual(ticket.get('cc_ids'), [PD.idTwo]);
});

test('ticket_cc_ids computed returns a flat list of ids for each person', (assert) => {
  store.push('person', {id: PD.id});
  store.push('person', {id: PD.idTwo});
  store.push('ticket-join-person', {id: TPD.idOne, person_pk: PD.id, ticket_pk: TD.idOne});
  store.push('ticket-join-person', {id: TPD.idTwo, person_pk: PD.idTwo, ticket_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [TPD.idOne, TPD.idTwo]});
  assert.equal(ticket.get('cc').get('length'), 2);
  assert.deepEqual(ticket.get('ticket_cc_ids'), [TPD.idOne, TPD.idTwo]);
  ticket.remove_cc(PD.id);
  assert.equal(ticket.get('cc').get('length'), 1);
  assert.deepEqual(ticket.get('ticket_cc_ids'), [TPD.idTwo]);
});

/*TICKET TOP LEVEL CATEGORY*/
test('top level category returned from route with many to many set up with only the top level category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  let top = ticket.get('top_level_category');
  assert.equal(top.get('id'), CD.idTwo);
  run(() => {
    store.push('category', {id: CD.idTwo, parent_id: CD.unusedId});
    store.push('category', {id: CD.unusedId, parent_id: null});
    store.push('model-category', {id: 'xx', model_pk: TD.idOne, category_pk: CD.unusedId});
  });
  assert.equal(ticket.get('categories.length'), 4);
  top = ticket.get('top_level_category');
  assert.equal(top.get('id'), CD.unusedId);
});

test('top level category returned when parent_id is undefined (race condition for parent not yet loaded)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idOne);
  let top = ticket.get('top_level_category');
  assert.ok(!top);
});

test('changing top level category will reset category tree', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: null};
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.change_category_tree(unused);
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
});

test('if category is dirty, it will not save the pushed in category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = store.push('category', {id: CD.unusedId, name: CD.nameUnused, parent_id: null});
  const unused_json = {id: CD.unusedId, name: 'who', parent_id: null};
  assert.ok(unused.get('isNotDirtyOrRelatedNotDirty'));
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.change_category_tree(unused_json);
  assert.ok(unused.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
  assert.equal(ticket.get('top_level_category').get('name'), 'who');
  assert.ok(ticket.get('top_level_category').get('isNotDirtyOrRelatedNotDirty'));
});

test('if no existing category, it will save the pushed in category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused_json = {id: CD.unusedId, parent_id: null};
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.change_category_tree(unused_json);
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
});

test('removing top level category will reset category tree', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.remove_categories_down_tree(CD.idTwo);
  assert.equal(ticket.get('categories.length'), 0);
});

test('removing leaf node category will remove leaf node m2m join model', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.remove_categories_down_tree(CD.idThree);
  assert.equal(ticket.get('categories.length'), 2);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
});

test('removing middle node category will remove leaf node m2m join model', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  ticket.remove_categories_down_tree(CD.idOne);
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when top node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: null};
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_category_tree(unused);
  assert.equal(ticket.get('categories.length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when middle node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: CD.idTwo};
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_category_tree(unused);
  assert.equal(ticket.get('categories.length'), 2);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.unusedId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when leaf node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: CD.idOne};
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_category_tree(unused);
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idTwo);
  assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.unusedId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  // TODO:
  // ticket.rollback();
  // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  // assert.equal(ticket.get('categories.length'), 3);
  // assert.equal(ticket.get('top_level_category').get('id'), CD.idTwo);
  // assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idThree);
  // assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idOne);
  // assert.equal(ticket.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('category names computed will return a string of each category name in order of priority', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  store.push('model-category', {id: TCD.idThree, model_pk: TD.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('model-category', {id: 998, model_pk: TD.idTwo, category_pk: CD.unusedId});
  store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo, children_fks: [], level: 2});
  store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId, children_fks: [CD.idOne], level: 1});
  store.push('category', {id: CD.idThree, name: CD.nameThree, parent_id: null, children_fks: [CD.idTwo], level: 0});
  const unused = {id: CD.unusedId, name: 'unused', parent_id: null, children_fks: []};
  assert.equal(ticket.get('categories.length'), 3);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), CD.idTwo);
  assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), CD.idOne);
  assert.equal(ticket.get('top_level_category').get('id'), CD.idThree);
  assert.equal(ticket.get('category_names'), 'Loss Prevention &#8226; Electrical &#8226; Repair');
  ticket.change_category_tree(unused);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.equal(ticket.get('sorted_categories').get('length'), 1);
  assert.equal(ticket.get('top_level_category').get('id'), CD.unusedId);
  assert.equal(ticket.get('category_names'), 'unused');
});

/*TICKET TO CATEGORIES M2M*/
test('categories property only returns the single matching item even when multiple people (categories) exist', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idTwo});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  ticket.add_category(CD.idTwo);
  let categories = ticket.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idTwo);
});

test('categories property returns multiple matching items when multiple people (categories) exist', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idTwo, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idOne, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  let categories = ticket.get('categories');
  assert.equal(categories.get('length'), 2);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(1).get('id'), CD.idTwo);
});

test('categories property will update when the m2m array suddenly has the category pk (starting w/ empty array)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: []});
  let category = store.push('category', {id: CD.idOne});
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly has the category pk', (assert) => {
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  let category = store.push('category', {id: CD.idOne});
  let category_two = store.push('category', {id: CD.idTwo});
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_category(CD.idTwo);
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idTwo);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly removes the category', (assert) => {
  let m2m = store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  let category = store.push('category', {id: CD.idOne});
  assert.equal(ticket.get('categories').get('length'), 1);
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 0);
});

test('when categories is changed dirty tracking works as expected (removing)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  let category = store.push('category', {id: CD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when categories is changed dirty tracking works as expected (replacing)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  ticket.remove_category(CD.idOne);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.equal(ticket.get('categories').get('length'), 0);
  ticket.add_category(CD.idTwo);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idTwo);
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_category(CD.idOne);
  ticket.add_category(CD.idTwo);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_category(CD.idTwo);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback ticket will reset the previously used people (categories) when switching from valid categories array to nothing', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_category(CD.idTwo);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_category(CD.idTwo);
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(ticket.get('categories').objectAt(1).get('id'), CD.idTwo);
});

test('rollback categories will reset the previous categories when switching from one category to another and saving in between each step', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('category', {id: CD.unusedId});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(ticket.get('categories').get('length'), 2);
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.save();
  ticket.saveRelated();
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_category(CD.unusedId);
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('categoriesIsDirty'));
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.save();
  ticket.saveRelated();
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('model_categories_ids').length, 2);
  assert.equal(ticket.get('model_categories_fks').length, 2);
  assert.ok(ticket.get('categoriesIsNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.deepEqual(ticket.get('categories_ids'), [CD.idOne, CD.idTwo]);
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.deepEqual(ticket.get('categories_ids'), [CD.idTwo]);
});

test('model_categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: TD.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: TD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.deepEqual(ticket.get('model_categories_ids'), [TCD.idOne, TCD.idTwo]);
  ticket.remove_category(CD.idOne);
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.deepEqual(ticket.get('model_categories_ids'), [TCD.idTwo]);
});
/*END TICKET CATEGORY M2M*/

/*TICKET to PRIORITY*/
test('priority property returns associated object or undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
  let priority = ticket.get('priority');
  assert.equal(priority.get('id'), TD.priorityOneId);
  assert.equal(priority.get('name'), TD.priorityOne);
  run(function() {
    store.push('ticket-priority', {id: priority.get('id'), tickets: []});
  });
  priority = ticket.get('priority');
  assert.equal(priority, undefined);
});

test('change_priority will append the ticket id to the new priority tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [9]});
  ticket.change_priority(TD.priorityOneId);
  assert.deepEqual(priority.get('tickets'), [9, TD.idOne]);
});

test('change_priority will remove the ticket id from the prev priority tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [9, TD.idOne]});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo, tickets: []});
  ticket.change_priority(TD.priorityTwoId);
  assert.deepEqual(priority.get('tickets'), [9]);
});

test('priority will save correctly as undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, priority_fk: undefined});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: []});
  ticket.saveRelated();
  let priority = ticket.get('priority');
  assert.equal(ticket.get('priority_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing priority is altered', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo, tickets: []});
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_priority(TD.priorityTwoId);
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing priority is altered (starting w/ nothing)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, priority_fk: undefined});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo, tickets: []});
  assert.equal(ticket.get('priority'), undefined);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_priority(TD.priorityTwoId);
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback priority will revert and reboot the dirty priority to clean', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo, tickets: []});
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_priority(TD.priorityTwoId);
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_priority(TD.priorityTwoId);
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

/*TICKET to ASSIGNEE*/
test('assignee property returns associated object or undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [TD.idOne]});
  let assignee = ticket.get('assignee');
  assert.equal(assignee.get('id'), TD.assigneeOneId);
  assert.equal(assignee.get('name'), TD.assigneeOne);
  run(function() {
    store.push('person', {id: assignee.get('id'), assigned_tickets: []});
  });
  assignee = ticket.get('assignee');
  assert.equal(assignee, undefined);
});

test('change_assignee will append the ticket id to the new assignee assigned_tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  const person_json = {id: TD.assigneeOneId};
  let assignee = store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [9]});
  ticket.change_assignee(person_json);
  assert.deepEqual(assignee.get('assigned_tickets'), [9, TD.idOne]);
  assert.ok(assignee.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_assignee will remove the ticket id from the prev assignee assigned_tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let assignee = store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [9, TD.idOne]});
  store.push('person', {id: TD.assigneeTwoId, name: TD.assigneeTwo, assigned_tickets: []});
  const person_json = {id: TD.assigneeTwoId};
  ticket.change_assignee(person_json);
  assert.deepEqual(assignee.get('assigned_tickets'), [9]);
});

test('remove_assignee will remove the ticket id from the assignee assigned_tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let assignee = store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [9, TD.idOne]});
  assert.deepEqual(assignee.get('assigned_tickets'), [9, TD.idOne]);
  ticket.remove_assignee();
  assert.deepEqual(assignee.get('assigned_tickets'), [9]);
});

test('remove_assignee will do nothing if the ticket has no assignee', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  assert.ok(!ticket.get('assignee'));
  ticket.remove_assignee();
  assert.ok(!ticket.get('assignee'));
});

test('assignee will save correctly as undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, assignee_fk: undefined});
  store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: []});
  ticket.saveRelated();
  let assignee = ticket.get('assignee');
  assert.equal(ticket.get('assignee_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing assignee is altered', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, assignee_fk: TD.assigneeOneId});
  store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [TD.idOne]});
  const assignee_two = {id: TD.assigneeTwoId};
  assert.equal(ticket.get('assignee.id'), TD.assigneeOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_assignee(assignee_two);
  assert.equal(ticket.get('assignee.id'), TD.assigneeTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing assignee is altered (starting w/ nothing)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, assignee_fk: undefined});
  const assignee_two = {id: TD.assigneeTwoId};
  assert.equal(ticket.get('assignee'), undefined);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_assignee(assignee_two);
  assert.equal(ticket.get('assignee.id'), TD.assigneeTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback assignee will revert and reboot the dirty assignee to clean', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, assignee_fk: TD.assigneeOneId});
  store.push('person', {id: TD.assigneeOneId, name: TD.assigneeOne, assigned_tickets: [TD.idOne]});
  const assignee_two = {id: TD.assigneeTwoId};
  assert.equal(ticket.get('assignee.id'), TD.assigneeOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_assignee(assignee_two);
  assert.equal(ticket.get('assignee.id'), TD.assigneeTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('assignee.id'), TD.assigneeOneId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_assignee(assignee_two);
  assert.equal(ticket.get('assignee.id'), TD.assigneeTwoId);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  assert.equal(ticket.get('assignee.id'), TD.assigneeTwoId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

/*TICKET to LOCATION*/
test('location property returns associated object or undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, location_fk: LD.idOne});
  let location = store.push('location', {id: LD.idOne});
  assert.equal(location.get('id'), LD.idOne);
});

test('change_location will append the ticket id to the new location tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let location = store.push('location', {id: LD.idOne});
  let location_two = {id: LD.idTwo};
  ticket.change_location(location_two);
  assert.deepEqual(location.get('tickets'), []);
  let location_two_pushed = store.find('location', LD.idTwo);
  assert.deepEqual(location_two_pushed.get('tickets'), [TD.idOne]);
  assert.ok(location_two_pushed.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_location will remove the ticket id from the prev location tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [9, TD.idOne]});
  let location_two = {id: LD.idTwo};
  ticket.change_location(location_two);
  assert.deepEqual(location.get('tickets'), [9]);
});

test('remove_location will remove the ticket id from the location tickets array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [9, TD.idOne]});
  assert.deepEqual(location.get('tickets'), [9, TD.idOne]);
  ticket.remove_location();
  assert.deepEqual(location.get('tickets'), [9]);
});

test('remove_location will do nothing if the ticket has no location', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  assert.ok(!ticket.get('_location'));
  ticket.remove_location();
  assert.ok(!ticket.get('_location'));
});

test('location will save correctly as undefined', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, location_fk: undefined});
  store.push('location', {id: LD.idOne, name: LD.storeName, tickets: []});
  ticket.saveRelated();
  let location = ticket.get('_location');
  assert.equal(ticket.get('location_fk'), undefined);
});

test('ticket is dirty or related is dirty when existing location is altered', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, location_fk: LD.idOne});
  store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  const location_two = {id: LD.idTwo, name: LD.storeNameTwo, tickets: []};
  assert.equal(ticket.get('location.id'), LD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_location(location_two);
  assert.equal(ticket.get('location.id'), LD.idTwo);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when existing location is altered (starting w/ nothing)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, location_fk: undefined});
  const location_two = {id: LD.idTwo, name: LD.storeName, tickets: []};
  assert.equal(ticket.get('_location'), undefined);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_location(location_two);
  assert.equal(ticket.get('location.id'), LD.idTwo);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('rollback location will revert and reboot the dirty location to clean', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, location_fk: LD.idOne});
  store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let location_two = {id: LD.idTwo};
  assert.equal(ticket.get('location.id'), LD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_location(location_two);
  assert.equal(ticket.get('location.id'), LD.idTwo);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('location.id'), LD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.change_location(location_two);
  assert.equal(ticket.get('location.id'), LD.idTwo);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  //note: tickets are cleared if dirty on save
  // assert.equal(ticket.get('location.id'), LD.idTwo);
  // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('there is no leaky state when instantiating ticket (set)', (assert) => {
  let ticket_two;
  ticket = store.push('ticket', {id: TD.idOne, name: TD.nameOne});
  store.push('ticket', {id: TD.idOne, model_categories_fks: [TCD.idOne]});
  assert.deepEqual(ticket.get('model_categories_fks'), [TCD.idOne]);
  run(function() {
    ticket_two = store.push('ticket', {id: TD.idTwo, name: TD.nameOne});
  });
  assert.deepEqual(ticket_two.get('model_categories_fks'), []);
});

test('attachments property returns associated array or empty array', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: []});
  assert.equal(ticket.get('attachments').get('length'), 0);
  run(function() {
    store.push('attachment', {id: 8});
    store.push('ticket', {id: TD.idOne, current_attachment_fks: [8]});
  });
  assert.equal(ticket.get('attachments').get('length'), 1);
  run(function() {
    store.push('attachment', {id: 9});
  });
  assert.equal(ticket.get('attachments').get('length'), 1);
  run(function() {
    store.push('attachment', {id: 7});
    ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [8, 7]});
  });
  assert.equal(ticket.get('attachments').get('length'), 2);
});

test('add_attachment will add the attachment id to the tickets fks array', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne});
  let attachment = store.push('attachment', {id: 8});
  assert.equal(ticket.get('attachments').get('length'), 0);
  ticket.add_attachment(8);
  assert.deepEqual(ticket.get('current_attachment_fks'), [8]);
  assert.equal(ticket.get('attachments').get('length'), 1);
  ticket.add_attachment(8);
  assert.deepEqual(ticket.get('current_attachment_fks'), [8]);
  assert.equal(ticket.get('attachments').get('length'), 1);
});

test('remove_attachment will remove ticket_fk from the attachment', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [8]});
  let attachment = store.push('attachment', {id: 8});
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.deepEqual(ticket.get('current_attachment_fks'), [8]);
  ticket.remove_attachment(8);
  assert.deepEqual(ticket.get('current_attachment_fks'), []);
  assert.equal(ticket.get('attachments').get('length'), 0);
  ticket.remove_attachment(8);
  assert.deepEqual(ticket.get('current_attachment_fks'), []);
  assert.equal(ticket.get('attachments').get('length'), 0);
});

test('add and remove attachment work as expected', function(assert) {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: []});
  let attachment = store.push('attachment', {id: 8});
  assert.equal(ticket.get('attachments').get('length'), 0);
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  ticket.add_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 1);
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
});

test('ticket is dirty or related is dirty when attachment is added or removed (starting with none)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [], previous_attachments_fks: []});
  let attachment = store.push('attachment', {id: 8});
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_attachment(8);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is dirty or related is dirty when attachment is added or removed (starting with one attachment)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  let attachment = store.push('attachment', {id: 8, ticket_fk: TD.idOne});
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.add_attachment(8);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback attachments will revert and reboot the dirty attachments to clean', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  store.push('attachment', {id: 8, ticket_fk: TD.idOne});
  store.push('attachment', {id: 9});
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_attachment(9);
  assert.equal(ticket.get('attachments').get('length'), 2);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.rollback();
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_attachment(9);
  assert.equal(ticket.get('attachments').get('length'), 2);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('attachments').get('length'), 2);
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.saveRelated();
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('attachments').get('length'), 1);
});

test('attachments should be dirty even when the number of previous matches current', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  store.push('attachment', {id: 8, ticket_fk: TD.idOne});
  store.push('attachment', {id: 9});
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.remove_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.add_attachment(9);
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
});

test('ticket is not dirty after save and save related (starting with none)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [], previous_attachments_fks: []});
  let attachment = store.push('attachment', {id: 8});
  assert.equal(ticket.get('attachments').get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket.add_attachment(8);
  assert.equal(ticket.get('attachments').get('length'), 1);
  assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  ticket.save();
  ticket.saveRelated();
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('attachments').get('length'), 1);
});

test('status_class returns empty string when no status found and valid class when setup', (assert) => {
  let status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey, tickets: []});
  ticket = store.push('ticket', {id: TD.idOne});
  assert.equal(ticket.get('status'), undefined);
  assert.equal(ticket.get('status_class'), '');
  run(function() {
    store.push('ticket-status', {id: TD.statusOneId, tickets: [TD.idOne]});
  });
  assert.equal(ticket.get('status'), status);
  assert.equal(ticket.get('status_class'), 'ticket-status-new');
});

test('priority_class returns empty string when no priority found and valid class when setup', (assert) => {
  let priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey, tickets: []});
  ticket = store.push('ticket', {id: TD.idOne});
  assert.equal(ticket.get('priority'), undefined);
  assert.equal(ticket.get('priority_class'), '');
  run(function() {
    store.push('ticket-priority', {id: TD.priorityOneId, tickets: [TD.idOne]});
  });
  assert.equal(ticket.get('priority'), priority);
  assert.equal(ticket.get('priority_class'), 'ticket-priority-emergency');
});

test('dtd_fk - is not dirty tracked', assert => {
  ticket = store.push('ticket', {id: TD.idOne});
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  ticket = store.push('ticket', {id: TD.idOne, dtd_fk: 1});
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('patchSerialize - show full serialized object', assert => {
  ticket = store.push('ticket', {id: TD.idOne});
  link = store.push('link', {id: LINK.idOne});
  store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
  // status, priority
  link.change_status(TD.statusOneId);
  assert.equal(link.get('status.id'), TD.statusOneId);
  link.change_priority(TP.priorityOneId);
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  // categories
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('category', {id: CD.idThree});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  assert.equal(link.get('categories').get('length'), 1);
  let ret = ticket.patchSerialize(link);
  assert.deepEqual(ret, {
    id: TD.idOne,
    request: undefined,
    priority: TP.priorityOneId,
    status: TD.statusOneId,
    categories: [CD.idThree],
    dt_path: undefined,
  });
});

test('patchSerialize - show full serialized object (with optional values not present)', assert => {
  ticket = store.push('ticket', {id: TD.idOne});
  link = store.push('link', {id: LINK.idOne});
  // NO status, priority
  link.change_status(TD.statusOneId);
  assert.ok(!link.get('status.id'));
  assert.ok(!link.get('priority.id'));
  // NO categories
  assert.equal(link.get('categories').get('length'), 0);
  let ret = ticket.patchSerialize(link);
  assert.deepEqual(ret, {
    id: TD.idOne,
    request: undefined,
    priority: undefined,
    status: undefined,
    categories: [],
    dt_path: undefined,
  });
});
