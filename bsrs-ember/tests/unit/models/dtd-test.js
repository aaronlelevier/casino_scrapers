import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { dtd_payload } from 'bsrs-ember/tests/helpers/payloads/dtd';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TS from 'bsrs-ember/vendor/defaults/status';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import CD from 'bsrs-ember/vendor/defaults/category';
import TCD from 'bsrs-ember/vendor/defaults/model-category';

var store, dtd, dtd_2, link, priority, status, field;

module('unit: dtd test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-link', 'model:link', 'model:ticket-priority', 'model:ticket-status', 'model:field', 'model:dtd-field', 'model:option', 'model:field-option', 'model:attachment', 'model:category', 'model:model-category', 'service:i18n']);
    run(() => {
      dtd = store.push('dtd', {id: DTD.idOne, dtd_links_fks: [DTDL.idOne]});
      dtd_2 = store.push('dtd', {id: DTD.idTwo, destination_links: [LINK.idOne]});
      store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
      link = store.push('link', {id: LINK.idOne, destination_fk: DTD.idTwo});
      field = store.push('field', {id: FD.idOne, required: FD.requiredOne});
    });
  }
});

test('link_types - should be pre-defined on the model, so dont need to be pushed into the store', assert => {
  dtd = store.push('dtd', {id: DTD.idTwo});
  assert.equal(dtd.get('link_types').get('length'), 2);
  assert.equal(dtd.get('link_types')[0], DTD.linkTypeOne);
  assert.equal(dtd.get('link_types')[1], DTD.linkTypeTwo);
});

test('note_types - should be pre-defined on the model, so dont need to be pushed into the store', assert => {
  dtd = store.push('dtd', {id: DTD.idTwo});
  assert.equal(dtd.get('note_types').get('length'), 4);
  assert.equal(dtd.get('note_types')[0], DTD.noteTypeOne);
  assert.equal(dtd.get('note_types')[1], DTD.noteTypeTwo);
  assert.equal(dtd.get('note_types')[2], DTD.noteTypeThree);
  assert.equal(dtd.get('note_types')[3], DTD.noteTypeFour);
});

test('dtd_links_ids', (assert) => {
  assert.equal(dtd.get('dtd_links_ids').length, 1);
  assert.equal(LINK.idOne, dtd.get('dtd_links_ids')[0], 'x');
});

// Link

test('m2m dtd-link returns correct link models', (assert) => {
  run(() => {
    store.push('dtd-link', {id: DTDL.idTwo, dtd_pk: DTD.idTwo, link_pk: LINK.idTwo});
    store.push('link', {id: LINK.idTwo});
  });
  assert.equal(dtd.get('dtd_links').get('length'), 1);
  assert.equal(dtd.get('dtd_links').objectAt(0).get('id'), DTDL.idOne);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
});

test('m2m dtd-link returns update link models after m2m is removed', (assert) => {
  assert.equal(dtd.get('dtd_links').get('length'), 1);
  assert.equal(dtd.get('dtd_links').objectAt(0).get('id'), DTDL.idOne);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  run(() => {
    store.push('dtd-link', {id: DTDL.idOne, removed: true});
  });
  assert.equal(dtd.get('dtd_links').get('length'), 0);
  assert.equal(dtd.get('links').get('length'), 0);
});

