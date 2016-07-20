import Ember from 'ember';
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';

var store, activity, run = Ember.run;

module('unit: activity test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/cc-add', 'model:activity/cc-remove', 'model:activity/assignee', 'model:activity/person', 'model:ticket', 'model:ticket-status', 'model:ticket-priority', 'model:activity/category-to', 'model:activity/category-from', 'model:activity/attachment-add', 'model:activity/attachment-remove']);
  }
});

test('to returns associated model or undefined (assignee type)', (assert) => {
  activity = store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee', to_fk: 2, from_fk: 3});
  store.push('activity/assignee', {id: 3, fullname: 'y'});
  store.push('activity/assignee', {id: 2, fullname: 'x'});
  let to = activity.get('to');
  assert.equal(to.get('id'), 2);
  assert.equal(to.get('fullname'), 'x');
  activity.set('to_fk', 3);
  to = activity.get('to');
  assert.equal(to.get('id'), 3);
  activity.set('to_fk', 9);
  to = activity.get('to');
  assert.equal(to, undefined);
});

test('to returns associated model or undefined (status type)', (assert) => {
  activity = store.push('activity', {id: TAD.idStatusOne, type: 'status', to_fk: TD.statusTwoId, from_fk: TD.statusOneId});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
  let to = activity.get('to');
  assert.equal(to.get('id'), TD.statusTwoId);
  assert.equal(to.get('name'), TD.statusTwo);
  activity.set('to_fk', TD.statusOneId);
  to = activity.get('to');
  assert.equal(to.get('id'), TD.statusOneId);
  activity.set('to_fk', 9);
  to = activity.get('to');
  assert.equal(to, undefined);
});

test('from returns associated model or undefined (assignee type)', (assert) => {
  activity = store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee', to_fk: 2, from_fk: 3});
  store.push('activity/assignee', {id: 2, fullname: 'x'});
  store.push('activity/assignee', {id: 3, fullname: 'y'});
  let from = activity.get('from');
  assert.equal(from.get('id'), 3);
  assert.equal(from.get('fullname'), 'y');
  activity.set('from_fk', 2);
  from = activity.get('from');
  assert.equal(from.get('id'), 2);
  activity.set('from_fk', 9);
  from = activity.get('from');
  assert.equal(from, undefined);
});

test('from returns associated model or undefined (status type)', (assert) => {
  activity = store.push('activity', {id: TAD.idStatusOne, type: 'status', to_fk: TD.statusTwoId, from_fk: TD.statusOneId});
  store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
  store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
  let from = activity.get('from');
  assert.ok(from);
  assert.equal(from.get('id'), TD.statusOneId);
  assert.equal(from.get('name'), TD.statusOne);
  activity.set('from_fk', TD.statusTwoId);
  from = activity.get('from');
  assert.equal(from.get('id'), TD.statusTwoId);
  activity.set('from_fk', 9);
  from = activity.get('from');
  assert.equal(from, undefined);
});

test('to returns associated model or undefined (priority type)', (assert) => {
  activity = store.push('activity', {id: TAD.idPriorityOne, type: 'priority', to_fk: TD.priorityTwoId, from_fk: TD.priorityOneId});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
  let to = activity.get('to');
  assert.equal(to.get('id'), TD.priorityTwoId);
  assert.equal(to.get('name'), TD.priorityTwo);
  activity.set('to_fk', TD.priorityOneId);
  to = activity.get('to');
  assert.equal(to.get('id'), TD.priorityOneId);
  activity.set('to_fk', 9);
  to = activity.get('to');
  assert.equal(to, undefined);
});

test('from returns associated model or undefined (priority type)', (assert) => {
  activity = store.push('activity', {id: TAD.idPriorityOne, type: 'priority', to_fk: TD.priorityTwoId, from_fk: TD.priorityOneId});
  store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
  store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
  let from = activity.get('from');
  assert.ok(from);
  assert.equal(from.get('id'), TD.priorityOneId);
  assert.equal(from.get('name'), TD.priorityOne);
  activity.set('from_fk', TD.priorityTwoId);
  from = activity.get('from');
  assert.equal(from.get('id'), TD.priorityTwoId);
  activity.set('from_fk', 9);
  from = activity.get('from');
  assert.equal(from, undefined);
});

test('category returns associated model or undefined', (assert) => {
  activity = store.push('activity', {id: TAD.idCategoryOne, type: 'categories'});
  store.push('activity/category-to', {id: CD.idOne, name: CD.nameOne, parent: null, activities: [TAD.idCategoryOne]});
  store.push('activity/category-from', {id: CD.idTwo, name: CD.nameTwo, parent: CD.nameOne, activities: [TAD.idCategoryOne]});
  let categories_to = activity.get('categories_to');
  let categories_from = activity.get('categories_from');
  assert.equal(categories_to.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories_from.objectAt(0).get('id'), CD.idTwo);
});

test('person returns associated model or undefined', (assert) => {
  activity = store.push('activity', {id: TAD.idCreate, type: 'assignee', person_fk: PD.idOne});
  store.push('activity/person', {id: PD.idOne, fullname: PD.fullname});
  store.push('activity/person', {id: 3, fullname: 'y'});
  let person = activity.get('person');
  assert.equal(person.get('id'), PD.idOne);
  activity.set('person_fk', 3);
  person = activity.get('person');
  assert.equal(person.get('id'), 3);
  activity.set('person_fk', PD.idOne);
  person = activity.get('person');
  assert.equal(person.get('id'), PD.idOne);
});

