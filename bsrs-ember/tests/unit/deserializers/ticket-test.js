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
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import ProviderD from 'bsrs-ember/vendor/defaults/provider';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TicketDeserializer from 'bsrs-ember/deserializers/ticket';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WorkOrderDeserializer from 'bsrs-ember/deserializers/work-order';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import WORK_ORDER from 'bsrs-ember/vendor/defaults/work-order';

const PD = PERSON_DEFAULTS.defaults();
const WOSD = WORK_ORDER_STATUSES.defaults();
const WD = WORK_ORDER.defaults();

let store, subject, uuid, ticket_priority, ticket_status, ticket, functionalStore;

module('unit: ticket deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket',
      'model:ticket-list', 'model:person-list', 'model:ticket-join-person',
      'model:model-category', 'model:ticket-status', 'model:ticket-priority',
      'model:status', 'model:location', 'model:location-list','model:person-location',
      'model:person', 'model:category', 'model:uuid', 'model:location-level',
      'model:attachment', 'model:location-status', 'service:person-current',
      'service:translations-fetcher', 'service:i18n', 'service:currency', 'model:locale', 'model:role',
      'model:general-status-list', 'model:ticket-priority-list', 'model:category-list',
      'model:category-children', 'model:generic-join-attachment','model:work-order',
      'model:related-person', 'model:related-location', 'validator:presence',
      'validator:length', 'validator:ticket-status', 'validator:ticket-categories',
      'model:ticket-join-wo', 'model:currency', 'model:work-order-status', 'model:provider']);
    uuid = this.container.lookup('model:uuid');
    functionalStore = this.container.lookup('service:functional-store');
    const currency = this.container.lookup('service:currency');
    const workOrderDeserializer = WorkOrderDeserializer.create({ simpleStore: store, currency: currency });
    subject = TicketDeserializer.create({simpleStore: store, currency: currency, functionalStore: functionalStore,
      workOrderDeserializer: workOrderDeserializer, uuid: uuid});
    run(() => {
      store.push('related-location', {id: LD.idOne, person_locations_fks: [PERSON_LD.idOne]});
      ticket_priority = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne, tickets: [TD.idOne]});
      ticket_status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, tickets: [TD.idOne]});
      store.push('ticket-status', {id: TD.statusSevenId, name: TD.statusSeven, tickets: []});
      ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId, status_fk: TD.statusOneId});
      store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
      store.push('status', {id: SD.activeId, name: SD.activeName});
      store.push('role', {id: RD.idOne, name: RD.nameOne, location_level_fk: LLD.idOne});
      store.push('currency', { id: CD.idOne, name: CD.name, decimal_digits: 2 });
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

// ASSIGNEE
test('ticket assignee will be deserialized into its own store with no assignee (detail)', (assert) => {
  let json = TF.generate(TD.idOne);
  json.assignee = null;
  run(() => {
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
  run(() => {
    subject.deserialize(response);
  });
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee_fk'), undefined);
  assert.equal(ticket.get('assignee'), undefined);
});

test('deserialize detail with no existing assignee (detail)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(() => {
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
  store.push('related-person', {id: PD.unusedId, assigned_tickets: [TD.idOne]});
  assert.equal(ticket.get('assignee').get('id'), PD.unusedId);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  let json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, json.id);
  });
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').get('id'), PD.idOne);
});

test('deserialize list with no existing assignee (list)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  ticket = functionalStore.find('ticket-list', TD.idOne);
  const people = store.find('person-list');
  assert.equal(people.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').id, PD.idOne);
});

test('ticket assignee setups properly with embedded photo', (assert) => {
  let response = TF.generate(TD.idOne);
  response.assignee.photo = {id: '9', image_thumbnail: 'wat.jpg'};
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  // photo is setup correctly w/ no related attachment model
  let assignee = ticket.get('assignee');
  assert.ok(assignee.photo.id);
  assert.ok(assignee.photo.image_thumbnail);
});

test('ticket assignee setups properly with no photo', (assert) => {
  let response = TF.generate(TD.idOne);
  response.cc.forEach(person => delete person.photo);
  delete response.assignee.photo;
  let assignee = ticket.get('assignee');
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('assignee').photo, undefined, 'photo is not related to assignee');
});