test('add_link - dtd is clean if link is empty', (assert) => {
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.notOk(dtd.get('linksIsDirtyContainer'));
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_link({id: LINK.idTwo});
  assert.equal(dtd.get('links').get('length'), 2);
  assert.ok(!dtd.get('linksIsDirtyContainer'));
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    store.push('link', {id: LINK.idTwo, order: LINK.orderOne});
  });
  assert.ok(!dtd.get('linksIsDirtyContainer'));
  assert.ok(dtd.get('linksIsDirty'));
  // assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('remove_link - dtd is dirty when link is removed', (assert) => {
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_link(link.get('id'));
  assert.equal(dtd.get('links').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('the dtd model is dirty when you change a links request', (assert) => {
  assert.ok(!link.get('isDirty'));
  run(() => {
    store.push('link', {id: LINK.idOne, request: LINK.requestOne});
  });
  assert.ok(link.get('isDirty'));
  assert.ok(dtd.get('linksIsDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

// Field

test('m2m dtd-field returns correct field models', (assert) => {
  assert.equal(dtd.get('fields').get('length'), 0);
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne});
  });
  assert.equal(dtd.get('dtd_fields').get('length'), 1);
  assert.equal(dtd.get('dtd_fields').objectAt(0).get('id'), 1);
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.equal(dtd.get('fields').objectAt(0).get('id'), FD.idOne);
  // remove
  run(() => {
    store.push('dtd-field', {id: 1, removed: true});
  });
  assert.equal(dtd.get('fields').get('length'), 0);
});

test('field relationship is setup correctly', (assert) => {
  assert.ok(!field.get('field'));
  run(() => {
    field = store.push('field', {id: FD.idOne, field_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
  });
  assert.equal(dtd.get('dtd_fields').get('length'), 1);
  assert.equal(dtd.get('dtd_fields').objectAt(0).get('id'), 1);
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.equal(dtd.get('fields').objectAt(0).get('id'), FD.idOne);
});

test('add_field', (assert) => {
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_field({id: FD.idOne});
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_field', (assert) => {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
  });
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_field(FD.idOne);
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.equal(dtd.get('dtd_fields_fks').length, 1);
  assert.equal(dtd.get('dtd_fields_ids').length, 0);
  assert.ok(dtd.get('fieldsIsDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('if add_field but no type, then wont serialize and wont send in payload to server (saveRelated will remove it b/c invalid)', (assert) => {
  dtd.add_field({id: FD.idOne});
  const obj = dtd.serialize();
  assert.deepEqual(obj.fields, []);
});

// Priority

test('dtd is dirty when priority is changed on link model', (assert) => {
  assert.ok(!dtd.get('isDirtyOrRelatedDirty'));
  assert.ok(!link.get('priority'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
    priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
  });
  assert.equal(link.get('priority').get('id'), TP.priorityTwoId);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('dtd is dirty from priority cache breaking', (assert) => {
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
    priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
  });
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

// save

test('save - for Links and their Status and Priority', (assert) => {
  run(() => {
    store.push('ticket-priority', {id: TP.priorityOneId});
    store.push('ticket-status', {id: TD.statusOneId});
  });
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('dtd_links_fks').length, 1);
  assert.equal(dtd.get('dtd_links_ids').length, 1);
  dtd.remove_link(link.get('id'));
  assert.equal(dtd.get('links').get('length'), 0);
  assert.ok(dtd.get('linksIsDirty'));
  assert.ok(dtd.get('linksIsDirtyContainer'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.equal(dtd.get('dtd_links_fks').length, 1);
  assert.equal(dtd.get('dtd_links_ids').length, 0);
  dtd.save();
  // Links
  assert.equal(dtd.get('dtd_links_fks').length, 0);
  assert.equal(dtd.get('dtd_links_ids').length, 0);
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(!dtd.get('linksIsDirtyContainer'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_link({id: LINK.idTwo});
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idTwo);
  // priority
  priority = store.find('ticket-priority', TP.priorityOneId);
  assert.deepEqual(priority.get('links'), undefined);
  let link_two = store.find('link', LINK.idTwo);
  link_two.change_priority(priority.get('id'));
  assert.deepEqual(priority.get('links'), [LINK.idTwo]);
  assert.equal(dtd.get('links').objectAt(0).get('priority.id'), TP.priorityOneId);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  // status
  status = store.find('ticket-status', TD.statusOneId);
  assert.deepEqual(status.get('links'), undefined);
  link_two = store.find('link', LINK.idTwo);
  link_two.change_status(status.get('id'));
  assert.deepEqual(status.get('links'), [LINK.idTwo]);
  assert.equal(dtd.get('links').objectAt(0).get('status.id'), TD.statusOneId);
  // assertions
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.ok(link_two.get('isDirtyOrRelatedDirty'));
  assert.ok(link_two.get('priorityIsDirty'));
  assert.ok(link_two.get('statusIsDirty'));
  dtd.save();
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link_two.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link_two.get('priorityIsNotDirty'));
  assert.ok(link_two.get('statusIsNotDirty'));
});

test('save - Fields and Options', (assert) => {
  assert.equal(dtd.get('fields').get('length'), 0);
  dtd.add_field({id: FD.idOne});
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.save();
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  field = dtd.get('fields').objectAt(0);
  assert.equal(field.get('options').get('length'), 0);
  run(() => {
    store.push('option', {id: OD.idOne});
  });
  field.add_option({id: OD.idOne});
  assert.equal(field.get('options').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.save();
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('serialize dtd model and links with a priority', (assert) => {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      key: DTD.keyOne,
      description: DTD.descriptionOne,
      prompt: DTD.promptOne,
      note: DTD.noteOne,
      note_type: DTD.noteTypeOne,
      link_type: DTD.linkTypeOne
    });
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeOne, required: FD.requiredOne, order: FD.orderOne});
    dtd.add_field({id: FD.idOne});
    store.push('option', {id: OD.idOne, text: OD.textOne, order: OD.orderOne});
    field.add_option({id: OD.idOne});
    store.push('dtd', {id: DTD.idTwo, destination_links: [LINK.idOne]});
    link = store.push('link', {
      id: LINK.idOne, 
      order: LINK.orderOne,
      action_button: LINK.action_buttonOne,
      is_header: LINK.is_headerOne,
      request: LINK.requestOne,
      text: LINK.textOne,
      priority_fk: TP.priorityOneId,
      status_fk: TD.statusOneId,
      destination_fk: DTD.idTwo
    });
    store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
    store.push('category', {id: CD.idOne, name: CD.nameOne, label: CD.labelOne});
  });
  assert.equal(dtd.get('links').objectAt(0).get('id'), LINK.idOne);
  assert.equal(dtd.get('fields').objectAt(0).get('id'), FD.idOne);
  let payload;
  run(() => {
    payload = dtd.serialize();
  });
  assert.equal(payload['links'][0]['id'], dtd_payload.links[0].id);
  assert.equal(payload['links'][0]['priority'], dtd_payload.links[0].priority);
  assert.equal(payload['links'][0]['status'], dtd_payload.links[0].status);
  assert.equal(payload['links'][0]['destination'], dtd_payload.links[0].destination);
  assert.equal(payload['links'][0]['categories'][0], CD.idOne);
  // field
  field = dtd.get('fields').objectAt(0);
  assert.equal(payload['fields'][0]['id'], FD.idOne);
  assert.equal(payload['fields'][0]['label'], FD.labelOne);
  assert.equal(payload['fields'][0]['type'], FD.typeOne);
  assert.equal(payload['fields'][0]['required'], FD.requiredOne);
  assert.equal(payload['fields'][0]['order'], FD.orderOne);
  // options
  assert.equal(payload['fields'][0]['options'][0]['id'], OD.idOne);
  assert.equal(payload['fields'][0]['options'][0]['text'], OD.textOne);
  assert.equal(payload['fields'][0]['options'][0]['order'], OD.orderOne);
});

test('rollback for related links', (assert) => {
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    store.push('link', {id: LINK.idOne, request: LINK.requestTwo});
  });
  assert.ok(link.get('isDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback for related links priority', (assert) => {
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne});
  });
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback for related fields', (assert) => {
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 0);
  dtd.add_field({id: FD.idOne});
  assert.equal(dtd.get('fields').get('length'), 1);
  field = dtd.get('fields').objectAt(0);
  assert.ok(field.get('isNotDirty'));
  store.push('field', {id: FD.idOne, required: FD.requiredTwo});
  assert.ok(field.get('isDirty'));
  assert.ok(dtd.get('fieldsIsDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(store.find('field').get('length'), 1);
  field = store.findOne('field');
  assert.ok(field.get('isNotDirty'));
});

test('rollback for related fields and their options', (assert) => {
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 0);
  dtd.add_field({id: FD.idOne});
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  // Add an Option to the Field
  field = dtd.get('fields').objectAt(0);
  field.add_option({id: OD.idOne});
  assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(field.get('optionsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(field.get('options').objectAt(0).get('isNotDirty'));
  run(() => {
    store.push('option', {id: OD.idOne, text: OD.textOne});
  });
  assert.ok(field.get('options').objectAt(0).get('isDirty'));
  dtd.rollback();
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(field.get('optionsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(field.get('options').get('length'), 0);
  assert.equal(store.find('option').get('length'), 1);
  assert.ok(store.findOne('option').get('isNotDirty'));
});

test('save and rollback combined test', (assert) => {
  assert.equal(dtd.get('links').objectAt(0).get('id'), link.get('id'));
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), dtd_2.get('id'));
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), dtd_2.get('id'));
  assert.ok(dtd.get('links').objectAt(0).get('destinationIsNotDirty'));
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  // Field
  assert.equal(dtd.get('fields').get('length'), 0);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  dtd.add_field({id: FD.idOne});
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.ok(dtd.get('fieldsIsNotDirty'));
  // Link
  assert.equal(dtd.get('links').get('length'), 1);
  assert.ok(dtd.get('linksIsNotDirty'));
  dtd.add_link({id: LINK.idTwo});
  assert.equal(dtd.get('links').get('length'), 2);
  assert.ok(dtd.get('linksIsNotDirty'));
  link = dtd.get('links').objectAt(0);
  const link_2 = dtd.get('links').objectAt(1);
  link_2.change_destination({id: DTD.idOne});
  // Priority
  link.change_priority(TP.idOne);
  assert.equal(link.get('priority.id'), TP.idOne);
  link.change_status(TS.idOne);
  assert.equal(link.get('status.id'), TS.idOne);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), dtd_2.get('id'));
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), dtd_2.get('id'));
  assert.equal(dtd.get('links').objectAt(1).get('destination_fk'), undefined);
  assert.equal(dtd.get('links').objectAt(1).get('destination.id'), dtd.get('id'));
  dtd.save();
  assert.equal(dtd.get('links').objectAt(0).get('destination_fk'), dtd_2.get('id'));
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), dtd_2.get('id'));
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_field({id: FD.idTwo});
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.equal(dtd.get('fields').get('length'), 2);
  assert.ok(dtd.get('linksIsNotDirty'));
  dtd.remove_link(LINK.idOne);
  assert.ok(dtd.get('linksIsDirty'));
  assert.equal(dtd.get('links').get('length'), 1);
  link.change_priority(TP.idTwo);
  assert.equal(link.get('priority.id'), TP.idTwo);
  link.change_status(TS.idTwo);
  assert.equal(link.get('status.id'), TS.idTwo);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  // rollback
  assert.equal(dtd.get('fields').get('length'), 1);
  assert.equal(dtd.get('links').get('length'), 2);
  assert.equal(link.get('priority.id'), TP.idOne);
  assert.equal(link.get('status.id'), TS.idOne);
  assert.ok(dtd.get('linksIsNotDirty'));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

