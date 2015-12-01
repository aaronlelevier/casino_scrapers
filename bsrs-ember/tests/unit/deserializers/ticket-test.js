import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TICKET_PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-person';
import TICKET_CD from 'bsrs-ember/vendor/defaults/ticket-category';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TicketDeserializer from 'bsrs-ember/deserializers/ticket';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject, uuid, person_deserializer, location_level_deserializer, location_deserializer, category_deserializer, ticket_priority, ticket_status, ticket;

module('unit: ticket deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-person', 'model:ticket-category', 'model:ticket-status', 'model:ticket-priority', 'model:person', 'model:category', 'model:uuid', 'model:location-level', 'model:location', 'model:attachment', 'service:person-current','service:translations-fetcher','service:i18n']);
        uuid = this.container.lookup('model:uuid');
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        location_deserializer = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        person_deserializer = PersonDeserializer.create({store: store, uuid: uuid, LocationDeserializer: location_deserializer});
        category_deserializer = CategoryDeserializer.create({store: store});
        subject = TicketDeserializer.create({store: store, uuid: uuid, PersonDeserializer: person_deserializer, CategoryDeserializer: category_deserializer});
        ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
        ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
        ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId, status_fk: TD.statusOneId});
    }
});

test('ticket requester will be deserialized into its own store when deserialize detail is invoked (with no existing requester)', (assert) => {
    ticket.set('requester_id', PD.unusedId);
    ticket.save();
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, json.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('requester').get('id'), PD.id);
});

test('ticket will be deserialized without error when requester as null (not a required field currently)', (assert) => {
    assert.equal(ticket.get('requester'), undefined);
    let json = TF.generate(TD.idOne);
    delete json.requester;
    json.requester = null;
    subject.deserialize(json, json.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('requester'), undefined);
});

test('ticket requester will be deserialized into its own store when deserialize detail is invoked (with existing requester)', (assert) => {
    store.push('person', {id: PD.unusedId});
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, json.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('requester_id'), PD.idOne);
});

test('ticket assignee will be deserialized into its own store when deserialize detail is invoked (with no existing assignee)(detail)', (assert) => {
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, json.id);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('assignee').get('id'), PD.id);
});

test('ticket assignee will be deserialized into its own store when deserialize detail is invoked (with existing assignee)(detail)', (assert) => {
    ticket.set('assignee_fk', PD.unusedId);
    ticket.save();
    store.push('person', {id: PD.unusedId, assigned_tickets: [TD.idOne]});
    assert.equal(ticket.get('assignee').get('id'), PD.unusedId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, json.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('assignee').get('id'), PD.id);
});

test('ticket assignee will be deserialized into its own store when deserialize detail is invoked (with no existing assignee)(list)', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('assignee').get('id'), PD.id);
});

test('ticket assignee will be deserialized into its own store when deserialize detail is invoked (with existing assignee)(list)', (assert) => {
    ticket.set('assignee_fk', PD.unusedId);
    ticket.save();
    store.push('person', {id: PD.unusedId, assigned_tickets: [TD.idOne]});
    assert.equal(ticket.get('assignee').get('id'), PD.unusedId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('assignee').get('id'), PD.id);
});

/*TICKET LOCATION 1-2-Many*/
test('ticket location will be deserialized into its own store when deserialize list is invoked (no existing location)', (assert) => {
    let location = store.push('location', {id: LD.idOne, name: LD.storeName});
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(location.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let location = store.findOne('location'); 
    assert.deepEqual(location.get('tickets'), [TD.idOne]);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing non-wired location model)', (assert) => {
    ticket.set('location_fk', LD.idOne);
    ticket.save();
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(location.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (when ticket did not have location)', (assert) => {
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, TD.idOne);
    let location = store.findOne('location'); 
    assert.deepEqual(location.get('tickets'), [TD.idOne]);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing already-wired location model)', (assert) => {
    ticket.set('location_fk', LD.idOne);
    ticket.save();
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(location.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be updated when server returns different location (list)', (assert) => {
    ticket.set('location_fk', LD.idOne);
    ticket.save();
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    delete json.cc;
    json.location = {id: LD.idTwo, name: LD.storeNameTwo};
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(location.get('tickets'), []);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idTwo);
});

