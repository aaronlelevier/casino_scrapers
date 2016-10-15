import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-join-person';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';
import PERSON_LD from 'bsrs-ember/vendor/defaults/person-location';
import SD from 'bsrs-ember/vendor/defaults/status';
import RD from 'bsrs-ember/vendor/defaults/role';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TicketDeserializer from 'bsrs-ember/deserializers/ticket';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject, uuid, ticket_priority, ticket_status, ticket;

module('unit: ticket deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-list', 'model:person-list', 'model:ticket-join-person', 'model:model-category', 'model:ticket-status', 'model:ticket-priority', 'model:status', 'model:location', 'model:location-list','model:person-location', 'model:person', 'model:category', 'model:uuid', 'model:location-level', 'model:attachment', 'model:location-status', 'service:person-current','service:translations-fetcher','service:i18n', 'model:locale', 'model:role', 'model:general-status-list', 'model:ticket-priority-list', 'model:category-list', 'model:category-children', 'validator:presence', 'validator:length', 'validator:ticket-status', 'validator:ticket-categories']);
    uuid = this.container.lookup('model:uuid');
    subject = TicketDeserializer.create({simpleStore: store, uuid: uuid});
    run(() => {
      store.push('location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
      ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
      ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
      store.push('ticket-status', {id: TD.statusSevenId, name: TD.statusSeven, tickets: []});
      ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId, status_fk: TD.statusOneId});
      store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
      store.push('status', {id: SD.activeId, name: SD.activeName});
      store.push('role', {id: RD.idOne, name: RD.nameOne, location_level_fk: LLD.idOne});
    });
  }
});

test('ticket has appropriate detail tag', (assert) => {
  let json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(!ticket.get('grid'));
  assert.ok(ticket.get('detail'));
});

test('ticket assignee will be deserialized into its own store with no assignee (detail)', (assert) => {
  let json = TF.generate(TD.idOne);
  json.assignee = null;
  run(function() {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee_fk'), undefined);
  assert.equal(ticket.get('assignee'), undefined);
});

test('ticket assignee will be deserialized into its own store with no assignee (list)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  json.assignee = null;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee_fk'), undefined);
  assert.equal(ticket.get('assignee'), undefined);
});

test('deserialize detail with no existing assignee (detail)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(function() {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee_fk'), PD.idOne);
  assert.equal(ticket.get('assignee').get('id'), PD.idOne);
});

test('deserialize detail with existing assignee (detail)', (assert) => {
  ticket.set('assignee_fk', PD.unusedId);
  ticket.save();
  store.push('person', {id: PD.unusedId, assigned_tickets: [TD.idOne]});
  assert.equal(ticket.get('assignee').get('id'), PD.unusedId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  let json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, json.id);
  });
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').get('id'), PD.id);
});

test('deserialize list with no existing assignee (list)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  const people = store.find('person-list');
  assert.equal(people.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').id, PD.id);
});

test('deserialize list with existing assignee (list)', (assert) => {
  ticket.set('assignee_fk', PD.unusedId);
  ticket.save();
  store.push('person', {id: PD.unusedId, assigned_tickets: [TD.idOne]});
  assert.equal(ticket.get('assignee').get('id'), PD.unusedId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').id, PD.id);
});

test('ticket with existing assignee should not modify locations as it will not be in the json payload from the api', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, assignee_fk: PD.id});
  store.push('person-location', {id: PERSON_LD.idOne, person_pk: PD.id, location_pk: LD.idOne});
  store.push('person', {id: PD.id, person_locations_fks: [PERSON_LD.idOne], assigned_tickets: [TD.idOne]});
  assert.equal(ticket.get('assignee').get('id'), PD.id);
  assert.equal(ticket.get('assignee').get('locations').get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  let json = TF.generate_list(TD.idOne);
  assert.equal(json.assignee.locations, undefined);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').id, PD.id);
});