test('ticket location will be deserialized into its own store when deserialize list is invoked (when ticket did not exist before)', (assert) => {
  let json = TF.generate_list(TD.idOne);
  delete json.cc;
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  let location = store.findOne('location-list');
  assert.deepEqual(location.get('length'), undefined);
  ticket = functionalStore.find('ticket-list', TD.idOne);
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing non-wired location model)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('related-location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (when ticket did not have location)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, TD.idOne);
  });
  let location = store.findOne('related-location');
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be deserialized into its own store when deserialize detail is invoked (with existing already-wired location model)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('related-location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('location.id'), LD.idOne);
});

test('ticket location will be updated when server returns different location (detail)', (assert) => {
  let location;
  ticket.set('location_fk', LD.idOne);
  ticket.save();
  location = store.push('related-location', {id: LD.idOne, name: LD.storeName, tickets: [TD.idOne]});
  let json = TF.generate(TD.idOne);
  json.location = {id: LD.idTwo, name: LD.storeNameTwo, location_level: LLD.idOne};
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(location.get('tickets'), []);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('location_fk'), LD.idTwo);
  assert.equal(ticket.get('location.id'), LD.idTwo);
});

test('ticket priority will be deserialized into its own store when deserialize detail is invoked (when ticket did not exist before)', (assert) => {
  let json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, TD.idOne);
  });
  assert.deepEqual(ticket_priority.get('tickets'), [TD.idOne]);
  ticket = store.find('ticket', TD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('priority.id'), TD.priorityOneId);
});

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
  run(() => {
    subject.deserialize(response);
  });
  ticket = functionalStore.find('ticket-list', TD.idOne);
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.equal(ticket.status.id, TD.statusOneId);
});

/* TICKET TO STATUS */
test('ticket status will be deserialized into its own store when deserialize detail is invoked', (assert) => {
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('status.id'), TD.statusOneId);
});

test('ticket status will be updated when server returns same status (single)', (assert) => {
  let json = TF.generate(TD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(json, ticket.get('id'));
  });
  assert.deepEqual(ticket_status.get('tickets'), [TD.idOne]);
  assert.ok(ticket.get('isNotDirty'));
  assert.equal(ticket.get('status.id'), TD.statusOneId);
});

/*TICKET PERSON M2M CC*/
test('ticket-join-person m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  let response = TF.generate(TD.idOne);
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
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
  store.push('ticket-join-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, related_person_pk: PD.id});
  store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  assert.equal(ticket.get('cc.length'), 1);
  let response = TF.generate(TD.idOne);
  let second_person = PF.get_no_related(PD.unusedId);
  response.cc = [PF.get_no_related(), second_person];
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
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
  store.push('ticket-join-person', {id: TICKET_PERSON_DEFAULTS.idOne, ticket_pk: TD.idOne, related_person_pk: PD.id});
  store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  assert.equal(ticket.get('cc').get('length'), 1);
  let response = TF.generate(TD.id);
  let second_person = PF.get_no_related(PD.unusedId);
  let third_person = PF.get_no_related(PD.idTwo);
  response.cc = [second_person, third_person];
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
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
  assert.equal(cc.objectAt(0).get('id'), PD.idOne);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('ticket-join-person').get('length'), 1);
});

test('ticket cc setups properly with embedded photo', (assert) => {
  let response = TF.generate(TD.idOne);
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  cc = ticket.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.equal(ticket.get('isNotDirtyOrRelatedNotDirty'), true);
  // photo is setup correctly
  assert.ok(cc.objectAt(0).photo.id);
  assert.ok(cc.objectAt(0).photo.image_thumbnail);
});