test('ticket location will be updated when server returns different location (detail)', (assert) => {
    ticket.set('location_fk', LD.idOne);
    ticket.save();
    let location = store.push('location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    json.location = {id: LD.idTwo, name: LD.storeNameTwo};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(location.get('tickets'), []);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('location.id'), LD.idTwo);
});

/*TICKET PRIORITY 1-2-Many*/
test('ticket priority will be deserialized into its own store when deserialize list is invoked', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing non-wired priority model)', (assert) => {
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (when ticket did not exist before)', (assert) => {
    let json = TF.generate(TD.idOne);
    subject.deserialize(json, TD.idOne);
    assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (with existing already-wired priority model)', (assert) => {
    let ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne, 99]});
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne, 99]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

test('ticket priority will be updated when server returns different priority (list)', (assert) => {
    let ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
    let ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    let ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
    let ticket_priority_two = store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityOne, tickets: []});
    let json = TF.generate(TD.idOne);
    delete json.cc;
    json.priority = TD.priorityTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_priority.get('tickets'), []);
    assert.deepEqual(ticket_priority_two.get('tickets'), [TD.idOne]);
    assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('priority_fk'), TD.priorityTwoId);
});

test('ticket priority will be updated when server returns different priority (detail)', (assert) => {
    let ticket_priority_two = store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityOne, tickets: []});
    let json = TF.generate(TD.idOne);
    json.priority = TD.priorityTwoId;
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_priority.get('tickets'), []);
    assert.deepEqual(ticket_priority_two.get('tickets'), [TD.idOne]);
    assert.equal(ticket.get('priority.id'), TD.priorityTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('priority_fk'), TD.priorityTwoId);
});

test('ticket status will be deserialized into its own store when deserialize list is invoked', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TD.statusOneId);
});

/* TICKET TO STATUS */
test('ticket status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TD.statusOneId);
});

test('ticket status will be updated when server returns same status (list)', (assert) => {
    let json = TF.generate(TD.idOne);
    delete json.cc;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TD.statusOneId);
});

test('ticket status will be updated when server returns same status (single)', (assert) => {
    let json = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(json, ticket.get('id'));
    assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
    assert.ok(ticket.get('isNotDirty'));
    assert.equal(ticket.get('status.id'), TD.statusOneId);
});

test('ticket status will be updated when server returns different status (list)', (assert) => {
    let ticket_status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusOne, tickets: []});
    let ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    delete json.cc;
    json.status = TD.statusTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), []);
    assert.deepEqual(ticket_status_two.get('tickets'), [TD.idOne]);
    assert.equal(ticket.get('status.id'), TD.statusTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('status_fk'), TD.statusTwoId);
});

test('newly inserted ticket will have non dirty status when deserialize list executes', (assert) => {
    store.clear('ticket');
    let ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: []});
    let ticket_status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusOne, tickets: []});
    let ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
    let json = TF.generate(TD.idOne);
    delete json.cc;
    json.status = TD.statusTwoId;
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(ticket_status.get('tickets'), []);
    assert.deepEqual(ticket_status_two.get('tickets'), [TD.idOne]);
    let ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('status.id'), TD.statusTwoId);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(ticket.get('status_fk'), TD.statusTwoId);
});

/*TICKET PERSON M2M*/
test('ticket-person m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
    let response = TF.generate(TD.idOne);
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 0);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    cc = original.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('fullname'), PD.fullname);
    assert.equal(store.find('ticket-person').get('length'), 1);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('ticket-status m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    ticket.set('ticket_people_fks', [TICKET_PERSON_DEFAULTS.idOne]);
    ticket.save();
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
    let person = store.push('person', {id: PD.id, fullname: PD.fullname});
    assert.equal(ticket.get('cc.length'), 1);
    let response = TF.generate(TD.idOne);
    let second_person = PF.get(PD.unusedId);
    response.cc = [PF.get(), second_person];
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    let cc = original.get('cc');
    assert.equal(cc.get('length'), 2);
    assert.equal(cc.objectAt(0).get('fullname'), PD.fullname);
    assert.equal(cc.objectAt(1).get('fullname'), PD.fullname);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 2);
});