/*TICKET LOCATION 1-2-Many*/
test('ticket location will be deserialized into its own store when deserialize list is invoked (no existing location)', (assert) => {
  let location;
  location = store.push('location', {id: LD.idOne, name: LD.storeName});
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  location = store.find('location-list', LD.idOne);
  //location-list model not used in ticket list
  assert.deepEqual(location.length, undefined);
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(function() {
    subject.deserialize(response);
  });
  let location = store.findOne('location-list');
  assert.deepEqual(location.get('length'), undefined);
  ticket = store.find('ticket-list', TD.idOne);
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing non-wired location model)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (when ticket did not have location)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(function() {
    subject.deserialize(json, TD.idOne);
  });
  let location = store.findOne('location');
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing already-wired location model)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

// test('ticket location will be updated when server returns different location (list)', (assert) => {
//     let location;
//     ticket.set('location_fk', LD.idOne);
//     ticket.save();
//     location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
//     let json = TF.generate_list(TD.idOne);
//     delete json.cc;
//     json.location = {id: LD.idTwo, name: LD.storeNameTwo, location_level: LLD.idOne};
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     ticket = store.find('ticket-list', TD.idOne);
//     // assert.deepEqual(location.get('tickets'), []);
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     // assert.equal(location.get('tickets').length, 0);
//     const location_two = store.find('location', LD.idTwo);
//     // assert.equal(location_two.get('tickets').length, 1);
//     // assert.equal(ticket.get('location_fk'), LD.idTwo);
//     assert.equal(ticket.get('location.id'), LD.idTwo);
//     // assert.equal(ticket.get('location.location_level.id'), LLD.idOne);
// });

test('ticket location will be updated when server returns different location (detail)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  json.location = {id: LD.idTwo, name: LD.storeNameTwo, location_level: LLD.idOne};
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), []);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('location_fk'), LD.idTwo);
  assert.equal(ticket.get('location.id'), LD.idTwo);
  assert.equal(ticket.get('location.location_level.id'), LLD.idOne);
});

/*TICKET PRIORITY 1-2-Many*/
test('ticket priority will be deserialized into its own store when deserialize list is invoked', (assert) => {
  let json = TF.generate_list(TD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  ticket_priority = store.find('ticket-priority-list', TD.priorityOneId);
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  ticket_priority = store.find('ticket-priority-list', TD.priorityOneId);
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing non-wired priority model)', (assert) => {
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (when ticket did not exist before)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(function() {
    subject.deserialize(json, TD.idOne);
  });
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing already-wired priority model)', (assert) => {
  let ticket_priority;
  ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne, 99]});
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne, 99]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

// test('ticket priority will be updated when server returns different priority (list)', (assert) => {
//     let ticket_status, ticket_priority, ticket_priority_two;
//     ticket = store.push('ticket-list', {id: TD.idOne, priority_fk: TD.priorityOneId});
//     ticket_status = store.push('ticket-status-list', {id: TD.statusOneId, name: TD.statusOne});
//     ticket_priority = store.push('ticket-priority-list', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
//     ticket_priority_two = store.push('ticket-priority-list', {id: TD.priorityTwoId, name: TD.priorityOne, tickets: []});
//     let json = TF.generate_list(TD.idOne);
//     delete json.cc;
//     json.priority_fk = TD.priorityTwoId;
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     ticket = store.find('ticket-list', TD.idOne);
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     ticket_priority = store.find('ticket-priority-list', TD.priorityOneId);
//     assert.deepEqual(ticket_priority.get('tickets'), []);
//     // assert.deepEqual(ticket_priority_two.get('tickets'), [TD.idOne]);
//     // assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
//     // assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     // assert.equal(ticket.get('priority_fk'), TD.priorityTwoId);
// });