test('ticket cc setups properly with no photo', (assert) => {
  let response = TF.generate(TD.idOne);
  response.cc.forEach(person => delete person.photo);
  delete response.assignee.photo;
  let cc = ticket.get('cc');
  assert.equal(cc.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  cc = ticket.get('cc');
  assert.equal(cc.get('length'), 1);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(ticket.get('cc').objectAt(0).photo, undefined, 'photo is not related to photo');
});

/*TICKET CATEGORY M2M*/
test('model-category m2m is set up correctly using deserialize single (starting with no m2m relationship)', (assert) => {
  let response = TF.generate(TD.idOne);
  let categories = ticket.get('categories');
  assert.equal(categories.get('length'), 0);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
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
  assert.equal(categories.objectAt(0).get('cost_amount'), CD.costAmountOne);
  assert.equal(categories.objectAt(0).get('cost_currency'), CD.currency);
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

test('if category has inherited, it will be formated', (assert) => {
  let response = TF.generate(TD.idOne);
  response.categories[0].cost_amount = null;
  response.categories[0]['inherited'] = {
    'cost_amount': {
      'inherited_value': 100
    }
  };
  run(() => {
    subject.deserialize(response, TD.idOne);
  });
  let original = store.find('ticket', TD.idOne);
  let categories = original.get('sorted_categories');
  assert.equal(categories.objectAt(0).get('inherited.cost_amount.inherited_value'), '100');
  assert.ok(original.get('isNotDirty'));
  assert.ok(original.get('isNotDirtyOrRelatedNotDirty'));
});

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
  run(() => {
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

test('model-category m2m added even when ticket did not exist before the deserializer executes (single)', (assert) => {
  let response = TF.generate(TD.idOne);
  response.categories.splice(1, 1);
  run(() => {
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

test('category deserialized into string of categories sorted by level', (assert) => {
  let json = TF.generate_list(TD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  ticket = functionalStore.find('ticket-list', TD.idOne);
  assert.equal(ticket.categories, 'Repair &#8226; Plumbing &#8226; Toilet Leak');
});

test('attachment added for each attachment on ticket', (assert) => {
  let json = TF.generate(TD.idOne);
  json.attachments = [TD.attachmentOneId];
  run(() => {
    subject.deserialize(json, json.id);
  });
  ticket = store.find('ticket', TD.idOne);
  let attachments = ticket.get('attachments');
  assert.equal(attachments.get('length'), 1);
  assert.equal(attachments.objectAt(0).get('id'), TD.attachmentOneId);
  assert.ok(ticket.get('isNotDirty'));
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
});

test('attachment added for each attachment on ticket (when ticket has existing attachments)', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne, generic_attachments_fks: [8]});
  store.push('generic-join-attachment', {id: 4, attachment_pk: TD.attachmentTwoId, generic_pk: TD.idOne});
  ticket.save();
  store.push('attachment', {id: TD.attachmentTwoId});
  assert.equal(ticket.get('attachments').get('length'), 1);
  let json = TF.generate(TD.id);
  json.attachments = [TD.attachmentTwoId, TD.attachmentOneId];
  run(() => {
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

test('deserialize detail with one work order and no existing locally', (assert) => {
  const json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, json.id);
  });
  assert.equal(ticket.get('wo').get('length'), 1);
  assert.equal(ticket.get('wo').objectAt(0).get('id'), WD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  const workOrder = store.find('work-order', WD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize detail with one work order and existing locally', (assert) => {
  store.push('ticket-join-wo', {id: 1, ticket_pk: TD.idOne, work_order_pk: WD.idOne});
  ticket = store.push('ticket', {id: TD.idOne, ticket_wo_fks: [1]});
  store.push('work-order', {id: WD.idOne});
  const json = TF.generate(TD.idOne);
  run(() => {
    subject.deserialize(json, json.id);
  });
  assert.equal(ticket.get('wo').get('length'), 1);
  assert.equal(ticket.get('wo').objectAt(0).get('id'), WD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  const workOrder = store.find('work-order', WD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize detail with multiple work orders', (assert) => {
  const json = TF.generate(TD.idOne);
  json.work_orders.push({ id: WD.idTwo, cost_estimate_currency: { id: CurrencyD.idOne }, 
    status: {id: WOSD.idOne, name: WOSD.nameFive}, category: { id: CD.idOne }, provider: { id: ProviderD.idOne }, approver: { id: PD.idOne }});
  store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
  run(() => {
    subject.deserialize(json, json.id);
  });
  assert.equal(ticket.get('wo').get('length'), 2);
  assert.equal(ticket.get('wo').objectAt(0).get('id'), WD.idTwo);
  assert.equal(ticket.get('wo').objectAt(1).get('id'), WD.idOne);
  assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  const workOrder = store.find('work-order', WD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  const workOrder2 = store.find('work-order', WD.idTwo);
  assert.ok(workOrder2.get('isNotDirtyOrRelatedNotDirty'));
});

//TODO: when attachments can be deleted (from ticket) we need a "server is the truth" test that removes in-memory relationships