//ATTACHMENT

test('attachments property returns associated array or empty array', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: []});
  assert.equal(dtd.get('attachments').get('length'), 0);
  run(() => {
    store.push('attachment', {id: 8});
    store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8]});
  });
  assert.equal(dtd.get('attachments').get('length'), 1);
  run(() => {
    store.push('attachment', {id: 9});
  });
  assert.equal(dtd.get('attachments').get('length'), 1);
  run(() => {
    store.push('attachment', {id: 7});
    dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8, 7]});
  });
  assert.equal(dtd.get('attachments').get('length'), 2);
});

test('add_attachment will add the attachment id to the dtds fks array', function(assert) {
  dtd = store.push('dtd', {id: DTD.idOne});
  store.push('attachment', {id: 8});
  assert.equal(dtd.get('attachments').get('length'), 0);
  dtd.add_attachment(8);
  assert.deepEqual(dtd.get('current_attachment_fks'), [8]);
  assert.equal(dtd.get('attachments').get('length'), 1);
  dtd.add_attachment(8);
  assert.deepEqual(dtd.get('current_attachment_fks'), [8]);
  assert.equal(dtd.get('attachments').get('length'), 1);
});

test('remove_attachment will remove dtd_fk from the attachment', function(assert) {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8]});
  store.push('attachment', {id: 8});
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.deepEqual(dtd.get('current_attachment_fks'), [8]);
  dtd.remove_attachment(8);
  assert.deepEqual(dtd.get('current_attachment_fks'), []);
  assert.equal(dtd.get('attachments').get('length'), 0);
  dtd.remove_attachment(8);
  assert.deepEqual(dtd.get('current_attachment_fks'), []);
  assert.equal(dtd.get('attachments').get('length'), 0);
});