test('ticket priority will be updated when server returns different priority (detail)', (assert) => {
  let ticket_priority_two;
  ticket_priority_two = store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityOne, tickets: []});
  let json = TF.generate(TD.idOne);
  json.priority_fk = TD.priorityTwoId;
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_priority.get('tickets'), []);
  assert.deepEqual(ticket_priority_two.get('tickets'), [TD.idOne]);
  assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('priority_fk'), TD.priorityTwoId);
});

test('ticket status will be updated when server returns different status (detail)', (assert) => {
  let ticket_status_two;
  ticket_status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusOne, tickets: []});
  let json = TF.generate(TD.idOne);
  json.status_fk = TD.statusTwoId;
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_status.get('tickets'), []);
  assert.deepEqual(ticket_status_two.get('tickets'), [TD.idOne]);
  assert.equal(ticket.get('status.id'), TD.statusTwoId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('status_fk'), TD.statusTwoId);
});

test('ticket status will be deserialized into its own store when deserialize list is invoked', (assert) => {
  let json = TF.generate_list(TD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response);
  });
  ticket = store.find('ticket-list', TD.idOne);
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
});

/* TICKET TO STATUS */
test('ticket status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('status.id'), TD.statusOneId);
});

// test('ticket status will be updated when server returns same status (list)', (assert) => {
//     let json = TF.generate_list(TD.idOne);
//     delete json.cc;
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     ticket = store.find('ticket-list', TD.idOne);
//     ticket_status = store.find('ticket-status-list', TD.statusOneId);
//     assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
//     assert.ok(ticket.get('isNotDirty'));
//     assert.equal(ticket.get('status.id'), TD.statusOneId);
// });

test('ticket status will be updated when server returns same status (single)', (assert) => {
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('status.id'), TD.statusOneId);
});

// test('ticket status will be updated when server returns different status (list)', (assert) => {
//     let ticket_status_two, ticket_priority;
//     ticket_status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusOne, tickets: []});
//     ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
//     let json = TF.generate_list(TD.idOne);
//     delete json.cc;
//     json.status_fk = TD.statusTwoId;
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     ticket = store.find('ticket-list', TD.idOne);
//     ticket_status = store.find('ticket-status-list', TD.statusOneId);
//     assert.deepEqual(ticket_status.get('tickets'), []);
//     assert.deepEqual(ticket_status_two.get('tickets'), [TD.idOne]);
//     assert.equal(ticket.get('status.id'), TD.statusTwoId);
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     assert.equal(ticket.get('status_fk'), TD.statusTwoId);
// });