test('ticket-person m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
    ticket.set('ticket_people_fks', [TICKET_PERSON_DEFAULTS.idOne]);
    ticket.save();
    let m2m = store.push('ticket-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
    let person = store.push('person', {id: PD.id, name: PD.fullname});
    assert.equal(ticket.get('cc').get('length'), 1);
    let response = TF.generate(TD.id);
    let second_person = PF.get(PD.unusedId);
    let third_person = PF.get(PD.idTwo);
    response.cc = [second_person, third_person];
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    let cc = original.get('cc');
    assert.equal(cc.get('length'), 2);
    assert.equal(cc.objectAt(0).get('id'), PD.unusedId);
    assert.equal(cc.objectAt(1).get('id'), PD.idTwo);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 3);
});

test('ticket-category m2m added including parent id for categories without a fat parent model', (assert) => {
    store.clear('ticket');
    let response = TF.generate(TD.idOne);
    response.cc = [PF.get()];
    subject.deserialize(response, TD.idOne);
    let ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 1);
    assert.equal(store.find('ticket-category').get('length'), 3);
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(1).get('id'), CD.idOne);
    assert.equal(categories.objectAt(1).get('parent_id'), null);
    assert.deepEqual(categories.objectAt(1).get('children_fks'), [CD.idPlumbing, CD.idTwo]);
    assert.equal(categories.objectAt(0).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(0).get('parent_id'), CD.idOne);
    assert.deepEqual(categories.objectAt(0).get('children_fks'), [CD.idPlumbingChild]);
    assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
    assert.equal(categories.objectAt(2).get('parent_id'), CD.idPlumbing);
    assert.deepEqual(categories.objectAt(2).get('children_fks'), []);
});

test('ticket-person m2m added even when ticket did not exist before the deserializer executes', (assert) => {
    store.clear('ticket');
    let response = TF.generate(TD.idOne);
    response.cc = [PF.get()];
    subject.deserialize(response, TD.idOne);
    let ticket = store.find('ticket', TD.idOne);
    let cc = ticket.get('cc');
    assert.equal(cc.get('length'), 1);
    assert.equal(cc.objectAt(0).get('id'), PD.id);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-person').get('length'), 1);
});

/*TICKET CATEGORY M2M*/
test('ticket-category m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
    let response = TF.generate(TD.idOne);
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 0);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(1).get('id'), CD.idOne);
    assert.equal(categories.objectAt(1).get('name'), CD.nameOne);
    assert.ok(!categories.objectAt(1).get('parent_id'));
    assert.equal(categories.objectAt(0).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(0).get('name'), CD.nameRepairChild);
    assert.equal(categories.objectAt(0).get('parent_id'), CD.idOne);
    assert.equal(categories.objectAt(0).get('parent').get('name'), CD.nameOne);
    assert.equal(store.find('ticket-category').get('length'), 3);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('ticket-category m2m is set up correctly using deserialize list (starting with no m2m relationship)', (assert) => {
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 0);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    let original = store.find('ticket', TD.idOne);
    categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(1).get('id'), CD.idOne);
    assert.equal(categories.objectAt(1).get('name'), CD.nameOne);
    assert.ok(!categories.objectAt(1).get('parent_id'));
    assert.equal(categories.objectAt(0).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(0).get('name'), CD.nameRepairChild);
    assert.equal(categories.objectAt(0).get('parent_id'), CD.idOne);
    assert.equal(categories.objectAt(0).get('parent').get('name'), CD.nameOne);
    assert.equal(store.find('ticket-category').get('length'), 3);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

test('ticket-status m2m is added after deserialize single (starting with existing m2m relationship)', (assert) => {
    ticket.set('ticket_categories_fks', [TICKET_CD.idOne]);
    ticket.save();
    let m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne});
    assert.equal(ticket.get('categories.length'), 1);
    let response = TF.generate(TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    let categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
    assert.equal(categories.objectAt(1).get('name'), CD.nameRepairChild);
    assert.equal(categories.objectAt(2).get('name'), CD.namePlumbingChild);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 3);
});