test('added returns associated array of cc or empty array (cc_add type)', (assert) => {
  activity = store.push('activity', {id: TAD.idCcAddOne, type: 'cc_add'});
  let three = store.push('activity/cc-add', {id: 3, fullname: 'm', activities: [TAD.idCcAddOne]});
  store.push('activity/cc-add', {id: 2, fullname: 'n', activities: []});
  let one = store.push('activity/cc-add', {id: 1, fullname: 'o', activities: [999, TAD.idCcAddOne]});
  let added = activity.get('added');
  assert.equal(added.get('length'), 2);
  assert.equal(added.objectAt(0).get('id'), 3);
  assert.equal(added.objectAt(0).get('fullname'), 'm');
  assert.equal(added.objectAt(1).get('id'), 1);
  assert.equal(added.objectAt(1).get('fullname'), 'o');
  run(function() {
    store.push('activity/cc-add', {id: three.get('id'), activities: []});
  });
  added = activity.get('added');
  assert.equal(added.get('length'), 1);
  assert.equal(added.objectAt(0).get('id'), 1);
  assert.equal(added.objectAt(0).get('fullname'), 'o');
  run(function() {
    store.push('activity/cc-add', {id: one.get('id'), activities: []});
  });
  added = activity.get('added');
  assert.equal(added.get('length'), 0);
});

test('remove returns associated array of cc or empty array (cc_removed type)', (assert) => {
  activity = store.push('activity', {id: TAD.idCcAddOne, type: 'cc_remove'});
  let three = store.push('activity/cc-remove', {id: 3, fullname: 'm', activities: [TAD.idCcAddOne]});
  store.push('activity/cc-remove', {id: 2, fullname: 'n', activities: []});
  let one = store.push('activity/cc-remove', {id: 1, fullname: 'o', activities: [999, TAD.idCcAddOne]});
  let removed = activity.get('removed');
  assert.equal(removed.get('length'), 2);
  assert.equal(removed.objectAt(0).get('id'), 3);
  assert.equal(removed.objectAt(0).get('fullname'), 'm');
  assert.equal(removed.objectAt(1).get('id'), 1);
  assert.equal(removed.objectAt(1).get('fullname'), 'o');
  run(function() {
    store.push('activity/cc-remove', {id: three.get('id'), activities: []});
  });
  removed = activity.get('removed');
  assert.equal(removed.get('length'), 1);
  assert.equal(removed.objectAt(0).get('id'), 1);
  assert.equal(removed.objectAt(0).get('fullname'), 'o');
  run(function() {
    store.push('activity/cc-remove', {id: one.get('id'), activities: []});
  });
  removed = activity.get('removed');
  assert.equal(removed.get('length'), 0);
});

test('added_attachment returns associated array of attachments or empty array (attachment_add type)', (assert) => {
  activity = store.push('activity', {id: TAD.idAttachmentAddOne, type: 'attachment_add'});
  let three = store.push('activity/attachment-add', {id: 3, filename: 'm', activities: [TAD.idAttachmentAddOne]});
  store.push('activity/attachment-add', {id: 2, filename: 'n', activities: []});
  let one = store.push('activity/attachment-add', {id: 1, filename: 'o', activities: [999, TAD.idAttachmentAddOne]});
  let added_attachment = activity.get('added_attachment');
  assert.equal(added_attachment.get('length'), 2);
  assert.equal(added_attachment.objectAt(0).get('id'), 3);
  assert.equal(added_attachment.objectAt(0).get('filename'), 'm');
  assert.equal(added_attachment.objectAt(1).get('id'), 1);
  assert.equal(added_attachment.objectAt(1).get('filename'), 'o');
  run(function() {
    store.push('activity/attachment-add', {id: three.get('id'), activities: []});
  });
  added_attachment = activity.get('added_attachment');
  assert.equal(added_attachment.get('length'), 1);
  assert.equal(added_attachment.objectAt(0).get('id'), 1);
  assert.equal(added_attachment.objectAt(0).get('filename'), 'o');
  run(function() {
    store.push('activity/attachment-add', {id: one.get('id'), activities: []});
  });
  added_attachment = activity.get('added_attachment');
  assert.equal(added_attachment.get('length'), 0);
});

test('removed_attachment returns associated array of attachments or empty array (attachment_remove type)', (assert) => {
  activity = store.push('activity', {id: TAD.idAttachmentRemoveOne, type: 'attachment_remove'});
  let three = store.push('activity/attachment-remove', {id: 3, filename: 'm', activities: [TAD.idAttachmentRemoveOne]});
  store.push('activity/attachment-remove', {id: 2, filename: 'n', activities: []});
  let one = store.push('activity/attachment-remove', {id: 1, filename: 'o', activities: [999, TAD.idAttachmentRemoveOne]});
  let removed_attachment = activity.get('removed_attachment');
  assert.equal(removed_attachment.get('length'), 2);
  assert.equal(removed_attachment.objectAt(0).get('id'), 3);
  assert.equal(removed_attachment.objectAt(0).get('filename'), 'm');
  assert.equal(removed_attachment.objectAt(1).get('id'), 1);
  assert.equal(removed_attachment.objectAt(1).get('filename'), 'o');
  run(function() {
    store.push('activity/attachment-remove', {id: three.get('id'), activities: []});
  });
  removed_attachment = activity.get('removed_attachment');
  assert.equal(removed_attachment.get('length'), 1);
  assert.equal(removed_attachment.objectAt(0).get('id'), 1);
  assert.equal(removed_attachment.objectAt(0).get('filename'), 'o');
  run(function() {
    store.push('activity/attachment-remove', {id: one.get('id'), activities: []});
  });
  removed_attachment = activity.get('removed_attachment');
  assert.equal(removed_attachment.get('length'), 0);
});