// test('newly inserted ticket will have non dirty status when deserialize list executes', (assert) => {
//     let ticket_status, ticket_status_two, ticket_priority;
//     store.clear('ticket');
//     ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: []});
//     ticket_status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusOne, tickets: []});
//     ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
//     let json = TF.generate(TD.idOne);
//     delete json.cc;
//     json.status_fk = TD.statusTwoId;
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     run(function() {
//         subject.deserialize(response);
//     });
//     assert.deepEqual(ticket_status.get('tickets'), []);
//     assert.deepEqual(ticket_status_two.get('tickets'), [TD.idOne]);
//     ticket = store.find('ticket', TD.idOne);
//     assert.equal(ticket.get('status.id'), TD.statusTwoId);
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     assert.equal(ticket.get('status_fk'), TD.statusTwoId);
// });

/*TICKET PERSON M2M*/
test('ticket-join-person m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  let response = TF.generate(TD.idOne);
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  cc = original.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.equal(cc.objectAt(0).get('fullname'), PD.fullname);
  assert.equal(store.find('ticket-join-person').get('length'), 1);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('ticket-status m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
  ticket.set('ticket_cc_fks', [TICKET_PERSON_DEFAULTS.idOne]);
  ticket.save();
  store.push('ticket-join-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id, fullname: PD.fullname});
  assert.equal(ticket.get('cc.length'), 1);
  let response = TF.generate(TD.idOne);
  let second_person = PF.get_no_related(PD.unusedId);
  response.cc = [PF.get_no_related(), second_person];
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  let cc = original.get('cc');
  assert.equal(cc.get('length'), 2);
  assert.equal(cc.objectAt(0).get('fullname'), PD.fullname);
  assert.equal(cc.objectAt(1).get('fullname'), PD.fullname);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('ticket-join-person').get('length'), 2);
});

test('ticket-join-person m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
  ticket.set('ticket_cc_fks', [TICKET_PERSON_DEFAULTS.idOne]);
  ticket.save();
  store.push('ticket-join-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
  store.push('person', {id: PD.id, name: PD.fullname});
  assert.equal(ticket.get('cc').get('length'), 1);
  let response = TF.generate(TD.id);
  let second_person = PF.get(PD.unusedId);
  let third_person = PF.get(PD.idTwo);
  response.cc = [second_person, third_person];
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  let cc = original.get('cc');
  assert.equal(cc.get('length'), 2);
  assert.equal(cc.objectAt(1).get('id'), PD.unusedId);
  assert.equal(cc.objectAt(0).get('id'), PD.idTwo);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('ticket-join-person').get('length'), 3);
});

test('model-category m2m added including parent id for categories without a fat parent model', (assert) => {
  store.clear('ticket');
  let response = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(ticket.get('ccIsNotDirty'));
  assert.equal(store.find('ticket-join-person').get('length'), 1);
  assert.equal(store.find('model-category').get('length'), 3);
  let categories = ticket.get('sorted_categories');
  assert.equal(categories.get('length'), 3);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(0).get('parent_id'), null);
  assert.deepEqual(categories.objectAt(0).get('children').mapBy('id'), [CD.idPlumbing, CD.idTwo]);
  assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
  assert.equal(categories.objectAt(1).get('parent_id'), CD.idOne);
  assert.deepEqual(categories.objectAt(1).get('children').mapBy('id'), [CD.idPlumbingChild]);
  assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
  assert.equal(categories.objectAt(2).get('parent_id'), CD.idPlumbing);
  assert.deepEqual(categories.objectAt(2).get('children').mapBy('id'), []);
});

test('ticket-join-person m2m added even when ticket did not exist before the deserializer executes', (assert) => {
  store.clear('ticket');
  let response = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  ticket = store.find('ticket', TD.idOne);
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.equal(cc.objectAt(0).get('id'), PD.id);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('ticket-join-person').get('length'), 1);
});

/*TICKET CATEGORY M2M*/
test('model-category m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  let response = TF.generate(TD.idOne);
  let categories = ticket.get('categories');
  assert.equal(categories.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  categories = original.get('sorted_categories');
  let m2m_categories = original.get('model_categories');
  let m2m_fks = original.get('model_categories_fks');
  let m2m_ids = original.get('model_categories_ids');
  assert.equal(categories.get('length'), 3);
  assert.equal(m2m_categories.get('length'), 3);
  assert.equal(m2m_fks.get('length'), 3);
  assert.equal(m2m_ids.get('length'), 3);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
  assert.ok(!categories.objectAt(0).get('parent_id'));
  assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
  assert.equal(categories.objectAt(1).get('name'), CD.nameRepairChild);
  assert.equal(categories.objectAt(1).get('parent_id'), CD.idOne);
  assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
  const ticket_cat = store.find('model-category');
  assert.equal(ticket_cat.get('length'), 3);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

// test('model-category m2m is set up correctly using deserialize list (starting with no m2m relationship)', (assert) => {
//     let json = TF.generate(TD.idOne);
//     delete json.cc;
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     let categories = ticket.get('categories');
//     assert.equal(categories.get('length'), 0);
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     let original = store.find('ticket', TD.idOne);
//     categories = original.get('sorted_categories');
//     assert.equal(categories.get('length'), 3);
//     assert.equal(categories.objectAt(0).get('id'), CD.idOne);
//     assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
//     assert.ok(!categories.objectAt(0).get('parent_id'));
//     assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
//     assert.equal(categories.objectAt(1).get('name'), CD.nameRepairChild);
//     assert.equal(categories.objectAt(1).get('parent_id'), CD.idOne);
//     assert.equal(store.find('model-category').get('length'), 3);
//     assert.ok(original.get('isNotDirty'));
//     assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
// });

test('ticket-category m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
  ticket.set('model_categories_fks', [TICKET_CD.idOne]);
  ticket.save();
  store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne, name: CD.nameOne});
  assert.equal(ticket.get('categories.length'), 1);
  let response = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  let categories = original.get('sorted_categories');
  assert.equal(categories.get('length'), 3);
  assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
  assert.equal(categories.objectAt(1).get('name'), CD.nameRepairChild);
  assert.equal(categories.objectAt(2).get('name'), CD.namePlumbingChild);
  assert.ok(original.get('isNotDirty'));
  original = store.find('ticket', TD.idOne);
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(original.get('categoriesIsNotDirty'));
  assert.equal(original.get('model_categories_fks').length, 3);
  assert.equal(original.get('model_categories_ids').length, 3);
  assert.equal(store.find('model-category').get('length'), 3);
});