test('add and remove attachment work as expected', function(assert) {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: []});
  store.push('attachment', {id: 8});
  assert.equal(dtd.get('attachments').get('length'), 0);
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  dtd.add_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 1);
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
});

test('dtd is dirty or related is dirty when attachment is added or removed (starting with none)', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [], previous_attachments_fks: []});
  store.push('attachment', {id: 8});
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_attachment(8);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('dtd is dirty or related is dirty when attachment is added or removed (starting with one attachment)', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  store.push('attachment', {id: 8, dtd_fk: DTD.idOne});
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.add_attachment(8);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback attachments will revert and reboot the dirty attachments to clean', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  store.push('attachment', {id: 8, dtd_fk: DTD.idOne});
  store.push('attachment', {id: 9});
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_attachment(9);
  assert.equal(dtd.get('attachments').get('length'), 2);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.rollback();
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_attachment(9);
  assert.equal(dtd.get('attachments').get('length'), 2);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.save();
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('attachments').get('length'), 2);
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.save();
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('attachments').get('length'), 1);
});

test('attachments should be dirty even when the number of previous matches current', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [8], previous_attachments_fks: [8]});
  store.push('attachment', {id: 8, dtd_fk: DTD.idOne});
  store.push('attachment', {id: 9});
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.remove_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.add_attachment(9);
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('dtd is not dirty after save and save related (starting with none)', (assert) => {
  dtd = store.push('dtd', {id: DTD.idOne, current_attachment_fks: [], previous_attachments_fks: []});
  store.push('attachment', {id: 8});
  assert.equal(dtd.get('attachments').get('length'), 0);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  dtd.add_attachment(8);
  assert.equal(dtd.get('attachments').get('length'), 1);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  dtd.save();
  dtd.save();
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(dtd.get('attachments').get('length'), 1);
});