test('ticket-status m2m is added after deserialize list (starting with existing m2m relationship)', (assert) => {
    ticket.set('ticket_categories_fks', [TICKET_CD.idOne]);
    ticket.save();
    let m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne});
    assert.equal(ticket.get('categories.length'), 1);
    let json = TF.generate(TD.idOne);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    let original = store.find('ticket', TD.idOne);
    let categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
    assert.equal(categories.objectAt(1).get('name'), CD.nameRepairChild);
    assert.equal(categories.objectAt(2).get('name'), CD.namePlumbingChild);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 3);
});

test('ticket-category m2m is removed when server payload no longer reflects what server has for m2m relationship', (assert) => {
    ticket.set('ticket_categories_fks', [TICKET_CD.idOne]);
    ticket.save();
    let m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne});
    assert.equal(ticket.get('categories').get('length'), 1);
    let response = TF.generate(TD.id);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response, TD.idOne);
    let original = store.find('ticket', TD.idOne);
    let categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(0).get('id'), CD.idOne);
    assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 3);
});

test('ticket-category m2m is removed when server payload no longer reflects what server has for m2m relationship (list)', (assert) => {
    ticket.set('ticket_categories_fks', [TICKET_CD.idOne]);
    ticket.save();
    let m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne});
    assert.equal(ticket.get('categories').get('length'), 1);
    let json = TF.generate(TD.id);
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    subject.deserialize(response);
    let original = store.find('ticket', TD.idOne);
    let categories = original.get('categories');
    assert.equal(categories.get('length'), 3);
    assert.equal(categories.objectAt(0).get('id'), CD.idOne);
    assert.equal(categories.objectAt(1).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(2).get('id'), CD.idPlumbingChild);
    assert.ok(original.get('isNotDirty'));
    assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 3);
});

test('ticket-category m2m added even when ticket did not exist before the deserializer executes (single)', (assert) => {
    let response = TF.generate(TD.idOne);
    delete response.categories[1];
    subject.deserialize(response, TD.idOne);
    let ticket = store.find('ticket', TD.idOne);
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 2);
    assert.equal(categories.objectAt(0).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(1).get('id'), CD.idPlumbingChild);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 2);
});

test('ticket-category m2m added even when ticket did not exist before the deserializer executes (list)', (assert) => {
    let json = TF.generate(TD.idOne);
    delete json.categories[1];
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    let ticket = store.find('ticket', TD.idOne);
    let categories = ticket.get('categories');
    assert.equal(categories.get('length'), 2);
    assert.equal(categories.objectAt(0).get('id'), CD.idPlumbing);
    assert.equal(categories.objectAt(1).get('id'), CD.idPlumbingChild);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('ticket-category').get('length'), 2);
});

test('attachment added for each attachment on ticket', (assert) => {
    let json = TF.generate(TD.idOne);
    json.attachments = [TD.attachmentOneId];
    subject.deserialize(json, json.id);
    let ticket = store.find('ticket', TD.idOne);
    let attachments = ticket.get('attachments');
    assert.equal(attachments.get('length'), 1);
    assert.equal(attachments.objectAt(0).get('id'), TD.attachmentOneId);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('attachment').get('length'), 1);
});

test('attachment added for each attachment on ticket (when ticket has existing attachments)', (assert) => {
    ticket = store.push('ticket', {id: TD.idOne, ticket_attachments_fks: [TD.attachmentTwoId], previous_attachments_fks: [TD.attachmentTwoId]});
    ticket.save();
    store.push('attachment', {id: TD.attachmentTwoId});
    assert.equal(ticket.get('attachments').get('length'), 1);
    let json = TF.generate(TD.id);
    json.attachments = [TD.attachmentTwoId, TD.attachmentOneId];
    subject.deserialize(json, json.id);
    let ticket = store.find('ticket', TD.idOne);
    let attachments = ticket.get('attachments');
    assert.equal(attachments.get('length'), 2);
    assert.equal(attachments.objectAt(0).get('id'), TD.attachmentTwoId);
    assert.equal(attachments.objectAt(1).get('id'), TD.attachmentOneId);
    assert.ok(ticket.get('isNotDirty'));
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(store.find('attachment').get('length'), 2);
});

//TODO: when attachments can be deleted (from ticket) we need a "server is the truth" test that removes in-memory relationships