// test('ticket-category m2m is added after deserialize list (starting with existing m2m relationship)', (assert) => {
//   let m2m, category;
//   ticket.set('model_categories_fks', [TICKET_CD.idOne]);
//   ticket.save();
//   m2m = store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
//   category = store.push('category', {id: CD.idOne, name: CD.nameOne});
//   assert.equal(ticket.get('categories.length'), 1);
//   let json = TF.generate_list(TD.idOne);
//   delete json.cc;
//   let response = {'count':1,'next':null,'previous':null,'results': [json]};
//   assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//   run(function() {
//     subject.deserialize(response);
//   });
//   let original = store.find('ticket-list', TD.idOne);
//   assert.ok(original.get('isNotDirty'));
//   assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
//   //TODO: what is this test doing
// });

test('model-category m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
  ticket.set('model_categories_fks', [TICKET_CD.idThree]);
  ticket.save();
  const m2m_unused = store.push('model-category', {id: TICKET_CD.idThree, model_pk: TD.idOne, category_pk: CD.unusedId});
  store.push('category', {id: CD.idOne, name: CD.nameOne});
  store.push('category', {id: CD.unusedId, name: CD.nameUnused});
  assert.equal(ticket.get('categories').get('length'), 1);
  let response = TF.generate(TD.id);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(ticket.get('categoriesIsNotDirty'));
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  let categories = original.get('sorted_categories');
  assert.equal(categories.get('length'), 3);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
  assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('model-category').get('length'), 4);
  assert.ok(m2m_unused.get('removed'));
});

// test('model-category m2m is removed when server payload no longer reflects what server has for m2m relationship (list)', (assert) => {
//     let m2m, category;
//     ticket.set('model_categories_fks', [TICKET_CD.idOne]);
//     ticket.save();
//     m2m = store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
//     category = store.push('category', {id: CD.idOne, name: CD.nameOne});
//     assert.equal(ticket.get('categories').get('length'), 1);
//     let json = TF.generate(TD.idOne);
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     let original = store.find('ticket', TD.idOne);
//     let categories = original.get('sorted_categories');
//     assert.equal(categories.get('length'), 3);
//     assert.equal(categories.objectAt(0).get('id'), CD.idOne);
//     assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
//     assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
//     assert.ok(original.get('isNotDirty'));
//     assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
//     assert.equal(store.find('model-category').get('length'), 3);
// });

// test('if existing category is dirty, it will not push it into the store', (assert) => {
//     const category = store.push('category', {id: CD.idOne, name: CD.nameOne});
//     assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
//     category.set('name', 'wwwwhat');
//     assert.ok(category.get('isDirtyOrRelatedDirty'));
//     let json = TF.generate(TD.idOne);
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     run(function() {
//         subject.deserialize(response);
//     });
//     let original = store.find('ticket', TD.idOne);
//     let categories = original.get('sorted_categories');
//     assert.equal(categories.get('length'), 3);
//     assert.equal(categories.objectAt(0).get('id'), CD.idOne);
//     assert.equal(categories.objectAt(0).get('name'), 'wwwwhat');
//     assert.ok(categories.objectAt(0).get('isDirtyOrRelatedDirty'));
//     assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
//     assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
//     assert.ok(original.get('isNotDirty'));
//     assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
//     assert.equal(store.find('model-category').get('length'), 3);
// });

test('model-category m2m added even when ticket did not exist before the deserializer executes (single)', (assert) => {
  let response = TF.generate(TD.idOne);
  response.categories.splice(1, 1);
  run(function() {
    subject.deserialize(response, TD.idOne);
  });
  ticket = store.find('ticket', TD.idOne);
  let categories = ticket.get('categories');
  assert.equal(categories.get('length'), 2);
  assert.equal(categories.objectAt(1).get('id'), CD.idOne);
  assert.equal(categories.objectAt(0).get('id'), CD.idPlumbingChild);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('model-category').get('length'), 2);
});

// test('model-category m2m added even when ticket did not exist before the deserializer executes (list)', (assert) => {
//     let json = TF.generate(TD.idOne);
//     delete json.cc;
//     json.categories.splice(1, 1);
//     let response = {'count':1,'next':null,'previous':null,'results': [json]};
//     run(function() {
//         subject.deserialize(response);
//     });
//     ticket = store.find('ticket', TD.idOne);
//     let categories = ticket.get('sorted_categories');
//     assert.equal(categories.get('length'), 2);
//     assert.equal(categories.objectAt(0).get('id'), CD.idOne);
//     assert.equal(categories.objectAt(1).get('id'), CD.idPlumbingChild);
//     assert.ok(ticket.get('isNotDirty'));
//     assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//     assert.equal(store.find('model-category').get('length'), 2);
// });

test('attachment added for each attachment on ticket', (assert) => {
  let json = TF.generate(TD.idOne);
  json.attachments = [TD.attachmentOneId];
  run(function() {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  let attachments = ticket.get('attachments');
  assert.equal(attachments.get('length'), 1);
  assert.equal(attachments.objectAt(0).get('id'), TD.attachmentOneId);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('attachment').get('length'), 1);
});

test('attachment added for each attachment on ticket (when ticket has existing attachments)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, current_attachment_fks: [TD.attachmentTwoId], previous_attachments_fks: [TD.attachmentTwoId]});
  ticket.save();
  store.push('attachment', {id: TD.attachmentTwoId});
  assert.equal(ticket.get('attachments').get('length'), 1);
  let json = TF.generate(TD.id);
  json.attachments = [TD.attachmentTwoId, TD.attachmentOneId];
  run(function() {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  let attachments = ticket.get('attachments');
  assert.equal(attachments.get('length'), 2);
  assert.equal(attachments.objectAt(0).get('id'), TD.attachmentTwoId);
  assert.equal(attachments.objectAt(1).get('id'), TD.attachmentOneId);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('attachment').get('length'), 2);
});

/* DT Path */

test('dt path deserialized correctly', assert => {
  let json = TF.generate(TD.idOne, TD.statusSevenId);
  json.assignee = null;
  run(() => {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('status_fk'), TD.statusSevenId);
  assert.equal(ticket.get('status.id'), TD.statusSevenId);
  assert.equal(ticket.get('dt_path').length, 2);
  assert.equal(ticket.get('dt_path')[0]['ticket']['id'], TD.idOne);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DTD.idOne);
});

//TODO: when attachments can be deleted (from ticket) we need a "server is the truth" test that removes in-memory relationships
